from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K
from PIL import Image
from io import BytesIO
import cv2
import base64
import time

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model("brain_tumor_model.h5", compile=False)


# =========================
# 🔥 FIXED GRAD-CAM
# =========================
def get_last_conv_layer(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    return None


def make_gradcam(model, img_array):
    last_conv_layer_name = get_last_conv_layer(model)

    if last_conv_layer_name is None:
        return None

    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)

    if grads is None:
        return None

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)

    return heatmap.numpy()


# =========================
# 🔥 VISUALIZATION
# =========================
def create_output(original_image, heatmap, has_tumor):
    original = np.uint8(original_image * 255)

    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(original, 0.6, heatmap_color, 0.4, 0)

    bbox_rect = None

    # =========================
    # 🔥 BOUNDING BOX (ROBUST)
    # =========================
    if has_tumor:
        # adaptive threshold (IMPORTANT FIX)
        threshold = np.mean(heatmap) + 0.5 * np.std(heatmap)

        binary = np.uint8(heatmap > threshold) * 255

        kernel = np.ones((3,3), np.uint8)
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(
            binary,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        if contours:
            largest = max(contours, key=cv2.contourArea)

            if cv2.contourArea(largest) > 30:
                x, y, w, h = cv2.boundingRect(largest)
                bbox_rect = {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}

                cv2.rectangle(
                    overlay,
                    (x, y),
                    (x + w, y + h),
                    (0, 255, 0),
                    2
                )

    _, buffer = cv2.imencode(".png", overlay)
    return base64.b64encode(buffer).decode(), bbox_rect


# =========================
# 🔍 PREDICT
# =========================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start = time.time()

    contents = await file.read()

    img = Image.open(BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))
    img = np.array(img) / 255.0

    x = np.expand_dims(img, axis=0)

    prediction = model.predict(x)[0][0]

    has_tumor = prediction > 0.5

    result = "Tumor Detected" if has_tumor else "No Tumor"
    confidence = float(prediction if has_tumor else 1 - prediction)

    # 🔥 Grad-CAM
    heatmap = make_gradcam(model, x)

    if heatmap is None:
        return {
            "prediction": result,
            "confidence": round(confidence * 100, 2),
            "heatmap": None,
            "bbox": None,
            "error": "Grad-CAM failed"
        }

    # 🔥 overlay + bbox
    output_img, bbox_rect = create_output(img, heatmap, has_tumor)

    end = time.time()

    return {
        "prediction": result,
        "confidence": round(confidence * 100, 2),
        "analysis_time": round(end - start, 2),
        "heatmap": output_img,
        "bbox": bbox_rect
    }