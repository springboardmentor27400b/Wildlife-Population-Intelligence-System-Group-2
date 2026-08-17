import "./EcosystemHealth.css";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FaLeaf,
  FaWater,
  FaTree,
  FaPaw,
  FaThermometerHalf,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

function EcosystemHealth() {
  /*
   * Ecosystem Health Indicators
   *
   * These values are used only for the
   * visual ecosystem-health dashboard.
   */

  const indicators = [
    {
      name: "Water Health",
      score: 91,
      icon: <FaWater />,
      color: "#2196f3",
      status: "Excellent",
    },
    {
      name: "Vegetation",
      score: 94,
      icon: <FaTree />,
      color: "#16a34a",
      status: "Excellent",
    },
    {
      name: "Biodiversity",
      score: 89,
      icon: <FaPaw />,
      color: "#8b5cf6",
      status: "Healthy",
    },
    {
      name: "Habitat Quality",
      score: 92,
      icon: <FaLeaf />,
      color: "#22c55e",
      status: "Excellent",
    },
    {
      name: "Climate Condition",
      score: 86,
      icon: <FaThermometerHalf />,
      color: "#f59e0b",
      status: "Good",
    },
  ];

  /*
   * Overall ecosystem health
   */

  const overallHealth = Math.round(
    indicators.reduce(
      (sum, item) => sum + item.score,
      0
    ) / indicators.length
  );

  /*
   * Classification
   */

  const getClassification = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Healthy";
    if (score >= 65) return "Moderate";
    return "Critical";
  };

  const classification = getClassification(
    overallHealth
  );

  /*
   * Sustainability
   */

  const sustainabilityScore = 93;

  /*
   * Ecosystem suitability
   */

  const suitabilityScore = 91;

  /*
   * Risk
   */

  const riskScore = 14;

  const riskLevel =
    riskScore <= 20
      ? "Low Risk"
      : riskScore <= 40
      ? "Moderate Risk"
      : "High Risk";

  /*
   * Radar chart
   */

  const radarData = indicators.map((item) => ({
    subject: item.name,
    score: item.score,
    fullMark: 100,
  }));

  /*
   * Bar chart
   */

  const comparisonData = indicators.map(
    (item) => ({
      name: item.name,
      score: item.score,
    })
  );

  /*
   * Health classification distribution
   */

  const classificationData = [
    {
      name: "Excellent",
      value: 60,
    },
    {
      name: "Healthy",
      value: 25,
    },
    {
      name: "Moderate",
      value: 10,
    },
    {
      name: "Critical",
      value: 5,
    },
  ];

  const classificationColors = [
    "#16a34a",
    "#22c55e",
    "#f59e0b",
    "#dc2626",
  ];

  return (
    <div className="ecosystem-page">

      {/* HEADER */}

      <div className="ecosystem-header">

        <div>
          <h1>
            <FaLeaf />
            Ecosystem Health
          </h1>

          <p>
            Integrated ecosystem condition,
            sustainability and environmental
            health analysis
          </p>
        </div>

        <div className="ecosystem-status">
          <FaShieldAlt />
          Ecosystem Status: {classification}
        </div>

      </div>


      {/* MAIN SCORE */}

      <div className="health-hero">

        <div className="health-score-circle">

          <div>
            <strong>
              {overallHealth}%
            </strong>

            <span>
              Overall Health
            </span>
          </div>

        </div>

        <div className="health-hero-content">

          <h2>
            Overall Ecosystem Health
          </h2>

          <p>
            The ecosystem shows a strong
            environmental condition with
            healthy habitat, vegetation,
            biodiversity and water indicators.
          </p>

          <div className="health-progress">

            <div
              className="health-progress-fill"
              style={{
                width: `${overallHealth}%`,
              }}
            />

          </div>

          <div className="health-labels">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>

        </div>

      </div>


      {/* SUMMARY CARDS */}

      <div className="ecosystem-cards">

        <div className="ecosystem-card green">

          <FaLeaf />

          <div>
            <span>
              Sustainability
            </span>

            <h2>
              {sustainabilityScore}%
            </h2>

            <small>
              Highly Sustainable
            </small>
          </div>

        </div>


        <div className="ecosystem-card blue">

          <FaWater />

          <div>
            <span>
              Ecosystem Suitability
            </span>

            <h2>
              {suitabilityScore}%
            </h2>

            <small>
              Highly Suitable
            </small>
          </div>

        </div>


        <div className="ecosystem-card purple">

          <FaShieldAlt />

          <div>
            <span>
              Ecosystem Health
            </span>

            <h2>
              {overallHealth}%
            </h2>

            <small>
              {classification}
            </small>
          </div>

        </div>


        <div className="ecosystem-card orange">

          <FaExclamationTriangle />

          <div>
            <span>
              Environmental Risk
            </span>

            <h2>
              {riskScore}%
            </h2>

            <small>
              {riskLevel}
            </small>
          </div>

        </div>

      </div>


      {/* INDICATOR CARDS */}

      <div className="indicator-section">

        <div className="section-title">

          <h2>
            Ecosystem Health Indicators
          </h2>

          <p>
            Environmental factors contributing
            to the overall ecosystem condition.
          </p>

        </div>


        <div className="indicator-grid">

          {indicators.map((item) => (

            <div
              className="indicator-card"
              key={item.name}
            >

              <div
                className="indicator-icon"
                style={{
                  background: `${item.color}18`,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              <div className="indicator-info">

                <div className="indicator-top">

                  <strong>
                    {item.name}
                  </strong>

                  <b>
                    {item.score}%
                  </b>

                </div>

                <div className="indicator-bar">

                  <div
                    style={{
                      width: `${item.score}%`,
                      background:
                        item.color,
                    }}
                  />

                </div>

                <span
                  className="indicator-status"
                >
                  {item.status}
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* CHART GRID */}

      <div className="ecosystem-chart-grid">

        {/* RADAR */}

        <div className="ecosystem-chart-card">

          <h2>
            🌿 Ecosystem Health Profile
          </h2>

          <p>
            Comparative assessment of major
            ecosystem indicators.
          </p>

          <ResponsiveContainer
            width="100%"
            height={360}
          >

            <RadarChart
              data={radarData}
            >

              <PolarGrid />

              <PolarAngleAxis
                dataKey="subject"
              />

              <PolarRadiusAxis
                domain={[0, 100]}
              />

              <Radar
                name="Health Score"
                dataKey="score"
                stroke="#15803d"
                fill="#22c55e"
                fillOpacity={0.55}
              />

              <Tooltip />

            </RadarChart>

          </ResponsiveContainer>

        </div>


        {/* BAR */}

        <div className="ecosystem-chart-card">

          <h2>
            📊 Indicator Performance
          </h2>

          <p>
            Health score comparison across
            environmental indicators.
          </p>

          <ResponsiveContainer
            width="100%"
            height={360}
          >

            <BarChart
              data={comparisonData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={80}
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="score"
                fill="#16a34a"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* SECONDARY ANALYTICS */}

      <div className="secondary-grid">

        {/* CLASSIFICATION */}

        <div className="ecosystem-chart-card">

          <h2>
            🏷️ Ecosystem Health Classification
          </h2>

          <p>
            Distribution of ecosystem condition
            categories.
          </p>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={classificationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={105}
                label
              >

                {classificationData.map(
                  (item, index) => (

                    <Cell
                      key={item.name}
                      fill={
                        classificationColors[
                          index
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


        {/* SUSTAINABILITY */}

        <div className="sustainability-card">

          <div className="sustainability-header">

            <div>
              <h2>
                🌎 Sustainability Assessment
              </h2>

              <p>
                Long-term ecosystem sustainability
                indicators.
              </p>
            </div>

            <div className="sustainability-score">
              {sustainabilityScore}%
            </div>

          </div>


          <div className="sustainability-item">

            <div>
              <span>
                Habitat Sustainability
              </span>

              <strong>
                95%
              </strong>
            </div>

            <div className="sustainability-bar">

              <div
                style={{
                  width: "95%",
                }}
              />

            </div>

          </div>


          <div className="sustainability-item">

            <div>
              <span>
                Biodiversity Stability
              </span>

              <strong>
                91%
              </strong>
            </div>

            <div className="sustainability-bar">

              <div
                style={{
                  width: "91%",
                }}
              />

            </div>

          </div>


          <div className="sustainability-item">

            <div>
              <span>
                Resource Availability
              </span>

              <strong>
                94%
              </strong>
            </div>

            <div className="sustainability-bar">

              <div
                style={{
                  width: "94%",
                }}
              />

            </div>

          </div>


          <div className="sustainability-item">

            <div>
              <span>
                Environmental Stability
              </span>

              <strong>
                92%
              </strong>
            </div>

            <div className="sustainability-bar">

              <div
                style={{
                  width: "92%",
                }}
              />

            </div>

          </div>


          <div className="recommendation-box">

            <FaShieldAlt />

            <div>

              <strong>
                Ecosystem Recommendation
              </strong>

              <p>
                Maintain current conservation
                practices and continue monitoring
                key environmental indicators.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* FINAL CLASSIFICATION */}

      <div className="ecosystem-final">

        <div>

          <span>
            Overall Classification
          </span>

          <h2>
            🟢 {classification}
          </h2>

        </div>

        <div>

          <span>
            Suitability
          </span>

          <strong>
            {suitabilityScore}%
          </strong>

        </div>

        <div>

          <span>
            Sustainability
          </span>

          <strong>
            {sustainabilityScore}%
          </strong>

        </div>

        <div>

          <span>
            Risk
          </span>

          <strong>
            {riskScore}%
          </strong>

        </div>

      </div>

    </div>
  );
}

export default EcosystemHealth;