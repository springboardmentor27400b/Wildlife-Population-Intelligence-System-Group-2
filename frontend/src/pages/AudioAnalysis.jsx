import { useEffect, useState } from "react";
import axios from "axios";

function AudioAnalysis() {
    const [audio, setAudio] = useState(null);
    const [surveyId, setSurveyId] = useState("");
    const [audioType, setAudioType] = useState("Bird Calls");
    const [records, setRecords] = useState([]);

    const token = localStorage.getItem("token");

    const fetchAudio = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/audio-analysis/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setRecords(res.data);
        } catch (err) {
            console.error("Fetch Error:", err.response?.data || err.message);
        }
    };

    useEffect(() => {
        fetchAudio();
    }, []);

    const uploadAudio = async () => {
  try {
    const formData = new FormData();

    formData.append("file", audio);
    formData.append("survey_id", surveyId);
    formData.append("audio_type", audioType);

    console.log("Uploading...");

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/audio-analysis/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("SUCCESS:", response.data);

    alert("Upload Successful");

    fetchAudio();

  } catch (err) {
    console.log("ERROR:", err);

    if (err.response) {
      console.log("STATUS:", err.response.status);
      console.log("DATA:", err.response.data);
    } else {
      console.log("MESSAGE:", err.message);
    }
  }
};

    return (
        <div className="container mt-4">

            <h2>Bioacoustic Recognition Engine</h2>

            <input
                type="file"
                className="form-control mt-3"
                accept=".wav,.mp3"
                onChange={(e) => setAudio(e.target.files[0])}
            />

            <input
                type="number"
                className="form-control mt-3"
                placeholder="Survey ID"
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
            />

            <select
                className="form-control mt-3"
                value={audioType}
                onChange={(e) => setAudioType(e.target.value)}
            >
                <option>Bird Calls</option>
                <option>Mammal Vocalizations</option>
                <option>Amphibian Calls</option>
                <option>Insect Sounds</option>
            </select>

            <button
                className="btn btn-success mt-3"
                onClick={uploadAudio}
            >
                Analyze Audio
            </button>

            <hr />

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Audio</th>
                        <th>Listen</th>
                        <th>Species</th>
                        <th>Confidence</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {records.map((r) => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.audio_name}</td>
                            <td>
                                <audio controls style={{ width: "220px" }}>
                                    <source
                                       src={`${import.meta.env.VITE_API_URL}/${r.audio_path}`}
                                        type="audio/mpeg"
                                    />
                                    Your browser does not support audio.
                                </audio>
                            </td>
                            <td>{r.species_detected}</td>
                            <td>{r.confidence}%</td>
                            <td>{r.processing_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AudioAnalysis;