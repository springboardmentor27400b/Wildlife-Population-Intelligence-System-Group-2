import { useState } from "react";

function DiseaseDetection() {
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);

const handleImage = (e) => {
  setImage(e.target.files[0]);
};

  const detectDisease = () => {
    setResult({
      disease: "Foot and Mouth Disease",
      confidence: 97.4,
      severity: "High",
      treatment: "Immediate veterinary treatment recommended.",
      prevention: "Vaccination and isolation.",
    });
  };

  return (
    <div className="disease">
      <h1>AI Animal Disease Detection</h1>

     <input
  type="file"
  accept="image/*"
  onChange={handleImage}
/>
{image && (
  <img
    src={URL.createObjectURL(image)}
    alt="Preview"
    width="300"
    style={{ marginTop: "20px", borderRadius: "10px" }}
  />
)}

      <br /><br />

      <button onClick={detectDisease}>
        Detect Disease
      </button>

      {result && (
        <div className="prediction-card">
          <h2>🦠 Detection Result</h2>

          <p><b>Disease:</b> {result.disease}</p>

          <p><b>Confidence:</b> {result.confidence}%</p>

          <p><b>Severity:</b> {result.severity}</p>

          <p><b>Treatment:</b> {result.treatment}</p>

          <p><b>Prevention:</b> {result.prevention}</p>
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;