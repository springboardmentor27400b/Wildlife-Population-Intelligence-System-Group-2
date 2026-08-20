import { useEffect, useState } from "react";
import api from "../api/api";

function ImageAnalysis() {
  const [file, setFile] = useState(null);

  const [surveyId, setSurveyId] = useState("");

  const [imageType, setImageType] = useState("Camera Trap");

  const [images, setImages] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const loadImages = async () => {
    try {
      const res = await api.get("/image-analysis/");
      setImages(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  
  const loadSurveys = async () => {
  try {
    const res = await api.get("/surveys");
    setSurveys(res.data);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
  loadImages();
  loadSurveys();
}, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select image");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("survey_id", surveyId);
    formData.append("image_type", imageType);

    try {
      await api.post("/image-analysis/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image Uploaded Successfully");

      setFile(null);
      setSurveyId("");
      setImageType("Camera Trap");

      loadImages();

    } catch (err) {
      console.log(err);
      alert("Upload Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Image?")) return;

    await api.delete(`/image-analysis/${id}`);

    loadImages();
  };

  return (
    <div className="container p-4">

      <h2>Wildlife Image Analysis</h2>

      <form onSubmit={handleUpload} className="card p-3 mb-4">

        <div className="mb-3">

          <label>Survey ID</label>

          <select
            className="form-select"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            required
            >
            <option value="">Select Survey</option>

            {surveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                {survey.survey_id} - {survey.title}
                </option>
            ))}
            </select>

        </div>

        <div className="mb-3">

          <label>Image Type</label>

          <select
            className="form-select"
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
          >
            <option>Camera Trap</option>
            <option>Drone</option>
          </select>

        </div>

        <div className="mb-3">

          <label>Select Image</label>

          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

        </div>

        <button className="btn btn-success">
          Upload Image
        </button>

      </form>

      <div className="row">

  {images.map((img) => (

    <div className="col-lg-6 mb-4" key={img.id}>

      <div className="card shadow">

        <div className="card-header bg-success text-white">
          <h4 className="mb-0">Wildlife Image Analysis Report</h4>
        </div>

        <div className="card-body">

          {/* Uploaded Image */}
          <h5>Uploaded Image</h5>

          <img
            src={`${import.meta.env.VITE_API_URL}/${img.image_path}`}
            alt="Uploaded"
            className="img-fluid rounded mb-3"
          />

          <hr />

          {/* Species */}
          <h5>Species Detected</h5>

          <p>{img.species_detected}</p>

          <hr />

          {/* Animal Count */}
          <h5>Animal Count</h5>

          <p>{img.animal_count}</p>

          <hr />

          {/* Confidence */}
          <h5>Confidence</h5>

          <p>{img.confidence}%</p>

          <hr />

          <h5>AI Analysis Summary</h5>

          <div className="alert alert-info">
              {img.analysis_report}
          </div>

          <hr />

          {/* Image Type */}
          <h5>Image Type</h5>

          <p>{img.image_type}</p>

          <hr />

          {/* Survey */}
          <h5>Survey</h5>

          <p>{img.survey_id}</p>

          <hr />

          {/* Status */}
          <h5>Status</h5>

          <span className="badge bg-success">
            {img.processing_status}
          </span>

          <hr />

            <h5>Detection Result</h5>

            <img
                src={`${import.meta.env.VITE_API_URL}/${img.result_image}`}
                alt="Detection Result"
                className="img-fluid rounded mb-3"
            />

            <hr />

            <button
                className="btn btn-danger"
                onClick={() => handleDelete(img.id)}
            >
                Delete
            </button>

        </div>

      </div>

    </div>

  ))}

</div>

    </div>
  );
}

export default ImageAnalysis;