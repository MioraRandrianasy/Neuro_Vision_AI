import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const handleUpload = async (file) => {
    if (!file) return;

    setImageURL(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🧠 AI Medical Imaging Assistant</h1>

      <p className="subtitle">
        Detecting brain tumors from MRI using deep learning
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files[0])}
      />

      {imageURL && (
        <div className="image-preview">
          <img src={imageURL} alt="preview" />
        </div>
      )}

      {loading && <p className="loading">Analyzing...</p>}

      {result && (
        <div className="result-box">
          <h2>{result.prediction}</h2>
          <p>Confidence: {result.confidence}%</p>
          <p>Analysis Time: {result.analysis_time}</p>
        </div>
      )}

      <p className="disclaimer">
        ⚠️ For educational use only
      </p>
    </div>
  );
}