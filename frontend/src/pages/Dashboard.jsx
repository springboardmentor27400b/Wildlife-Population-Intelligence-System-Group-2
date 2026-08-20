import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import hero from "../assets/hero.png";
import dashboardBg from "../assets/dashboard-bg.jpg";

import {
  FaPaw,
  FaTree,
  FaUsers,
  FaPlusCircle,
  FaClipboardList,
  FaFilePdf,
  FaBell,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaChartLine,
  FaClipboardCheck,
  FaUserCog,
  FaRoute,
  FaExclamationTriangle,
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

function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // CURRENT USER
  // =====================================================

  const user = JSON.parse(localStorage.getItem("user"));
  const role = (user?.role || "").trim();

  console.log("Logged in user:", user);
  console.log("Dashboard role:", role);

  // =====================================================
  // GENERAL DASHBOARD STATES
  // =====================================================

  const [stats, setStats] = useState({
    total_users: 0,
    total_species: 0,
    total_population: 0,
    endangered_species: 0,
    protected_areas: 0,
    active_incidents: 0,
  });

  const [recentSpecies, setRecentSpecies] = useState([]);

  // =====================================================
  // CATEGORY CHART
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

  // =====================================================
  // CONSERVATION STATUS CHART
  // =====================================================

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
  // GENERAL POPULATION CHART
  // =====================================================

  const [populationChart, setPopulationChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Population",
        data: [],
        borderColor: "#198754",
        backgroundColor: "rgba(25,135,84,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  // =====================================================
  // POPULATION ESTIMATION ANALYTICS
  // =====================================================

  const [populationAnalytics, setPopulationAnalytics] =
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

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // ===================================================
    // MAIN DASHBOARD STATISTICS
    // ===================================================

    try {
      const response = await api.get("/dashboard");

      const data = response.data || {};

      setStats({
        total_users: data.total_users || 0,
        total_species: data.total_species || 0,
        total_population: data.total_population || 0,
        endangered_species: data.endangered_species || 0,
        protected_areas: data.protected_areas || 0,
        active_incidents: data.active_incidents || 0,
      });
    } catch (error) {
      console.log(
        "Error fetching dashboard stats:",
        error
      );
    }

    // ===================================================
    // RECENT SPECIES
    // ===================================================

    try {
      const response = await api.get(
        "/dashboard/recent"
      );

      setRecentSpecies(response.data || []);
    } catch (error) {
      console.log(
        "Error fetching recent species:",
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

      const data = response.data || [];

      const labels = data.map(
        (item) => item.category
      );

      const values = data.map(
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
        "Error fetching category chart:",
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

      const data = response.data || [];

      const labels = data.map(
        (item) => item.status
      );

      const values = data.map(
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
        "Error fetching status chart:",
        error
      );
    }

    // ===================================================
    // GENERAL POPULATION ANALYTICS
    // ===================================================

    try {
      const response = await api.get(
        "/dashboard/population"
      );

      const data = response.data || [];

      const labels = data.map(
        (item) => item.species
      );

      const values = data.map(
        (item) => item.population
      );

      setPopulationChart({
        labels,
        datasets: [
          {
            label: "Population",
            data: values,
            borderColor: "#198754",
            backgroundColor:
              "rgba(25,135,84,0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.log(
        "Error fetching population chart:",
        error
      );
    }

    // ===================================================
    // POPULATION ESTIMATION ANALYTICS
    // ===================================================

    try {
      const [
        populationDashboardResponse,
        speciesDistributionResponse,
        populationTrendResponse,
      ] = await Promise.all([
        api.get("/population/dashboard"),

        api.get(
          "/population/species-distribution"
        ),

        api.get(
          "/population/population-trend"
        ),
      ]);

      setPopulationAnalytics(
        populationDashboardResponse.data || {
          population_size: 0,
          population_density: 0,
          growth_rate: null,
          species_richness: 0,
          total_species: 0,
          total_observations: 0,
        }
      );

      setPopulationSpeciesData(
        speciesDistributionResponse.data || []
      );

      setPopulationTrendData(
        populationTrendResponse.data || []
      );
    } catch (error) {
      console.log(
        "Error fetching population estimation analytics:",
        error
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged Out Successfully!");

    navigate("/login");
  };

  // =====================================================
  // HERO
  // =====================================================

  const DashboardHero = ({
    title,
    description,
  }) => {
    return (
      <div
        className="p-5 rounded-4 mb-5"
        style={{
          backgroundImage: `linear-gradient(
            rgba(0,0,0,.45),
            rgba(0,0,0,.55)
          ), url(${dashboardBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          boxShadow:
            "0 15px 40px rgba(0,0,0,.25)",
          borderRadius: "25px",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="row align-items-center w-100">
          <div className="col-lg-8">
            <h1 className="fw-bold display-5">
              👋 Welcome Back
            </h1>

            <h2 className="fw-bold mt-3">
              {title}
            </h2>

            <p className="mt-3 fs-5 text-light">
              {description}
            </p>

            <div className="mt-4">
              <button
                className="btn btn-light btn-lg me-3"
                onClick={() =>
                  navigate("/species")
                }
              >
                View Species
              </button>

              <button
                className="btn btn-success btn-lg"
                onClick={() =>
                  navigate("/observation")
                }
              >
                Add Observation
              </button>
            </div>
          </div>

          <div className="col-lg-4 text-center">
            <img
              src={hero}
              alt="Wildlife"
              style={{
                width: "85%",
                maxWidth: "280px",
                filter:
                  "drop-shadow(0 10px 25px rgba(0,0,0,.3))",
              }}
            />
          </div>
        </div>
      </div>
    );
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
  // QUICK ACTION
  // =====================================================

  const QuickAction = ({
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
          }}
          onClick={onClick}
        >
          <div className="card-body p-5">
            <div
              className="mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
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
  // POPULATION ESTIMATION SECTION
  // =====================================================

  const PopulationEstimationAnalytics = () => {
    return (
      <div
        id="population-section"
        className="mt-5"
      >
        <div className="mb-4">
          <h3 className="fw-bold text-success">
            📊 Population Estimation Analytics
          </h3>

          <p className="text-muted">
            Estimated wildlife population based on
            recorded observations and population counts.
          </p>
        </div>

        <div className="row g-4 mb-5">

          <StatCard
            icon={<GiElephant size={34} />}
            value={
              populationAnalytics.population_size
            }
            title="Estimated Population Size"
            background="#198754"
          />

          <StatCard
            icon={<FaChartLine size={30} />}
            value={
              populationAnalytics.growth_rate !==
              null
                ? `${populationAnalytics.growth_rate}%`
                : "N/A"
            }
            title="Population Growth"
            background="#0d6efd"
          />

          <StatCard
            icon={<FaPaw size={32} />}
            value={
              populationAnalytics.species_richness
            }
            title="Species Richness"
            background="#6f42c1"
          />

          <StatCard
            icon={<FaClipboardList size={30} />}
            value={
              populationAnalytics.total_observations
            }
            title="Total Observations"
            background="#fd7e14"
          />

        </div>

        <div className="row g-4">

          <div className="col-lg-6">
            <div
              className="card border-0 shadow-lg h-100"
              style={{
                borderRadius: "20px",
              }}
            >
              <div className="card-body p-4">

                <h4 className="fw-bold text-success">
                  🐘 Population by Species
                </h4>

                <p className="text-muted">
                  Estimated population distribution
                  across recorded species.
                </p>

                {populationSpeciesData.length >
                0 ? (
                  <Bar
                    data={{
                      labels:
                        populationSpeciesData.map(
                          (item) =>
                            item.species
                        ),

                      datasets: [
                        {
                          label:
                            "Population",

                          data:
                            populationSpeciesData.map(
                              (item) =>
                                item.population
                            ),

                          backgroundColor:
                            "#198754",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,

                      plugins: {
                        legend: {
                          display: true,
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

          <div className="col-lg-6">
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
                  Population changes across recorded
                  observation dates.
                </p>

                {populationTrendData.length >
                0 ? (
                  <Line
                    data={{
                      labels:
                        populationTrendData.map(
                          (item) =>
                            item.date
                        ),

                      datasets: [
                        {
                          label:
                            "Population",

                          data:
                            populationTrendData.map(
                              (item) =>
                                item.population
                            ),

                          borderColor:
                            "#0d6efd",

                          backgroundColor:
                            "rgba(13,110,253,0.15)",

                          fill: true,

                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,

                      plugins: {
                        legend: {
                          display: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-muted text-center py-5">
                    No population trend data available.
                  </p>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // =====================================================
  // GENERAL ANALYTICS SECTION
  // =====================================================

  const AnalyticsSection = () => {
    return (
      <>
        <div className="row mt-5">

          <div className="col-lg-8 mb-4">

            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
              }}
            >

              <div className="card-header bg-white border-0 pt-4">

                <h4 className="fw-bold text-success mb-0">
                  📈 Wildlife Population
                </h4>

                <small className="text-muted">
                  Population distribution of recorded
                  wildlife species
                </small>

              </div>

              <div className="card-body">

                <Line
                  data={populationChart}
                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />

              </div>

            </div>

          </div>

          <div className="col-lg-4 mb-4">

            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
              }}
            >

              <div className="card-header bg-white border-0 pt-4">

                <h4 className="fw-bold text-primary mb-0">
                  🐾 Species Category
                </h4>

              </div>

              <div className="card-body">

                <Pie
                  data={categoryChart}
                />

              </div>

            </div>

          </div>

        </div>

        <div className="row">

          <div className="col-lg-12">

            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
              }}
            >

              <div className="card-header bg-white border-0 pt-4">

                <h4 className="fw-bold text-success">
                  🌿 Conservation Status
                </h4>

              </div>

              <div className="card-body">

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

              </div>

            </div>

          </div>

        </div>

        <div
          className="card border-0 shadow-lg mt-5"
          style={{
            borderRadius: "20px",
          }}
        >

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h3 className="fw-bold text-success mb-1">
                  🌿 Recent Wildlife Records
                </h3>

                <small className="text-muted">
                  Latest species added to the system
                </small>

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

              <table
                className="table align-middle"
                style={{
                  borderCollapse: "separate",
                  borderSpacing: "0 10px",
                }}
              >

                <thead
                  style={{
                    background: "#198754",
                    color: "#fff",
                  }}
                >

                  <tr>

                    <th>
                      Species
                    </th>

                    <th>
                      Habitat
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentSpecies.length >
                  0 ? (

                    recentSpecies.map(
                      (species) => (

                        <tr
                          key={species.id}
                          style={{
                            background:
                              "#fff",

                            boxShadow:
                              "0 3px 10px rgba(0,0,0,.08)",
                          }}
                        >

                          <td
                            style={{
                              fontWeight:
                                "600",

                              color:
                                "#222",
                            }}
                          >
                            🦁{" "}
                            {
                              species.species_name
                            }
                          </td>

                          <td
                            style={{
                              color:
                                "#555",
                            }}
                          >
                            {
                              species.habitat
                            }
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
                              {
                                species.conservation_status
                              }
                            </span>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="3"
                        className="text-center py-4"
                      >
                        No Species Found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      </>
    );
  };

  // =====================================================
  // RESEARCHER DASHBOARD
  // =====================================================

  const ResearcherDashboard = () => {
    return (
      <>
        <DashboardHero
          title="Wildlife Researcher Dashboard"
          description="Monitor species observations, population estimation, biodiversity and habitat information."
        />

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
            title="Wildlife Population"
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
            value={recentSpecies.length}
            title="Recent Records"
            background="#6f42c1"
          />

        </div>

        <AnalyticsSection />

        <PopulationEstimationAnalytics />

        <div className="mt-5">

          <h3 className="fw-bold text-success mb-4">
            🔬 Researcher Actions
          </h3>

          <div className="row g-4">

            <QuickAction
              icon={
                <FaPlusCircle size={38} />
              }
              title="Add Species"
              description="Register wildlife species."
              background="#198754"
              onClick={() =>
                navigate("/species")
              }
            />

            <QuickAction
              icon={
                <FaClipboardList
                  size={38}
                />
              }
              title="Record Observation"
              description="Record wildlife observations."
              background="#0d6efd"
              onClick={() =>
                navigate("/observation")
              }
            />

            <QuickAction
              icon={<FaChartLine size={38} />}
              title="Population Analytics"
              description="Analyze population estimation and trends."
              background="#ffc107"
              onClick={() =>
                document
                  .getElementById(
                    "population-section"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            />

            <QuickAction
              icon={<FaFilePdf size={38} />}
              title="Biodiversity Reports"
              description="View biodiversity reports and export reports."
              background="#dc3545"
              onClick={() =>
                navigate("/reports")
              }
            />

            <QuickAction
              icon={<FaMapMarkedAlt size={38} />}
              title="Habitat Insights"
              description="Analyze habitat and environmental information."
              background="#6f42c1"
              onClick={() =>
                navigate("/habitat")
              }
            />

          </div>

        </div>
      </>
    );
  };

  // =====================================================
  // CONSERVATION OFFICER DASHBOARD
  // =====================================================

  const ConservationOfficerDashboard = () => {
    return (
      <>
        <DashboardHero
          title="Conservation Officer Dashboard"
          description="Monitor wildlife threats, conservation priorities, species trends and restoration activities."
        />

        <div className="row g-4 mb-5">

          <StatCard
            icon={
              <FaShieldAlt size={32} />
            }
            value={
              stats.endangered_species
            }
            title="Threatened Species"
            background="#dc3545"
          />

          <StatCard
            icon={<FaPaw size={32} />}
            value={stats.total_species}
            title="Species Under Monitoring"
            background="#198754"
          />

          <StatCard
            icon={<FaTree size={32} />}
            value={
              stats.total_population
            }
            title="Population Monitored"
            background="#0d6efd"
          />

          <StatCard
            icon={<FaBell size={30} />}
            value="0"
            title="Active Alerts"
            background="#ffc107"
          />

        </div>

        <div className="row g-4 mb-5">

          <QuickAction
            icon={<FaBell size={38} />}
            title="Threat Monitoring"
            description="Monitor wildlife threats."
            background="#dc3545"
            onClick={() =>
              navigate("/threat-monitoring")
            }
          />

          <QuickAction
            icon={<FaShieldAlt size={38} />}
            title="Conservation Priorities"
            description="View priority species."
            background="#198754"
            onClick={() =>
              navigate("/conservation-priorities")
            }
          />

          <QuickAction
            icon={<FaChartLine size={38} />}
            title="Species Trend Analysis"
            description="Analyze species population trends."
            background="#0d6efd"
            onClick={() =>
              navigate("/species-trends")
            }
          />

          <QuickAction
            icon={<FaTree size={38} />}
            title="Restoration Recommendations"
            description="View habitat restoration recommendations."
            background="#6f42c1"
            onClick={() =>
              navigate("/restoration-recommendations")
            }
          />

        </div>

        <AnalyticsSection />
      </>
    );
  };

  // =====================================================
  // FOREST DEPARTMENT DASHBOARD
  // =====================================================

  const ForestDepartmentDashboard = () => {
    return (
      <>
        <DashboardHero
          title="Forest Department Dashboard"
          description="Monitor protected areas, wildlife movement, patrol activities and forest incidents."
        />

        <div className="row g-4 mb-5">

          <StatCard
            icon={<FaTree size={32} />}
            value={stats.protected_areas}
            title="Protected Areas"
            background="#198754"
          />

          <StatCard
            icon={<FaPaw size={32} />}
            value={stats.total_species}
            title="Species Monitored"
            background="#0d6efd"
          />

          <StatCard
            icon={<FaMapMarkedAlt size={32} />}
            value={stats.total_population}
            title="Wildlife Population"
            background="#ffc107"
          />

          <StatCard
            icon={<FaExclamationTriangle size={32} />}
            value={stats.active_incidents}
            title="Active Incidents"
            background="#dc3545"
          />

        </div>

        <div className="mt-4">

          <div className="mb-4">

            <h3 className="fw-bold text-success">
              🌲 Forest Department Operations
            </h3>

            <p className="text-muted">
              Monitor forest areas, analyze wildlife movement,
              plan patrol activities and manage forest incidents.
            </p>

          </div>

          <div className="row g-4">

            <QuickAction
              icon={<FaTree size={38} />}
              title="Protected Area Monitoring"
              description="Monitor protected forest areas and their current status."
              background="#198754"
              onClick={() =>
                navigate("/protected-area-monitoring")
              }
            />

            <QuickAction
              icon={<FaRoute size={38} />}
              title="Wildlife Movement Analysis"
              description="Analyze wildlife movement patterns and activity areas."
              background="#0d6efd"
              onClick={() =>
                navigate("/wildlife-movement")
              }
            />

            <QuickAction
              icon={<FaClipboardCheck size={38} />}
              title="Patrol Planning"
              description="Plan and manage forest patrol activities."
              background="#ffc107"
              onClick={() =>
                navigate("/patrol-planning")
              }
            />

            <QuickAction
              icon={<FaBell size={38} />}
              title="Incident Reports"
              description="View and manage reported forest incidents."
              background="#dc3545"
              onClick={() =>
                navigate("/incident-reports")
              }
            />

          </div>

        </div>

        <div className="mt-5">

          <div
            className="card border-0 shadow-lg"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <h4 className="fw-bold text-success mb-1">
                    🔔 Forest Alerts
                  </h4>

                  <p className="text-muted mb-0">
                    Check the latest wildlife and forest alerts.
                  </p>

                </div>

                <button
                  className="btn btn-success"
                  onClick={() =>
                    navigate("/notifications")
                  }
                >
                  <FaBell className="me-2" />
                  View Alerts
                </button>

              </div>

            </div>

          </div>

        </div>

      </>
    );
  };

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  const AdminDashboard = () => {
    return (
      <>
        <DashboardHero
          title="Administrator Dashboard"
          description="Manage users, monitor the platform and control wildlife monitoring systems."
        />

        <div className="row g-4 mb-5">

          <StatCard
            icon={<FaUsers size={32} />}
            value={stats.total_users}
            title="Registered Users"
            background="#198754"
          />

          <StatCard
            icon={<FaPaw size={32} />}
            value={stats.total_species}
            title="Total Species"
            background="#0d6efd"
          />

          <StatCard
            icon={
              <GiElephant size={34} />
            }
            value={
              stats.total_population
            }
            title="Total Population"
            background="#ffc107"
          />

          <StatCard
            icon={
              <FaShieldAlt size={32} />
            }
            value={
              stats.endangered_species
            }
            title="Endangered Species"
            background="#dc3545"
          />

        </div>

        <div className="row g-4 mb-5">

          <QuickAction
            icon={
              <FaUserCog size={38} />
            }
            title="User Management"
            description="Manage system users and roles."
            background="#198754"
            onClick={() =>
              navigate("/admin/users")
            }
          />

          <QuickAction
            icon={
              <FaChartLine size={38} />
            }
            title="Platform Analytics"
            description="View system analytics."
            background="#0d6efd"
            onClick={() =>
              navigate("/admin/analytics")
            }
          />

          <QuickAction
            icon={
              <FaClipboardCheck
                size={38}
              />
            }
            title="Monitoring Management"
            description="Manage monitoring systems."
            background="#ffc107"
            onClick={() =>
              navigate("/admin/monitoring")
            }
          />

          {/* =================================================
              UPDATED REPORT GENERATION CARD
              ================================================= */}

          <QuickAction
            icon={
              <FaFilePdf size={38} />
            }
            title="Report Generation"
            description="Generate system reports."
            background="#dc3545"
            onClick={() =>
              navigate("/reports")
            }
          />

        </div>

        <AnalyticsSection />
      </>
    );
  };

  // =====================================================
  // ROLE BASED RENDERING
  // =====================================================

  const renderRoleDashboard = () => {
    const normalizedRole =
      role.toLowerCase();

    console.log(
      "Normalized role:",
      normalizedRole
    );

    // =================================================
    // RESEARCHER
    // =================================================

    if (
      normalizedRole ===
        "researcher" ||
      normalizedRole ===
        "wildlife researcher"
    ) {
      return (
        <ResearcherDashboard />
      );
    }

    // =================================================
    // CONSERVATION OFFICER
    // =================================================

    if (
      normalizedRole ===
      "conservation officer"
    ) {
      return (
        <ConservationOfficerDashboard />
      );
    }

    // =================================================
    // FOREST DEPARTMENT
    // =================================================

    if (
      normalizedRole ===
        "forest department officer" ||
      normalizedRole ===
        "forest department"
    ) {
      return (
        <ForestDepartmentDashboard />
      );
    }

    // =================================================
    // ADMIN
    // =================================================

    if (
      normalizedRole ===
        "administrator" ||
      normalizedRole === "admin"
    ) {
      return <AdminDashboard />;
    }

    // =================================================
    // INVALID ROLE
    // =================================================

    return (
      <div className="alert alert-danger">

        <h4>
          Access Denied
        </h4>

        <p>
          Your account does not have a
          valid dashboard role.
        </p>

        <p>
          Current role:{" "}
          <strong>
            {role || "Unknown"}
          </strong>
        </p>

        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    );
  };

  // =====================================================
  // MAIN RETURN
  // =====================================================

  return (
    <div
      className="container-fluid dashboard-page"
      style={{
        paddingTop: "1.25rem",
        paddingBottom: "3rem",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      {renderRoleDashboard()}
    </div>
  );
}

export default Dashboard;