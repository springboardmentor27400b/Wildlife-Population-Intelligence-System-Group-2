import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  FaUsers,
  FaPaw,
  FaTree,
  FaClipboardList,
  FaChartLine,
  FaArrowLeft,
  FaExclamationTriangle,
  FaDatabase,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function PlatformAnalytics() {
  const navigate = useNavigate();

  // =====================================================
  // CURRENT USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_users: 0,
    total_species: 0,
    total_population: 0,
    total_observations: 0,
    total_surveys: 0,
    total_images: 0,
    total_audio: 0,
    active_incidents: 0,
  });

  const [categoryData, setCategoryData] =
    useState([]);

  const [statusData, setStatusData] =
    useState([]);

  const [populationData, setPopulationData] =
    useState([]);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // -------------------------------------------------
      // DASHBOARD STATISTICS
      // -------------------------------------------------

      const dashboardResponse =
        await api.get("/dashboard");

      const dashboard =
        dashboardResponse.data || {};

      setStats((previous) => ({
        ...previous,

        total_users:
          dashboard.total_users || 0,

        total_species:
          dashboard.total_species || 0,

        total_population:
          dashboard.total_population || 0,

        active_incidents:
          dashboard.active_incidents || 0,
      }));

      // -------------------------------------------------
      // SPECIES CATEGORY
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/dashboard/category"
        );

        setCategoryData(
          response.data || []
        );
      } catch (error) {
        console.log(
          "Category analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // CONSERVATION STATUS
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/dashboard/status"
        );

        setStatusData(
          response.data || []
        );
      } catch (error) {
        console.log(
          "Status analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // POPULATION BY SPECIES
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/dashboard/population"
        );

        setPopulationData(
          response.data || []
        );
      } catch (error) {
        console.log(
          "Population analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // OBSERVATIONS
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/observations"
        );

        setStats((previous) => ({
          ...previous,

          total_observations:
            Array.isArray(response.data)
              ? response.data.length
              : 0,
        }));
      } catch (error) {
        console.log(
          "Observation analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // SURVEYS
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/surveys"
        );

        setStats((previous) => ({
          ...previous,

          total_surveys:
            Array.isArray(response.data)
              ? response.data.length
              : 0,
        }));
      } catch (error) {
        console.log(
          "Survey analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // IMAGE ANALYSIS
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/image-analysis"
        );

        setStats((previous) => ({
          ...previous,

          total_images:
            Array.isArray(response.data)
              ? response.data.length
              : 0,
        }));
      } catch (error) {
        console.log(
          "Image analytics unavailable:",
          error
        );
      }

      // -------------------------------------------------
      // AUDIO ANALYSIS
      // -------------------------------------------------

      try {
        const response = await api.get(
          "/audio-analysis"
        );

        setStats((previous) => ({
          ...previous,

          total_audio:
            Array.isArray(response.data)
              ? response.data.length
              : 0,
        }));
      } catch (error) {
        console.log(
          "Audio analytics unavailable:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Error fetching platform analytics:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to load platform analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    icon,
    value,
    title,
    background,
  }) => {
    return (
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
                background,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>

            <h2 className="fw-bold mb-1">
              {value}
            </h2>

            <p className="text-muted mb-0">
              {title}
            </p>

          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // CATEGORY CHART
  // =====================================================

  const categoryChart = {
    labels: categoryData.map(
      (item) => item.category
    ),

    datasets: [
      {
        label: "Species",
        data: categoryData.map(
          (item) => item.count
        ),

        backgroundColor: [
          "#198754",
          "#0d6efd",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#fd7e14",
        ],
      },
    ],
  };

  // =====================================================
  // CONSERVATION STATUS CHART
  // =====================================================

  const statusChart = {
    labels: statusData.map(
      (item) => item.status
    ),

    datasets: [
      {
        label: "Species Count",

        data: statusData.map(
          (item) => item.count
        ),

        backgroundColor: [
          "#dc3545",
          "#ffc107",
          "#198754",
          "#0d6efd",
          "#6f42c1",
        ],
      },
    ],
  };

  // =====================================================
  // POPULATION CHART
  // =====================================================

  const populationChart = {
    labels: populationData.map(
      (item) => item.species
    ),

    datasets: [
      {
        label: "Population",

        data: populationData.map(
          (item) => item.population
        ),

        borderColor: "#198754",

        backgroundColor:
          "rgba(25,135,84,0.15)",

        fill: true,

        tension: 0.4,
      },
    ],
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        <div className="text-center">

          <div
            className="spinner-border text-success"
            role="status"
          ></div>

          <p className="mt-3 text-muted">
            Loading platform analytics...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-5">

        <div>

          <h2 className="fw-bold text-success mb-2">
            <FaChartLine className="me-2" />
            Platform Analytics
          </h2>

          <p className="text-muted mb-0">
            Monitor overall platform activity,
            wildlife data and system usage.
          </p>

        </div>

        <button
          className="btn btn-outline-success"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </button>

      </div>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <div className="mb-4">

        <h4 className="fw-bold text-success">
          📊 Platform Overview
        </h4>

        <p className="text-muted">
          Overall statistics collected from the
          wildlife monitoring platform.
        </p>

      </div>

      <div className="row g-4 mb-5">

        <StatCard
          icon={<FaUsers size={30} />}
          value={stats.total_users}
          title="Registered Users"
          background="#198754"
        />

        <StatCard
          icon={<FaPaw size={30} />}
          value={stats.total_species}
          title="Total Species"
          background="#0d6efd"
        />

        <StatCard
          icon={<FaTree size={30} />}
          value={stats.total_population}
          title="Total Wildlife Population"
          background="#ffc107"
        />

        <StatCard
          icon={
            <FaExclamationTriangle
              size={30}
            />
          }
          value={stats.active_incidents}
          title="Active Incidents"
          background="#dc3545"
        />

      </div>

      {/* =================================================
          PLATFORM ACTIVITY
      ================================================= */}

      <div className="mb-4">

        <h4 className="fw-bold text-success">
          ⚙️ Platform Activity
        </h4>

        <p className="text-muted">
          Activity and data records generated
          through the platform.
        </p>

      </div>

      <div className="row g-4 mb-5">

        <StatCard
          icon={
            <FaClipboardList size={30} />
          }
          value={stats.total_observations}
          title="Observations"
          background="#6f42c1"
        />

        <StatCard
          icon={
            <FaDatabase size={30} />
          }
          value={stats.total_surveys}
          title="Surveys"
          background="#20c997"
        />

        <StatCard
          icon={<FaPaw size={30} />}
          value={stats.total_images}
          title="Image Analyses"
          background="#fd7e14"
        />

        <StatCard
          icon={<FaChartLine size={30} />}
          value={stats.total_audio}
          title="Audio Analyses"
          background="#6610f2"
        />

      </div>

      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="row g-4">

        {/* -----------------------------------------------
            SPECIES CATEGORY
        ----------------------------------------------- */}

        <div className="col-lg-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body p-4">

              <h4 className="fw-bold text-success">
                🐾 Species by Category
              </h4>

              <p className="text-muted">
                Distribution of wildlife species
                across different categories.
              </p>

              {categoryData.length > 0 ? (

                <Pie
                  data={categoryChart}
                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />

              ) : (

                <p className="text-muted text-center py-5">
                  No category data available.
                </p>

              )}

            </div>

          </div>

        </div>

        {/* -----------------------------------------------
            CONSERVATION STATUS
        ----------------------------------------------- */}

        <div className="col-lg-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body p-4">

              <h4 className="fw-bold text-danger">
                🌿 Conservation Status
              </h4>

              <p className="text-muted">
                Current conservation status of
                recorded wildlife species.
              </p>

              {statusData.length > 0 ? (

                <Bar
                  data={statusChart}
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

                <p className="text-muted text-center py-5">
                  No conservation data available.
                </p>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          POPULATION ANALYTICS
      ================================================= */}

      <div className="row g-4 mt-1">

        <div className="col-lg-12">

          <div
            className="card border-0 shadow-lg"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body p-4">

              <h4 className="fw-bold text-success">
                📈 Wildlife Population by Species
              </h4>

              <p className="text-muted">
                Population distribution across
                recorded wildlife species.
              </p>

              {populationData.length > 0 ? (

                <Line
                  data={populationChart}
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

                <p className="text-muted text-center py-5">
                  No population data available.
                </p>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          ADMIN NOTE
      ================================================= */}

      <div
        className="card border-0 shadow-sm mt-5"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <h5 className="fw-bold text-success">
            🔎 Analytics Summary
          </h5>

          <p className="text-muted mb-0">
            Platform analytics provides administrators
            with an overview of registered users, wildlife
            species, population records, observations,
            surveys and AI-based media analysis activity.
          </p>

        </div>

      </div>

    </div>
  );
}

export default PlatformAnalytics;