import "./AI.css";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FaRobot,
  FaUpload,
  FaCamera,
  FaTrash,
  FaExclamationTriangle,
  FaFilePdf,
  FaChartLine,
  FaPaw,
  FaMapMarkedAlt,
  FaFileExcel,
  FaShieldAlt,
} from "react-icons/fa";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState } from "react";
import API from "../services/api";

function AI() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await API.get("/detection");
      setHistory(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setHistoryLoaded(true);
    }
  };

  if (!historyLoaded) {
    loadHistory();
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("location", "Forest Zone");
      formData.append("cameraId", "CAM-001");
      formData.append("habitat", "Dense Forest");

      await API.post("/detection/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image Uploaded Successfully");

      setImage(null);
      setPreview("");

      await loadHistory();
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete Detection?")) return;

    try {
      await API.delete(`/detection/${id}`);
      await loadHistory();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  const totalDetections = history.length;

  const totalAnimals = history.reduce(
    (sum, item) => sum + Number(item.animalCount || 0),
    0
  );

  const totalSpecies = new Set(
    history.map((item) => item.speciesName).filter(Boolean)
  ).size;

  const endangeredCount = history.filter(
    (item) => item.endangeredStatus === "Endangered"
  ).length;

  const averageConfidence =
    history.length > 0
      ? Math.round(
          history.reduce(
            (sum, item) => sum + Number(item.confidence || 0),
            0
          ) / history.length
        )
      : 0;

  const speciesData = useMemo(() => {
    const map = {};

    history.forEach((item) => {
      const species = item.speciesName || "Unknown";

      if (!map[species]) {
        map[species] = 0;
      }

      map[species] += Number(item.animalCount || 0);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [history]);

  const confidenceData = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;

    history.forEach((item) => {
      const confidence = Number(item.confidence || 0);

      if (confidence >= 80) {
        high++;
      } else if (confidence >= 50) {
        medium++;
      } else {
        low++;
      }
    });

    return [
      { name: "High", value: high },
      { name: "Medium", value: medium },
      { name: "Low", value: low },
    ];
  }, [history]);

  const pieColors = ["#16a34a", "#f59e0b", "#dc2626"];

  const locationData = useMemo(() => {
    const map = {};

    history.forEach((item) => {
      const location = item.location || "Unknown Location";

      if (!map[location]) {
        map[location] = 0;
      }

      map[location] += Number(item.animalCount || 0);
    });

    return Object.entries(map)
      .map(([location, count]) => ({
        location,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [history]);

  const downloadPDFReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Wildlife Monitoring Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Total Detections: ${totalDetections}`, 14, 30);
    doc.text(`Total Population: ${totalAnimals}`, 14, 37);
    doc.text(`Total Species: ${totalSpecies}`, 14, 44);
    doc.text(`Endangered Alerts: ${endangeredCount}`, 14, 51);
    doc.text(`Average Confidence: ${averageConfidence}%`, 14, 58);

    autoTable(doc, {
      startY: 68,
      head: [
        [
          "Species",
          "Confidence",
          "Count",
          "Endangered",
          "Location",
          "Status",
        ],
      ],
      body: history.map((item) => [
        item.speciesName || "Unknown",
        `${item.confidence || 0}%`,
        item.animalCount || 0,
        item.endangeredStatus || "-",
        item.location || "-",
        item.status || "-",
      ]),
    });

    doc.save("Wildlife_Monitoring_Report.pdf");
  };

  const downloadExcelReport = () => {
    if (history.length === 0) {
      alert("No detection records available.");
      return;
    }

    const headers = [
      "Species",
      "Confidence",
      "Count",
      "Endangered Status",
      "Location",
      "Status",
    ];

    const rows = history.map((item) => [
      item.speciesName || "",
      item.confidence || 0,
      item.animalCount || 0,
      item.endangeredStatus || "",
      item.location || "",
      item.status || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Wildlife_Monitoring_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const wildlifeSurveyReport = () => {
    alert(
      `Wildlife Survey Report\n\n` +
        `Total detections: ${totalDetections}\n` +
        `Total population: ${totalAnimals}\n` +
        `Species observed: ${totalSpecies}`
    );
  };

  const speciesPopulationReport = () => {
    alert(
      `Species Population Report\n\n` +
        speciesData
          .map((item) => `${item.name}: ${item.value}`)
          .join("\n")
    );
  };

  const biodiversityReport = () => {
    alert(
      `Biodiversity Report\n\n` +
        `Species richness: ${totalSpecies}\n` +
        `Total detected animals: ${totalAnimals}\n` +
        `Endangered alerts: ${endangeredCount}`
    );
  };

  const habitatReport = () => {
    const habitats = new Set(
      history.map((item) => item.habitat).filter(Boolean)
    ).size;

    alert(`Habitat Assessment Report\n\nRecorded habitat types: ${habitats}`);
  };

  const conservationReport = () => {
    alert(
      `Conservation Report\n\n` +
        `Endangered species alerts: ${endangeredCount}\n` +
        `Monitoring records: ${totalDetections}`
    );
  };

  return (
    <div className="ai">
      <div className="ai-header">
        <h1>
          <FaRobot />
          Executive Wildlife Intelligence Dashboard
        </h1>

        <p>Wildlife analytics, reporting and GIS visualization.</p>
      </div>

      <div className="ai-summary">
        <div className="ai-card green">
          <FaRobot />
          <div>
            <h2>{totalDetections}</h2>
            <span>Total Detections</span>
          </div>
        </div>

        <div className="ai-card blue">
          <FaPaw />
          <div>
            <h2>{totalAnimals}</h2>
            <span>Total Population</span>
          </div>
        </div>

        <div className="ai-card purple">
          <FaChartLine />
          <div>
            <h2>{totalSpecies}</h2>
            <span>Species Observed</span>
          </div>
        </div>

        <div className="ai-card orange">
          <FaExclamationTriangle />
          <div>
            <h2>{endangeredCount}</h2>
            <span>Endangered Alerts</span>
          </div>
        </div>
      </div>

      <div className="ai-chart-grid">
        <div className="chart-box">
          <h2>
            <FaChartLine />
            Species Population Analysis
          </h2>

          {speciesData.length === 0 ? (
            <p>No species analytics available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speciesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-box">
          <h2>AI Detection Confidence</h2>

          {history.length === 0 ? (
            <p>No confidence data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="report-section">
        <div className="chart-box">
          <div className="report-header">
            <div>
              <h2>Wildlife Reports & Export</h2>

              <p>
                Generate wildlife survey, population, biodiversity, habitat
                and conservation reports.
              </p>
            </div>

            <div className="report-actions">
              <button
                className="report-btn pdf"
                onClick={downloadPDFReport}
              >
                <FaFilePdf />
                PDF
              </button>

              <button
                className="report-btn excel"
                onClick={downloadExcelReport}
              >
                <FaFileExcel />
                Excel
              </button>
            </div>
          </div>

          <div className="report-actions">
            <button className="report-btn" onClick={wildlifeSurveyReport}>
              Wildlife Survey
            </button>

            <button
              className="report-btn"
              onClick={speciesPopulationReport}
            >
              Species Population
            </button>

            <button className="report-btn" onClick={biodiversityReport}>
              Biodiversity
            </button>

            <button className="report-btn" onClick={habitatReport}>
              Habitat Assessment
            </button>

            <button className="report-btn" onClick={conservationReport}>
              Conservation
            </button>
          </div>
        </div>
      </div>

      <div className="gis-section">
        <h2>
          <FaMapMarkedAlt />
          GIS Wildlife Distribution
        </h2>

        <p>Wildlife observations grouped by monitoring location.</p>

        {locationData.length === 0 ? (
          <div className="gis-map">No location data available.</div>
        ) : (
          <div className="gis-map">
            <div
              style={{
                width: "100%",
                padding: "20px",
              }}
            >
              <h3>Wildlife Distribution by Location</h3>

              {locationData.map((item) => (
                <div
                  key={item.location}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px",
                    marginTop: "10px",
                    background: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #d8eadc",
                  }}
                >
                  <strong>{item.location}</strong>
                  <span>{item.count} animals</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="recommend-box">
        <h2>
          <FaShieldAlt />
          Conservation Monitoring
        </h2>

        <ul>
          <li>
            Endangered species alerts:{" "}
            <strong>{endangeredCount}</strong>
          </li>

          <li>
            Species observed: <strong>{totalSpecies}</strong>
          </li>

          <li>
            Total detected population: <strong>{totalAnimals}</strong>
          </li>

          <li>
            Average detection confidence:{" "}
            <strong>{averageConfidence}%</strong>
          </li>
        </ul>
      </div>

      <div className="upload-card">
        <label htmlFor="image" className="upload-box">
          <FaUpload />

          <h3>Upload Wildlife Image</h3>

          <p>JPG, PNG, JPEG Supported</p>
        </label>

        <input
          id="image"
          type="file"
          accept="image/*"
          hidden
          onChange={handleImage}
        />

        {preview && (
          <div className="preview-section">
            <img src={preview} alt="Wildlife Preview" />

            <button
              className="detect-btn"
              onClick={uploadImage}
              disabled={loading}
            >
              <FaCamera />
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        )}
      </div>

      <div className="history-card">
        <h2>Detection History</h2>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Image</th>
              <th>Species</th>
              <th>Confidence</th>
              <th>Count</th>
              <th>Status</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="8">No Detection Records Found</td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr key={item._id || index}>
                  <td>{index + 1}</td>

                  <td>
                    {item.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        alt="Wildlife"
                        style={{
                          width: "90px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <strong>{item.speciesName}</strong>

                      <span
                        style={{
                          background:
                            item.endangeredStatus === "Endangered"
                              ? "#e53935"
                              : "#2e7d32",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {item.endangeredStatus}
                      </span>

                      {item.alertMessage && (
                        <small
                          style={{
                            color: "#d32f2f",
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          {item.alertMessage}
                        </small>
                      )}
                    </div>
                  </td>

                  <td>{item.confidence}%</td>

                  <td>{item.animalCount}</td>

                  <td>
                    <span className="detected">{item.status}</span>
                  </td>

                  <td>{item.location}</td>

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

export default AI;