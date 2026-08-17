import "./Audio.css";

import {
  FaMicrophone,
  FaUpload,
  FaTrash,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../services/api";

function Audio() {
  const [audio, setAudio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await API.get("/audio");
      setHistory(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const res = await API.get("/audio");

        if (!cancelled) {
          setHistory(res.data?.data || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAudio = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAudio(file);
  };

  const uploadAudio = async () => {
    if (!audio) {
      alert("Please select audio.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("audio", audio);
      formData.append("location", "Forest Zone");
      formData.append("habitat", "Dense Forest");

      const res = await API.post(
        "/audio/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      alert(
        `Detected: ${res.data.data.animalName}\nConfidence: ${res.data.data.confidence}%`
      );

      setAudio(null);

      await loadHistory();
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete Record?")) {
      return;
    }

    try {
      await API.delete(`/audio/${id}`);
      await loadHistory();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="audio">
      <div className="audio-header">
        <h1>
          <FaMicrophone /> Bioacoustic Recognition
        </h1>

        <p>
          Upload wildlife audio for AI-based animal sound detection.
        </p>
      </div>

      <div className="upload-card">
        <label
          htmlFor="audio"
          className="upload-box"
        >
          <FaUpload />

          <h3>Upload Animal Audio</h3>

          <p>MP3, WAV Supported</p>
        </label>

        <input
          id="audio"
          type="file"
          accept=".mp3,.wav,audio/*"
          hidden
          onChange={handleAudio}
        />

        {audio && (
          <div className="preview-section">
            <p>
              <strong>Selected File:</strong> {audio.name}
            </p>

            <button
              className="detect-btn"
              onClick={uploadAudio}
              disabled={loading}
            >
              <FaMicrophone />

              {loading
                ? "Uploading..."
                : "Detect Animal Sound"}
            </button>
          </div>
        )}
      </div>

      <div className="history-card">
        <h2>Audio Detection History</h2>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Audio</th>
              <th>Animal</th>
              <th>Confidence</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="7">
                  No Audio Detection Records Found
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>

                  <td>
                    <audio
                      controls
                      style={{ width: "180px" }}
                    >
                      <source
                        src={`http://localhost:5000/uploads/${item.audioFile}`}
                      />
                      Your browser does not support audio.
                    </audio>
                  </td>

                  <td>{item.animalName}</td>

                  <td>{item.confidence}%</td>

                  <td>{item.location}</td>

                  <td>
                    <span className="detected">
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteRecord(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Audio;