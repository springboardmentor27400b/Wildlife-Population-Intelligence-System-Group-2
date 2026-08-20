console.log("NEW RESEARCHER DASHBOARD LOADED");
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  FaPaw,
  FaClipboardList,
  FaChartLine,
  FaFilePdf,
  FaTree,
  FaMapMarkedAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import { GiElephant } from "react-icons/gi";

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

import { Line, Pie, Bar } from "react-chartjs-2";

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

function ResearcherDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [stats, setStats] = useState({
    total_species: 0,
    total_population: 0,
    endangered_species: 0,
  });

  const [recentSpecies, setRecentSpecies] = useState([]);

  // =====================================================
  // EXISTING DASHBOARD ANALYTICS
  // =====================================================

  const [categoryChart, setCategoryChart] = useState({
    labels: [],
    datasets: [
      {
        data: [],
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
  });

  const [statusChart, setStatusChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Species Count",
        data: [],
        backgroundColor: [
          "#dc3545",
          "#ffc107",
          "#198754",
          "#0d6efd",
          "#6f42c1",
        ],
      },
    ],
  });

  // =====================================================
  // POPULATION ESTIMATION DATA
  // =====================================================

  const [populationDashboard, setPopulationDashboard] =
    useState({
      population_size: 0,
      population_density: 0,
      growth_rate: null,
      species_richness: 0,
      total_species: 0,
      total_observations: 0,
    });

  const [populationSpeciesData, setPopulationSpeciesData] =
    useState([]);

  const [populationTrendData, setPopulationTrendData] =
    useState([]);

  const [migrationData, setMigrationData] = useState([]);

  const [populationLoading, setPopulationLoading] =
    useState(true);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadResearcherDashboard();
  }, []);

  const loadResearcherDashboard = async () => {
    // ===================================================
    // MAIN DASHBOARD STATISTICS
    // ===================================================

    try {
      const response = await api.get("/dashboard");

      const data = response.data;

      setStats({
        total_species: data.total_species || 0,
        total_population: data.total_population || 0,
        endangered_species: data.endangered_species || 0,
      });
    } catch (error) {
      console.log(
        "Dashboard statistics error:",
        error
      );
    }

    // ===================================================
    // RECENT SPECIES
    // ===================================================

    try {
      const response = await api.get("/dashboard/recent");

      setRecentSpecies(response.data || []);
    } catch (error) {
      console.log(
        "Recent species error:",
        error
      );
    }

    // ===================================================
    // SPECIES CATEGORY
    // ===================================================

    try {
      const response = await api.get(
        "/dashboard/category"
      );

      const labels = response.data.map(
        (item) => item.category
      );

      const values = response.data.map(
        (item) => item.count
      );

      setCategoryChart({
        labels,
        datasets: [
          {
            data: values,
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
      });
    } catch (error) {
      console.log(
        "Category analytics error:",
        error
      );
    }

    // ===================================================
    // CONSERVATION STATUS
    // ===================================================

    try {
      const response = await api.get(
        "/dashboard/status"
      );

      const labels = response.data.map(
        (item) => item.status
      );

      const values = response.data.map(
        (item) => item.count
      );

      setStatusChart({
        labels,
        datasets: [
          {
            label: "Species Count",
            data: values,
            backgroundColor: [
              "#dc3545",
              "#ffc107",
              "#198754",
              "#0d6efd",
              "#6f42c1",
            ],
          },
        ],
      });
    } catch (error) {
      console.log(
        "Status analytics error:",
        error
      );
    }

    // ===================================================
    // POPULATION ESTIMATION
    // ===================================================

    try {
      setPopulationLoading(true);

      const [
        dashboardResponse,
        speciesResponse,
        trendResponse,
        migrationResponse,
      ] = await Promise.all([
        api.get("/population/dashboard"),

        api.get(
          "/population/species-distribution"
        ),

        api.get(
          "/population/population-trend"
        ),

        api.get(
          "/population/migration-analysis"
        ),
      ]);

      // Population summary
      setPopulationDashboard(
        dashboardResponse.data || {}
      );

      // Population by species
      setPopulationSpeciesData(
        speciesResponse.data || []
      );

      // Population trend
      setPopulationTrendData(
        trendResponse.data || []
      );

      // Migration analysis
      setMigrationData(
        migrationResponse.data || []
      );

    } catch (error) {
      console.log(
        "Population estimation error:",
        error
      );
    } finally {
      setPopulationLoading(false);
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
                width: "70px",
                height: "70px",
                background,
                color: "white",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </div>

            <h2 className="fw-bold">
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
  // ACTION CARD
  // =====================================================

  const ActionCard = ({
    icon,
    title,
    description,
    background,
    onClick,
  }) => {
    return (
      <div className="col-lg-3 col-md-6">

        <div
          className="card border-0 shadow-lg h-100 text-center"
          style={{
            borderRadius: "20px",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onClick={onClick}
        >

          <div className="card-body p-4">

            <div
              className="mx-auto mb-3"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background,
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </div>

            <h5 className="fw-bold">
              {title}
            </h5>

            <p className="text-muted">
              {description}
            </p>

          </div>

        </div>

      </div>
    );
  };

  // =====================================================
  // POPULATION SPECIES CHART
  // =====================================================

  const populationSpeciesChart = {
    labels: populationSpeciesData.map(
      (item) => item.species
    ),

    datasets: [
      {
        label: "Estimated Population",

        data: populationSpeciesData.map(
          (item) => item.population
        ),

        backgroundColor: [
          "#198754",
          "#0d6efd",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#fd7e14",
          "#20c997",
          "#6610f2",
        ],
      },
    ],
  };

  // =====================================================
  // POPULATION TREND CHART
  // =====================================================

  const populationTrendChart = {
    labels: populationTrendData.map(
      (item) => item.date
    ),

    datasets: [
      {
        label: "Population",

        data: populationTrendData.map(
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
  // MIGRATION COUNT
  // =====================================================

  const migratedCount = migrationData.filter(
    (item) => item.migration === "Yes"
  ).length;

  const stableCount = migrationData.filter(
    (item) => item.migration !== "Yes"
  ).length;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      className="container-fluid"
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "3rem",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, #198754, #0f5132)",
          color: "white",
        }}
      >

        <div className="card-body p-5">

          <h1 className="fw-bold">
            🔬 Wildlife Researcher Dashboard
          </h1>

          <p className="fs-5 mt-3 mb-0">
            Analyze wildlife observations, population
            estimation, biodiversity and habitat information.
          </p>

        </div>

      </div>


      {/* =================================================
          RESEARCH OVERVIEW
      ================================================= */}

      <h3 className="fw-bold text-success mb-4">
        📊 Research Overview
      </h3>

      <div className="row g-4 mb-5">

        <StatCard
          icon={<FaPaw size={32} />}
          value={stats.total_species}
          title="Species Observed"
          background="#198754"
        />

        <StatCard
          icon={<GiElephant size={34} />}
          value={stats.total_population}
          title="Total Wildlife Population"
          background="#0d6efd"
        />

        <StatCard
          icon={<FaTree size={30} />}
          value={stats.endangered_species}
          title="Endangered Species"
          background="#dc3545"
        />

        <StatCard
          icon={<FaClipboardList size={30} />}
          value={populationDashboard.total_observations}
          title="Population Observations"
          background="#6f42c1"
        />

      </div>


      {/* =================================================
          POPULATION ANALYTICS
      ================================================= */}

      <div
        id="population-section"
        className="mb-5"
      >

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h3 className="fw-bold text-success mb-1">
              📈 Population Analytics
            </h3>

            <p className="text-muted mb-0">
              Population estimation and analysis based on
              recorded wildlife observations.
            </p>

          </div>

          <button
            className="btn btn-success"
            onClick={() => navigate("/population")}
          >
            Open Population Estimation
          </button>

        </div>


        {/* Population Intelligence Cards */}

        <div className="row g-4 mb-4">

          <StatCard
            icon={<GiElephant size={34} />}
            value={
              populationDashboard.population_size || 0
            }
            title="Estimated Population"
            background="#198754"
          />

          <StatCard
            icon={<FaChartLine size={32} />}
            value={
              populationDashboard.growth_rate !== null &&
              populationDashboard.growth_rate !== undefined
                ? `${populationDashboard.growth_rate}%`
                : "N/A"
            }
            title="Population Growth Rate"
            background="#0d6efd"
          />

          <StatCard
            icon={<FaPaw size={32} />}
            value={
              populationDashboard.species_richness || 0
            }
            title="Species Richness"
            background="#6f42c1"
          />

          <StatCard
            icon={<FaClipboardList size={32} />}
            value={
              populationDashboard.total_observations || 0
            }
            title="Total Observations"
            background="#fd7e14"
          />

        </div>


        {/* Loading */}

        {populationLoading ? (

          <div className="card border-0 shadow-lg">
            <div className="card-body text-center p-5">

              <div
                className="spinner-border text-success"
                role="status"
              />

              <p className="mt-3 mb-0">
                Loading population intelligence...
              </p>

            </div>
          </div>

        ) : (

          <>

            {/* Charts */}

            <div className="row g-4">

              {/* Population by Species */}

              <div className="col-lg-7">

                <div
                  className="card border-0 shadow-lg h-100"
                  style={{
                    borderRadius: "20px",
                  }}
                >

                  <div className="card-body p-4">

                    <h4 className="fw-bold text-success">
                      🐾 Population by Species
                    </h4>

                    <p className="text-muted">
                      Estimated population for each recorded
                      species.
                    </p>

                    {populationSpeciesData.length > 0 ? (

                      <Bar
                        data={populationSpeciesChart}
                        options={{
                          responsive: true,

                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />

                    ) : (

                      <div className="text-center text-muted py-5">
                        No species population data available.
                      </div>

                    )}

                  </div>

                </div>

              </div>


              {/* Population Trend */}

              <div className="col-lg-5">

                <div
                  className="card border-0 shadow-lg h-100"
                  style={{
                    borderRadius: "20px",
                  }}
                >

                  <div className="card-body p-4">

                    <h4 className="fw-bold text-primary">
                      📈 Population Trend
                    </h4>

                    <p className="text-muted">
                      Population change across observation
                      dates.
                    </p>

                    {populationTrendData.length > 0 ? (

                      <Line
                        data={populationTrendChart}
                        options={{
                          responsive: true,

                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />

                    ) : (

                      <div className="text-center text-muted py-5">
                        No population trend data available.
                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>


            {/* Species Population Table */}

            <div
              className="card border-0 shadow-lg mt-4"
              style={{
                borderRadius: "20px",
              }}
            >

              <div className="card-body p-4">

                <h4 className="fw-bold text-success mb-4">
                  📋 Species Population Details
                </h4>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-success">

                      <tr>
                        <th>Species</th>
                        <th>Estimated Population</th>
                      </tr>

                    </thead>

                    <tbody>

                      {populationSpeciesData.length > 0 ? (

                        populationSpeciesData.map(
                          (item, index) => (

                            <tr key={index}>

                              <td className="fw-semibold">
                                🐾 {item.species}
                              </td>

                              <td>

                                <span className="badge bg-success px-3 py-2">
                                  {item.population}
                                </span>

                              </td>

                            </tr>

                          )
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan="2"
                            className="text-center text-muted py-4"
                          >
                            No population records available.
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>


            {/* Migration Analysis */}

            <div
              className="card border-0 shadow-lg mt-4"
              style={{
                borderRadius: "20px",
              }}
            >

              <div className="card-body p-4">

                <h4 className="fw-bold text-success">
                  🦅 Wildlife Movement Analysis
                </h4>

                <p className="text-muted">
                  Comparison of previous and current species
                  locations.
                </p>


                <div className="row g-4 mb-4">

                  <StatCard
                    icon={<FaArrowUp size={30} />}
                    value={migratedCount}
                    title="Movement Detected"
                    background="#dc3545"
                  />

                  <StatCard
                    icon={<FaPaw size={30} />}
                    value={stableCount}
                    title="Stable Records"
                    background="#198754"
                  />

                </div>


                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-success">

                      <tr>

                        <th>Species</th>

                        <th>
                          Previous Location
                        </th>

                        <th>
                          Current Location
                        </th>

                        <th>Date</th>

                        <th>Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {migrationData.length > 0 ? (

                        migrationData.map(
                          (item, index) => (

                            <tr key={index}>

                              <td className="fw-semibold">
                                🐾 {item.species}
                              </td>

                              <td>
                                {item.previous_location || "-"}
                              </td>

                              <td>
                                {item.current_location || "-"}
                              </td>

                              <td>
                                {item.date || "-"}
                              </td>

                              <td>

                                {item.migration === "Yes" ? (

                                  <span className="badge bg-danger">
                                    Movement Detected
                                  </span>

                                ) : (

                                  <span className="badge bg-success">
                                    Stable
                                  </span>

                                )}

                              </td>

                            </tr>

                          )
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan="5"
                            className="text-center text-muted py-4"
                          >
                            No movement data available.
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </>

        )}

      </div>


      {/* =================================================
          BIODIVERSITY & CONSERVATION STATUS
      ================================================= */}

      <div
        id="biodiversity-section"
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <h3 className="fw-bold text-success">
            🌿 Biodiversity & Conservation Status
          </h3>

          <p className="text-muted">
            Current conservation status and species diversity
            of recorded wildlife.
          </p>


          <div className="row g-4 mt-2">

            {/* Species Category */}

            <div className="col-lg-5">

              <div className="card border-0 bg-light h-100">

                <div className="card-body">

                  <h5 className="fw-bold text-primary">
                    🐾 Species Diversity
                  </h5>

                  <p className="text-muted">
                    Distribution of wildlife species by category.
                  </p>

                  {categoryChart.labels.length > 0 ? (

                    <Pie
                      data={categoryChart}
                      options={{
                        responsive: true,
                      }}
                    />

                  ) : (

                    <div className="text-center text-muted py-5">
                      No biodiversity category data available.
                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* Conservation Status */}

            <div className="col-lg-7">

              <div className="card border-0 bg-light h-100">

                <div className="card-body">

                  <h5 className="fw-bold text-success">
                    🌱 Conservation Status
                  </h5>

                  <p className="text-muted">
                    Current conservation classification of
                    recorded species.
                  </p>

                  {statusChart.labels.length > 0 ? (

                    <Bar
                      data={statusChart}
                      options={{
                        responsive: true,

                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />

                  ) : (

                    <div className="text-center text-muted py-5">
                      No conservation status data available.
                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RESEARCHER TOOLS
      ================================================= */}

      <h3 className="fw-bold text-success mb-4">
        🔬 Researcher Actions
      </h3>

      <div className="row g-4 mb-5">

        <ActionCard
          icon={<FaClipboardList size={35} />}
          title="Species Observations"
          description="Record and review wildlife observations."
          background="#198754"
          onClick={() =>
            navigate("/observation")
          }
        />

        <ActionCard
          icon={<FaChartLine size={35} />}
          title="Population Analytics"
          description="Open complete population estimation dashboard."
          background="#0d6efd"
          onClick={() =>
            navigate("/population")
          }
        />

        <ActionCard
          icon={<FaFilePdf size={35} />}
          title="Biodiversity Reports"
          description="View biodiversity information and export reports."
          background="#dc3545"
          onClick={() => navigate("/reports")}
        />

        <ActionCard
          icon={<FaMapMarkedAlt size={35} />}
          title="Habitat Insights"
          description="Analyze habitat and environmental information."
          background="#6f42c1"
          onClick={() => navigate("/habitat-intelligence")}
        />

      </div>


      {/* =================================================
          RECENT SPECIES RECORDS
      ================================================= */}

      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h3 className="fw-bold text-success">
                🐾 Recent Species Records
              </h3>

              <p className="text-muted mb-0">
                Recently recorded wildlife species.
              </p>

            </div>

            <button
              className="btn btn-success"
              onClick={() =>
                navigate("/species")
              }
            >
              View All
            </button>

          </div>


          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-success">

                <tr>

                  <th>
                    Species
                  </th>

                  <th>
                    Habitat
                  </th>

                  <th>
                    Conservation Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentSpecies.length > 0 ? (

                  recentSpecies.map(
                    (species) => (

                      <tr key={species.id}>

                        <td className="fw-semibold">
                          🦁 {species.species_name}
                        </td>

                        <td>
                          {species.habitat}
                        </td>

                        <td>

                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              species.conservation_status ===
                              "Endangered"
                                ? "bg-danger"
                                : species.conservation_status ===
                                  "Vulnerable"
                                ? "bg-warning text-dark"
                                : "bg-success"
                            }`}
                          >
                            {species.conservation_status}
                          </span>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="3"
                      className="text-center py-4 text-muted"
                    >
                      No species records found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* =================================================
          RESEARCH SUMMARY
      ================================================= */}

      <div
        className="card border-0 shadow-lg"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <h3 className="fw-bold text-success">
            📝 Research Summary
          </h3>

          <div className="row mt-4">

            <div className="col-md-4">

              <div className="p-4 bg-light rounded">

                <h5 className="fw-bold">
                  Species Observations
                </h5>

                <p className="text-muted mb-0">
                  Researchers can record and analyze
                  wildlife observations.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="p-4 bg-light rounded">

                <h5 className="fw-bold">
                  Population Analytics
                </h5>

                <p className="text-muted mb-0">
                  Population estimation, species distribution,
                  population trends and wildlife movement can
                  be analyzed.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="p-4 bg-light rounded">

                <h5 className="fw-bold">
                  Biodiversity
                </h5>

                <p className="text-muted mb-0">
                  Species diversity and conservation status
                  can be monitored for research.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResearcherDashboard;