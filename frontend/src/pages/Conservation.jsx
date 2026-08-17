import "./Conservation.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FaLeaf,
  FaShieldAlt,
  FaExclamationTriangle,
  FaRecycle,
  FaTree,
  FaWater,
  FaSeedling,
  FaCheckCircle,
} from "react-icons/fa";

function Conservation() {
  // --------------------------------------------------
  // CONSERVATION INTELLIGENCE SCORES
  // --------------------------------------------------

  const scores = {
    habitatSuitability: 92,
    sustainability: 88,
    habitatQuality: 90,
    environmentalCondition: 86,
    biodiversity: 91,
    protectionReadiness: 84,
    conservationPriority: 82,
    risk: 18,
  };

  // --------------------------------------------------
  // CLASSIFICATION HELPERS
  // --------------------------------------------------

  const getClassification = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Healthy";
    if (score >= 65) return "Moderate Concern";
    if (score >= 45) return "Vulnerable";
    return "Critical";
  };

  const overallScore = Math.round(
    (
      scores.habitatSuitability +
      scores.sustainability +
      scores.habitatQuality +
      scores.environmentalCondition +
      scores.biodiversity
    ) / 5
  );

  const overallStatus = getClassification(overallScore);

  // --------------------------------------------------
  // SUITABILITY / SUSTAINABILITY
  // --------------------------------------------------

  const sustainabilityData = [
    {
      name: "Habitat Suitability",
      score: scores.habitatSuitability,
    },
    {
      name: "Sustainability",
      score: scores.sustainability,
    },
    {
      name: "Habitat Quality",
      score: scores.habitatQuality,
    },
    {
      name: "Environment",
      score: scores.environmentalCondition,
    },
    {
      name: "Biodiversity",
      score: scores.biodiversity,
    },
  ];

  // --------------------------------------------------
  // ENVIRONMENTAL RADAR
  // --------------------------------------------------

  const environmentalData = [
    {
      subject: "Vegetation",
      score: 93,
    },
    {
      subject: "Water",
      score: 87,
    },
    {
      subject: "Climate",
      score: 84,
    },
    {
      subject: "Habitat",
      score: 90,
    },
    {
      subject: "Biodiversity",
      score: 91,
    },
  ];

  // --------------------------------------------------
  // CONSERVATION PRIORITY
  // --------------------------------------------------

  const priorityData = [
    {
      category: "Habitat Protection",
      score: 94,
    },
    {
      category: "Species Protection",
      score: 89,
    },
    {
      category: "Restoration",
      score: 78,
    },
    {
      category: "Monitoring",
      score: 86,
    },
    {
      category: "Resource Planning",
      score: 81,
    },
  ];

  // --------------------------------------------------
  // RISK DISTRIBUTION
  // --------------------------------------------------

  const riskData = [
    {
      name: "Low Risk",
      value: 72,
    },
    {
      name: "Moderate Risk",
      value: 18,
    },
    {
      name: "High Risk",
      value: 7,
    },
    {
      name: "Critical",
      value: 3,
    },
  ];

  const riskColors = [
    "#16a34a",
    "#f59e0b",
    "#f97316",
    "#dc2626",
  ];

  // --------------------------------------------------
  // RECOMMENDATIONS
  // --------------------------------------------------

  const recommendations = [
    {
      icon: <FaTree />,
      title: "Habitat Protection",
      text:
        "Maintain high-quality habitat zones and protect areas showing strong ecological suitability.",
      priority: "High Priority",
    },
    {
      icon: <FaSeedling />,
      title: "Habitat Restoration",
      text:
        "Restore degraded vegetation zones and improve ecological connectivity between suitable habitats.",
      priority: "Medium Priority",
    },
    {
      icon: <FaWater />,
      title: "Water Resource Protection",
      text:
        "Continue monitoring water conditions and protect important wildlife water sources.",
      priority: "High Priority",
    },
    {
      icon: <FaShieldAlt />,
      title: "Wildlife Protection",
      text:
        "Maintain regular monitoring and strengthen protection measures in conservation-sensitive areas.",
      priority: "High Priority",
    },
    {
      icon: <FaRecycle />,
      title: "Sustainable Management",
      text:
        "Prioritize long-term ecosystem sustainability while maintaining habitat quality.",
      priority: "Medium Priority",
    },
  ];

  return (
    <div className="conservation-page">

      {/* HEADER */}

      <div className="conservation-header">

        <div>
          <h1>
            <FaShieldAlt />
            Conservation Intelligence
          </h1>

          <p>
            Habitat sustainability, conservation priority,
            environmental risk and AI-assisted conservation
            recommendations.
          </p>
        </div>

        <div className="analysis-badge">
          Recent Conservation Analysis
        </div>

      </div>

      {/* INFORMATION */}

      <div className="conservation-banner">
        <FaCheckCircle />

        <span>
          Conservation indicators are presented as ecological
          intelligence scores for habitat protection and
          conservation planning.
        </span>
      </div>

      {/* MAIN SCORE */}

      <div className="overall-conservation-card">

        <div className="overall-score-circle">
          <div>
            <strong>{overallScore}%</strong>
            <span>Overall</span>
          </div>
        </div>

        <div className="overall-content">

          <h2>
            Overall Conservation Condition
          </h2>

          <h3>
            {overallStatus}
          </h3>

          <p>
            The ecosystem currently shows strong habitat
            suitability, sustainability and biodiversity
            conditions with manageable conservation risk.
          </p>

          <div className="score-progress">
            <div
              style={{
                width: `${overallScore}%`,
              }}
            />
          </div>

        </div>

      </div>

      {/* SCORE CARDS */}

      <div className="conservation-cards">

        <div className="conservation-card green">

          <div className="card-icon">
            <FaLeaf />
          </div>

          <div>
            <span>Habitat Suitability</span>

            <h2>
              {scores.habitatSuitability}%
            </h2>

            <small>
              {getClassification(
                scores.habitatSuitability
              )}
            </small>
          </div>

        </div>

        <div className="conservation-card blue">

          <div className="card-icon">
            <FaRecycle />
          </div>

          <div>
            <span>Ecosystem Sustainability</span>

            <h2>
              {scores.sustainability}%
            </h2>

            <small>
              {getClassification(
                scores.sustainability
              )}
            </small>
          </div>

        </div>

        <div className="conservation-card purple">

          <div className="card-icon">
            <FaTree />
          </div>

          <div>
            <span>Habitat Quality</span>

            <h2>
              {scores.habitatQuality}%
            </h2>

            <small>
              {getClassification(
                scores.habitatQuality
              )}
            </small>
          </div>

        </div>

        <div className="conservation-card orange">

          <div className="card-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Conservation Risk</span>

            <h2>
              {scores.risk}%
            </h2>

            <small>Low Risk</small>
          </div>

        </div>

      </div>

      {/* SUITABILITY VS SUSTAINABILITY */}

      <div className="section-title">

        <h2>
          Sustainability & Suitability Analysis
        </h2>

        <p>
          Comparative ecological condition indicators
        </p>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h2>
            🌿 Habitat Suitability & Sustainability
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={sustainabilityData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 50,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="score"
                fill="#15803d"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* RISK */}

        <div className="chart-card">

          <h2>
            ⚠️ Conservation Risk Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >

                {riskData.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        riskColors[index]
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

      {/* ENVIRONMENT */}

      <div className="chart-card full-width">

        <h2>
          🌎 Environmental Conservation Condition
        </h2>

        <p>
          Major environmental factors supporting
          conservation suitability.
        </p>

        <ResponsiveContainer
          width="100%"
          height={420}
        >

          <RadarChart
            data={environmentalData}
          >

            <PolarGrid />

            <PolarAngleAxis
              dataKey="subject"
            />

            <PolarRadiusAxis
              domain={[0, 100]}
            />

            <Radar
              name="Environmental Score"
              dataKey="score"
              stroke="#15803d"
              fill="#22c55e"
              fillOpacity={0.55}
            />

            <Tooltip />

          </RadarChart>

        </ResponsiveContainer>

      </div>

      {/* CONSERVATION PRIORITY */}

      <div className="chart-card full-width">

        <h2>
          🛡️ Conservation Priority Analysis
        </h2>

        <p>
          Priority areas for conservation planning,
          restoration and monitoring.
        </p>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <BarChart
            data={priorityData}
            layout="vertical"
            margin={{
              left: 40,
              right: 30,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
            />

            <YAxis
              type="category"
              dataKey="category"
              width={130}
            />

            <Tooltip />

            <Bar
              dataKey="score"
              fill="#2563eb"
              radius={[
                0,
                8,
                8,
                0,
              ]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* CLASSIFICATION */}

      <div className="classification-section">

        <h2>
          Conservation Classification
        </h2>

        <div className="classification-grid">

          <div className="classification excellent">
            <strong>Excellent</strong>
            <span>90–100%</span>
            <b>
              Strong ecological condition
            </b>
          </div>

          <div className="classification healthy">
            <strong>Healthy</strong>
            <span>80–89%</span>
            <b>
              Good conservation condition
            </b>
          </div>

          <div className="classification moderate">
            <strong>Moderate Concern</strong>
            <span>65–79%</span>
            <b>
              Requires monitoring
            </b>
          </div>

          <div className="classification vulnerable">
            <strong>Vulnerable</strong>
            <span>45–64%</span>
            <b>
              Conservation intervention
            </b>
          </div>

          <div className="classification critical">
            <strong>Critical</strong>
            <span>0–44%</span>
            <b>
              Immediate action required
            </b>
          </div>

        </div>

      </div>

      {/* AI RECOMMENDATIONS */}

      <div className="recommendation-section">

        <div className="section-title">

          <h2>
            🤖 Conservation Recommendations
          </h2>

          <p>
            AI-assisted conservation planning suggestions
          </p>

        </div>

        <div className="recommendation-grid">

          {recommendations.map(
            (item, index) => (

              <div
                className="recommendation-card"
                key={index}
              >

                <div className="recommendation-icon">
                  {item.icon}
                </div>

                <div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                  <span>
                    {item.priority}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}

export default Conservation;