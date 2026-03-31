import numpy as np
import cv2
from tensorflow.keras.models import load_model

model = load_model("brain_tumor_model.h5")

IMG_SIZE = 224

def predict_image(image):
    resized = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
    normalized = resized / 255.0
    input_img = np.expand_dims(normalized, axis=0)

    prediction = model.predict(input_img)[0][0]

    if prediction > 0.5:
        return "Tumor Detected", float(prediction)
    else:
        return "No Tumor", float(1 - prediction)