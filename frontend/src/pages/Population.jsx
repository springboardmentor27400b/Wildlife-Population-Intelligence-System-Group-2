import "./Population.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  FaSearch,
  FaPlus,
  FaPaw,
  FaTrash,
  FaEdit,
  FaChartLine,
  FaRobot,
  FaCalendarAlt,
  FaWater,
  FaLeaf,
  FaTree,
} from "react-icons/fa";

import { useEffect, useMemo, useState } from "react";

import API from "../services/api";
import AI_API from "../services/aiApi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Population() {
  const [populations, setPopulations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  const [form, setForm] = useState({
    species: "",
    count: "",
    location: "",
    status: "Stable",

    temperature: "",
    rainfall: "",
    habitat_score: "",
    water_quality: "",
    vegetation_score: "",
    biodiversity_score: "",
  });

  // =========================
  // FETCH
  // =========================

  const fetchPopulation = async () => {
    try {
      setLoading(true);

      const res = await API.get("/population");

      setPopulations(res.data.data || []);
    } catch (err) {
      console.log("Population fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialPopulation = async () => {
      try {
        setLoading(true);

        const res = await API.get("/population");

        if (!cancelled) {
          setPopulations(res.data?.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.log("Population fetch error:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialPopulation();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setEditingId(null);

    setForm({
      species: "",
      count: "",
      location: "",
      status: "Stable",

      temperature: "",
      rainfall: "",
      habitat_score: "",
      water_quality: "",
      vegetation_score: "",
      biodiversity_score: "",
    });

    setPrediction(null);
  };

  // =========================
  // SAVE
  // =========================

  const savePopulation = async () => {
    if (!form.species || form.count === "" || !form.location) {
      alert("Please fill Species, Population and Location.");
      return;
    }

    try {
      const data = {
        species: form.species.trim(),
        count: Number(form.count),
        location: form.location.trim(),
        status: form.status,

        temperature:
          form.temperature === ""
            ? undefined
            : Number(form.temperature),

        rainfall:
          form.rainfall === ""
            ? undefined
            : Number(form.rainfall),

        habitat_score:
          form.habitat_score === ""
            ? undefined
            : Number(form.habitat_score),

        water_quality:
          form.water_quality === ""
            ? undefined
            : Number(form.water_quality),

        vegetation_score:
          form.vegetation_score === ""
            ? undefined
            : Number(form.vegetation_score),

        biodiversity_score:
          form.biodiversity_score === ""
            ? undefined
            : Number(form.biodiversity_score),
      };

      if (editingId) {
        await API.put(`/population/${editingId}`, data);

        alert("Population record updated successfully.");
      } else {
        await API.post("/population", data);

        alert("Population record added successfully.");
      }

      clearForm();
      await fetchPopulation();
    } catch (err) {
      console.log("Save error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to save population record. Check backend server."
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const editPopulation = (item) => {
    setEditingId(item._id);

    setForm({
      species: item.species || "",
      count: item.count ?? "",
      location: item.location || "",
      status: item.status || "Stable",

      temperature: item.temperature ?? "",
      rainfall: item.rainfall ?? "",
      habitat_score: item.habitat_score ?? "",
      water_quality: item.water_quality ?? "",
      vegetation_score: item.vegetation_score ?? "",
      biodiversity_score: item.biodiversity_score ?? "",
    });

    setPrediction(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const deletePopulation = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this population record?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/population/${id}`);

      await fetchPopulation();

      alert("Record deleted successfully.");
    } catch (err) {
      console.log("Delete error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete record."
      );
    }
  };

  // =========================
  // LAST MONTH
  // =========================

  const monthlyData = useMemo(() => {
    const oneMonthAgo = new Date();

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );

    const now = new Date();

    return populations.filter((item) => {
      if (!item.createdAt) return false;

      const createdDate = new Date(item.createdAt);

      return (
        createdDate >= oneMonthAgo &&
        createdDate <= now
      );
    });
  }, [populations]);

  // =========================
  // SEARCH
  // =========================

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return monthlyData;

    return monthlyData.filter(
      (item) =>
        item.species
          ?.toLowerCase()
          .includes(query) ||
        item.location
          ?.toLowerCase()
          .includes(query)
    );
  }, [monthlyData, search]);

  // =========================
  // SUMMARY
  // =========================

  const totalPopulation = monthlyData.reduce(
    (sum, item) =>
      sum + Number(item.count || 0),
    0
  );

  const growingSpecies = monthlyData.filter(
    (item) => item.status === "Increasing"
  ).length;

  const endangeredSpecies = monthlyData.filter(
    (item) => item.status === "Endangered"
  ).length;

  // =========================
  // SPECIES CLASSIFICATION
  // =========================

  const speciesClassification = useMemo(() => {
    const result = {};

    monthlyData.forEach((item) => {
      const species = item.species || "Unknown";

      if (!result[species]) {
        result[species] = {
          species,
          population: 0,
          records: 0,
          stable: 0,
          increasing: 0,
          decreasing: 0,
          endangered: 0,
        };
      }

      result[species].population += Number(
        item.count || 0
      );

      result[species].records += 1;

      if (item.status === "Stable") {
        result[species].stable += 1;
      }

      if (item.status === "Increasing") {
        result[species].increasing += 1;
      }

      if (item.status === "Decreasing") {
        result[species].decreasing += 1;
      }

      if (item.status === "Endangered") {
        result[species].endangered += 1;
      }
    });

    return Object.values(result);
  }, [monthlyData]);

  // =========================
  // POPULATION CHART
  // =========================

  const chartData = speciesClassification.map(
    (item) => ({
      species: item.species,
      population: item.population,
    })
  );

  // =========================
  // STATUS CHART
  // =========================

  const statusData = [
    {
      name: "Stable",
      value: monthlyData.filter(
        (item) => item.status === "Stable"
      ).length,
    },
    {
      name: "Increasing",
      value: monthlyData.filter(
        (item) => item.status === "Increasing"
      ).length,
    },
    {
      name: "Decreasing",
      value: monthlyData.filter(
        (item) => item.status === "Decreasing"
      ).length,
    },
    {
      name: "Endangered",
      value: monthlyData.filter(
        (item) => item.status === "Endangered"
      ).length,
    },
  ].filter((item) => item.value > 0);

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
  ];

  // =========================
  // LOCATION
  // =========================

  const locationData = useMemo(() => {
    const result = {};

    monthlyData.forEach((item) => {
      const location =
        item.location || "Unknown";

      result[location] =
        (result[location] || 0) +
        Number(item.count || 0);
    });

    return Object.entries(result).map(
      ([location, population]) => ({
        location,
        population,
      })
    );
  }, [monthlyData]);

  // =========================
  // ENVIRONMENT SUMMARY
  // REAL DATABASE VALUES
  // =========================

  const environmentalSummary = useMemo(() => {
    const valid = monthlyData.filter(
      (item) =>
        item.habitat_score != null ||
        item.water_quality != null ||
        item.vegetation_score != null ||
        item.biodiversity_score != null
    );

    if (valid.length === 0) {
      return {
        habitat: null,
        water: null,
        vegetation: null,
        biodiversity: null,
      };
    }

    const average = (field) => {
      const values = valid
        .map((item) => Number(item[field]))
        .filter((value) => !Number.isNaN(value));

      if (!values.length) return null;

      return Math.round(
        values.reduce(
          (sum, value) => sum + value,
          0
        ) / values.length
      );
    };

    return {
      habitat: average("habitat_score"),
      water: average("water_quality"),
      vegetation: average("vegetation_score"),
      biodiversity: average(
        "biodiversity_score"
      ),
    };
  }, [monthlyData]);

  // =========================
  // AI PREDICTION
  // =========================

  const predictPopulation = async () => {
    if (
      !form.species ||
      form.count === "" ||
      !form.location
    ) {
      alert(
        "Please fill Species, Population and Location first."
      );

      return;
    }

    try {
      setPredictLoading(true);

      const params = {
        species: form.species,
        month: new Date().getMonth() + 1,
        status: form.status,
      };

      // Only send values actually entered by user.
      if (form.temperature !== "") {
        params.temperature =
          Number(form.temperature);
      }

      if (form.rainfall !== "") {
        params.rainfall =
          Number(form.rainfall);
      }

      if (form.habitat_score !== "") {
        params.habitat_score =
          Number(form.habitat_score);
      }

      const res = await AI_API.get(
        "/predict-population",
        {
          params,
        }
      );

      setPrediction({
        ...res.data,
        currentPopulation: Number(
          form.count
        ),
        status: form.status,
      });
    } catch (err) {
      console.log("AI prediction error:", err);

      alert(
        err.response?.data?.message ||
          "AI prediction failed. Check AI backend."
      );
    } finally {
      setPredictLoading(false);
    }
  };

  // =========================
  // AI ANALYSIS
  // =========================

  const getAIAnalysis = () => {
    if (!prediction) return {};

    switch (prediction.status) {
      case "Increasing":
        return {
          trend: "📈 Population Increasing",
          risk: "Low",
          recommendation:
            "Maintain habitat protection and continue monitoring.",
          decision:
            "Population trend indicates positive growth.",
          health: 90,
        };

      case "Stable":
        return {
          trend: "➡ Population Stable",
          risk: "Medium",
          recommendation:
            "Continue regular monthly wildlife monitoring.",
          decision:
            "Population condition appears stable.",
          health: 75,
        };

      case "Decreasing":
        return {
          trend: "📉 Population Declining",
          risk: "High",
          recommendation:
            "Increase conservation monitoring and investigate habitat pressure.",
          decision:
            "Population decline requires closer observation.",
          health: 50,
        };

      case "Endangered":
        return {
          trend: "🚨 Critical Population",
          risk: "Very High",
          recommendation:
            "Immediate conservation protection and intensive monitoring recommended.",
          decision:
            "Species requires high-priority conservation attention.",
          health: 25,
        };

      default:
        return {
          trend: "Unknown",
          risk: "Unknown",
          recommendation: "-",
          decision: "-",
          health: 0,
        };
    }
  };

  const ai = getAIAnalysis();

  // =========================
  // PDF
  // =========================

  const downloadReport = () => {
    if (!prediction) {
      alert("Generate AI prediction first.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Wildlife AI Population Report",
      20,
      20
    );

    doc.setFontSize(11);

    doc.text(
      "Survey Period: Last One Month",
      20,
      28
    );

    autoTable(doc, {
      startY: 38,

      head: [["Field", "Value"]],

      body: [
        [
          "Species",
          prediction.species ||
            form.species,
        ],
        [
          "Current Population",
          form.count,
        ],
        [
          "Predicted Population",
          prediction.predicted_population ??
            "-",
        ],
        [
          "Confidence",
          prediction.confidence != null
            ? `${prediction.confidence}%`
            : "-",
        ],
        ["Status", form.status],
        [
          "Health Score",
          `${ai.health}%`,
        ],
        ["Risk Level", ai.risk],
        ["Decision", ai.decision],
        [
          "Recommendation",
          ai.recommendation,
        ],
      ],
    });

    doc.save(
      "Wildlife_Monthly_AI_Report.pdf"
    );
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="population-page">

      {/* HEADER */}

      <div className="population-header">
        <div>
          <h1>
            Wildlife Population Management
          </h1>

          <p className="monthly-label">
            <FaCalendarAlt /> Monthly Wildlife
            Survey — Last 1 Month
          </p>

          <p>
            Population analysis using actual
            wildlife monitoring records.
          </p>
        </div>

        <div className="header-actions">

          <div className="search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search species or location..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            className="add-btn"
            onClick={savePopulation}
          >
            <FaPlus />

            {editingId
              ? "Update Record"
              : "Add Record"}
          </button>

          <button
            className="add-btn"
            onClick={predictPopulation}
          >
            <FaRobot />

            {predictLoading
              ? "Predicting..."
              : "AI Predict"}
          </button>

        </div>
      </div>

      {/* MONTHLY NOTICE */}

      <div
        style={{
          background: "#e8f5e9",
          border: "1px solid #a5d6a7",
          color: "#1b5e20",
          padding: "14px 18px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <FaCalendarAlt />{" "}
        <strong>
          Showing {monthlyData.length} records
          collected during the last one month.
        </strong>
      </div>

      {/* FORM */}

      <div className="form-section">

        <input
          type="text"
          name="species"
          placeholder="Species Name *"
          value={form.species}
          onChange={handleChange}
        />

        <input
          type="number"
          name="count"
          placeholder="Population Count *"
          min="0"
          value={form.count}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location *"
          value={form.location}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Stable">
            Stable
          </option>

          <option value="Increasing">
            Increasing
          </option>

          <option value="Decreasing">
            Decreasing
          </option>

          <option value="Endangered">
            Endangered
          </option>
        </select>

        {/* ENVIRONMENT */}

        <div className="environment-form-title">
          <FaLeaf /> Environmental Monitoring
        </div>

        <input
          type="number"
          name="temperature"
          placeholder="Temperature °C"
          step="0.1"
          value={form.temperature}
          onChange={handleChange}
        />

        <input
          type="number"
          name="rainfall"
          placeholder="Rainfall mm"
          step="0.1"
          min="0"
          value={form.rainfall}
          onChange={handleChange}
        />

        <input
          type="number"
          name="habitat_score"
          placeholder="Habitat Score 0-100"
          min="0"
          max="100"
          value={form.habitat_score}
          onChange={handleChange}
        />

        <input
          type="number"
          name="water_quality"
          placeholder="Water Quality 0-100"
          min="0"
          max="100"
          value={form.water_quality}
          onChange={handleChange}
        />

        <input
          type="number"
          name="vegetation_score"
          placeholder="Vegetation Score 0-100"
          min="0"
          max="100"
          value={form.vegetation_score}
          onChange={handleChange}
        />

        <input
          type="number"
          name="biodiversity_score"
          placeholder="Biodiversity Score 0-100"
          min="0"
          max="100"
          value={form.biodiversity_score}
          onChange={handleChange}
        />

        {editingId && (
          <button
            type="button"
            className="add-btn"
            onClick={clearForm}
          >
            Cancel Edit
          </button>
        )}

      </div>

      {/* AI RESULT */}

      {prediction && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            marginTop: "25px",
            borderRadius: "14px",
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <h2>
              🧠 AI Population Estimation
            </h2>

            <button
              className="add-btn"
              onClick={downloadReport}
            >
              Download AI Report
            </button>
          </div>

          <hr />

          <div className="ai-grid">

            <div className="ai-box">
              <h4>Species</h4>
              <p>
                {prediction.species ||
                  form.species}
              </p>
            </div>

            <div className="ai-box">
              <h4>Current Population</h4>
              <p>{form.count}</p>
            </div>

            <div className="ai-box">
              <h4>Predicted Population</h4>
              <p>
                {prediction.predicted_population ??
                  "-"}
              </p>
            </div>

            <div className="ai-box">
              <h4>Confidence</h4>
              <p>
                {prediction.confidence != null
                  ? `${prediction.confidence}%`
                  : "-"}
              </p>
            </div>

            <div className="ai-box">
              <h4>Classification</h4>
              <p>{ai.trend}</p>
            </div>

            <div className="ai-box">
              <h4>Risk</h4>
              <p>{ai.risk}</p>
            </div>

          </div>

          <hr />

          <h3>
            📊 AI Survey Analysis
          </h3>

          <p>
            <strong>Health Score:</strong>{" "}
            {ai.health}%
          </p>

          <p>
            <strong>AI Decision:</strong>{" "}
            {ai.decision}
          </p>

          <p>
            <strong>Recommendation:</strong>{" "}
            {ai.recommendation}
          </p>

        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="population-cards">

        <div className="pop-card">
          <FaPaw />

          <h2>
            {monthlyData.length}
          </h2>

          <p>Monthly Records</p>
        </div>

        <div className="pop-card">
          <FaPaw />

          <h2>
            {totalPopulation}
          </h2>

          <p>Total Population</p>
        </div>

        <div className="pop-card">
          <FaChartLine />

          <h2>
            {growingSpecies}
          </h2>

          <p>Growing Records</p>
        </div>

        <div className="pop-card">
          <FaPaw />

          <h2>
            {endangeredSpecies}
          </h2>

          <p>Endangered</p>
        </div>

      </div>

      {/* ENVIRONMENT SUMMARY */}

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "14px",
          marginTop: "25px",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🌿 Real Environmental Monitoring
        </h2>

        <p>
          Values below are calculated from
          environmental data actually stored
          in the database for the last month.
        </p>

        {environmentalSummary.habitat === null ? (
          <div
            style={{
              padding: "20px",
              background: "#fff8e1",
              borderRadius: "10px",
              color: "#795548",
            }}
          >
            No environmental measurements
            have been recorded yet. Add
            environmental values while creating
            a population record.
          </div>
        ) : (
          <div
            className="ai-grid"
            style={{ marginTop: "20px" }}
          >

            <div className="ai-box">
              <FaLeaf />
              <h4>Habitat</h4>
              <p>
                {environmentalSummary.habitat ??
                  "-"}
                %
              </p>
            </div>

            <div className="ai-box">
              <FaWater />
              <h4>Water Quality</h4>
              <p>
                {environmentalSummary.water ??
                  "-"}
                %
              </p>
            </div>

            <div className="ai-box">
              <FaTree />
              <h4>Vegetation</h4>
              <p>
                {environmentalSummary.vegetation ??
                  "-"}
                %
              </p>
            </div>

            <div className="ai-box">
              <FaPaw />
              <h4>Biodiversity</h4>
              <p>
                {environmentalSummary.biodiversity ??
                  "-"}
                %
              </p>
            </div>

          </div>
        )}

      </div>

      {/* CHARTS */}

      <div className="table-section">

        <div className="charts-section">

          <div>
            <h2>
              📊 Population Distribution
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="species"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="population"
                  fill="#4CAF50"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2>
              🥧 Population Classification
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {statusData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* LOCATION */}

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "14px",
          marginTop: "25px",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >

        <h2>
          🌳 Location-wise Monthly Population
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart data={locationData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="location"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="population"
              fill="#2196f3"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* CLASSIFICATION */}

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "14px",
          marginTop: "25px",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >

        <h2>
          🔎 Species Classification
        </h2>

        <table>

          <thead>
            <tr>
              <th>Species</th>
              <th>Population</th>
              <th>Records</th>
              <th>Stable</th>
              <th>Increasing</th>
              <th>Decreasing</th>
              <th>Endangered</th>
            </tr>
          </thead>

          <tbody>

            {speciesClassification.length ===
            0 ? (
              <tr>
                <td colSpan="7">
                  No monthly classification
                  data available.
                </td>
              </tr>
            ) : (
              speciesClassification.map(
                (item) => (
                  <tr key={item.species}>

                    <td>
                      <strong>
                        {item.species}
                      </strong>
                    </td>

                    <td>
                      {item.population}
                    </td>

                    <td>
                      {item.records}
                    </td>

                    <td>
                      {item.stable}
                    </td>

                    <td>
                      {item.increasing}
                    </td>

                    <td>
                      {item.decreasing}
                    </td>

                    <td>
                      {item.endangered}
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MAIN TABLE */}

      <div className="table-section">

        <h2>
          📋 Monthly Survey Records
        </h2>

        <div
          style={{
            overflowX: "auto",
          }}
        >

          <table>

            <thead>

              <tr>
                <th>No.</th>
                <th>Species</th>
                <th>Population</th>
                <th>Location</th>
                <th>Status</th>
                <th>Temperature</th>
                <th>Rainfall</th>
                <th>Habitat</th>
                <th>Water</th>
                <th>Vegetation</th>
                <th>Biodiversity</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="12">
                    Loading monthly survey
                    data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="12">
                    No records found for the
                    last one month.
                  </td>
                </tr>
              ) : (
                filteredData.map(
                  (item, index) => (
                    <tr key={item._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {item.species}
                        </strong>
                      </td>

                      <td>
                        {item.count}
                      </td>

                      <td>
                        {item.location}
                      </td>

                      <td>
                        {item.status}
                      </td>

                      <td>
                        {item.temperature ??
                          "—"}
                        {item.temperature != null
                          ? "°C"
                          : ""}
                      </td>

                      <td>
                        {item.rainfall ??
                          "—"}
                        {item.rainfall != null
                          ? " mm"
                          : ""}
                      </td>

                      <td>
                        {item.habitat_score ??
                          "—"}
                        {item.habitat_score != null
                          ? "%"
                          : ""}
                      </td>

                      <td>
                        {item.water_quality ??
                          "—"}
                        {item.water_quality != null
                          ? "%"
                          : ""}
                      </td>

                      <td>
                        {item.vegetation_score ??
                          "—"}
                        {item.vegetation_score != null
                          ? "%"
                          : ""}
                      </td>

                      <td>
                        {item.biodiversity_score ??
                          "—"}
                        {item.biodiversity_score != null
                          ? "%"
                          : ""}
                      </td>

                      <td>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            editPopulation(
                              item
                            )
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deletePopulation(
                              item._id
                            )
                          }
                        >
                          <FaTrash />
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Population;