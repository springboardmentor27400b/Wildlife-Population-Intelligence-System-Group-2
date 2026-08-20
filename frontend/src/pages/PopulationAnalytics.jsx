import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  FaArrowLeft,
  FaChartLine,
  FaPaw,
  FaUsers,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function PopulationAnalytics() {
  const navigate = useNavigate();

  const [populationData, setPopulationData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
    totalPopulation: 0,
    speciesCount: 0,
    highestSpecies: "N/A",
    highestPopulation: 0,
    lowestSpecies: "N/A",
    lowestPopulation: 0,
  });

  useEffect(() => {
    fetchPopulationData();
  }, []);

  const fetchPopulationData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/dashboard/population");

      const data = response.data || [];

      setPopulationData(data);

      if (data.length > 0) {
        const totalPopulation = data.reduce(
          (total, item) =>
            total + Number(item.population || 0),
          0
        );

        const highest = [...data].sort(
          (a, b) =>
            Number(b.population || 0) -
            Number(a.population || 0)
        )[0];

        const lowest = [...data].sort(
          (a, b) =>
            Number(a.population || 0) -
            Number(b.population || 0)
        )[0];

        setAnalytics({
          totalPopulation,
          speciesCount: data.length,

          highestSpecies:
            highest?.species || "N/A",

          highestPopulation:
            Number(highest?.population || 0),

          lowestSpecies:
            lowest?.species || "N/A",

          lowestPopulation:
            Number(lowest?.population || 0),
        });
      }
    } catch (error) {
      console.log(
        "Error fetching population analytics:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // BAR CHART
  // -----------------------------

  const barData = {
    labels: populationData.map(
      (item) => item.species
    ),

    datasets: [
      {
        label: "Population",
        data: populationData.map(
          (item) => Number(item.population || 0)
        ),
        backgroundColor: "#198754",
        borderRadius: 8,
      },
    ],
  };

  // -----------------------------
  // LINE CHART
  // -----------------------------

  const lineData = {
    labels: populationData.map(
      (item) => item.species
    ),

    datasets: [
      {
        label: "Population Trend",
        data: populationData.map(
          (item) => Number(item.population || 0)
        ),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >

      {/* HEADER */}

      <div className="mb-4">

        <button
          className="btn btn-outline-success mb-3"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </button>

        <h1 className="fw-bold text-success">
          📈 Population Analytics
        </h1>

        <p className="text-muted">
          Analyze wildlife population data recorded
          through field observations.
        </p>

      </div>


      {/* SUMMARY CARDS */}

      <div className="row g-4 mb-5">

        {/* TOTAL POPULATION */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#198754",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaUsers size={28} />
              </div>

              <h2 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.totalPopulation}
              </h2>

              <p className="text-muted mb-0">
                Total Population
              </p>

            </div>

          </div>

        </div>


        {/* SPECIES COUNT */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#0d6efd",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPaw size={28} />
              </div>

              <h2 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.speciesCount}
              </h2>

              <p className="text-muted mb-0">
                Species Analyzed
              </p>

            </div>

          </div>

        </div>


        {/* HIGHEST */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#ffc107",
                  color: "#222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaChartLine size={28} />
              </div>

              <h5 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.highestSpecies}
              </h5>

              <h3 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.highestPopulation}
              </h3>

              <p className="text-muted mb-0">
                Highest Population
              </p>

            </div>

          </div>

        </div>


        {/* LOWEST */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#dc3545",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaChartLine size={28} />
              </div>

              <h5 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.lowestSpecies}
              </h5>

              <h3 className="fw-bold">
                {loading
                  ? "..."
                  : analytics.lowestPopulation}
              </h3>

              <p className="text-muted mb-0">
                Lowest Population
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* CHARTS */}

      <div className="row g-4">

        {/* BAR CHART */}

        <div className="col-lg-7">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-header bg-white border-0 pt-4">

              <h4 className="fw-bold text-success">
                🐾 Species-wise Population
              </h4>

              <small className="text-muted">
                Population comparison between species
              </small>

            </div>

            <div className="card-body">

              {populationData.length > 0 ? (

                <Bar
                  data={barData}
                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        display: false,
                      },
                    },

                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />

              ) : (

                <div className="text-center text-muted py-5">
                  No population data available.
                </div>

              )}

            </div>

          </div>

        </div>


        {/* LINE CHART */}

        <div className="col-lg-5">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-header bg-white border-0 pt-4">

              <h4 className="fw-bold text-primary">
                📊 Population Analysis
              </h4>

              <small className="text-muted">
                Recorded population values
              </small>

            </div>

            <div className="card-body">

              {populationData.length > 0 ? (

                <Line
                  data={lineData}
                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        display: false,
                      },
                    },

                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />

              ) : (

                <div className="text-center text-muted py-5">
                  No population data available.
                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* DATA TABLE */}

      <div
        className="card border-0 shadow-lg mt-5"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h3 className="fw-bold text-success">
                📋 Population Data
              </h3>

              <small className="text-muted">
                Species-wise recorded population
              </small>

            </div>

            <button
              className="btn btn-success"
              onClick={fetchPopulationData}
            >
              Refresh
            </button>

          </div>


          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-success">

                <tr>
                  <th>#</th>
                  <th>Species</th>
                  <th>Population</th>
                </tr>

              </thead>

              <tbody>

                {populationData.length > 0 ? (

                  populationData.map(
                    (item, index) => (

                      <tr key={index}>

                        <td>
                          {index + 1}
                        </td>

                        <td className="fw-semibold">
                          🐾 {item.species}
                        </td>

                        <td>
                          <span className="badge bg-success">
                            {item.population}
                          </span>
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="3"
                      className="text-center text-muted py-4"
                    >
                      No population records found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PopulationAnalytics;