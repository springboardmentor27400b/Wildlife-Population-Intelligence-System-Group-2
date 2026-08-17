import "./HabitatIntelligence.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";

import {
  FaLeaf,
  FaWater,
  FaTree,
  FaThermometerHalf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

function HabitatIntelligence() {
  // =====================================================
  // HABITAT INTELLIGENCE ANALYTICS
  // Independent Milestone 3 demonstration dataset
  // No Population API / Population records used here.
  // =====================================================

  const overallSuitability = 92;

  const suitabilityData = [
    {
      name: "Highly Suitable",
      value: 98,
    },
    {
      name: "Suitable",
      value: 86,
    },
    {
      name: "Moderate",
      value: 67,
    },
    {
      name: "Unsuitable",
      value: 32,
    },
  ];

  const suitabilityColors = [
    "#15803d",
    "#22c55e",
    "#f59e0b",
    "#dc2626",
  ];

  // =====================================================
  // ENVIRONMENTAL CONDITION
  // =====================================================

  const environmentalData = [
    {
      subject: "Vegetation",
      score: 91,
    },
    {
      subject: "Water",
      score: 87,
    },
    {
      subject: "Biodiversity",
      score: 94,
    },
    {
      subject: "Climate",
      score: 82,
    },
    {
      subject: "Habitat",
      score: 96,
    },
  ];

  // =====================================================
  // HABITAT TYPES
  // =====================================================

  const habitatTypeData = [
    {
      habitat: "Forest",
      suitability: 94,
    },
    {
      habitat: "Wetland",
      suitability: 88,
    },
    {
      habitat: "Grassland",
      suitability: 79,
    },
    {
      habitat: "Woodland",
      suitability: 86,
    },
    {
      habitat: "Riparian",
      suitability: 91,
    },
  ];

  // =====================================================
  // DEGRADATION RISK
  // =====================================================

  const degradationData = [
    {
      name: "Very Low Risk",
      value: 72,
    },
    {
      name: "Low Risk",
      value: 18,
    },
    {
      name: "Medium Risk",
      value: 7,
    },
    {
      name: "High Risk",
      value: 3,
    },
  ];

  const degradationColors = [
    "#16a34a",
    "#65a30d",
    "#f59e0b",
    "#dc2626",
  ];

  // =====================================================
  // HABITAT CONDITION TREND
  // =====================================================

  const conditionTrend = [
    {
      period: "1",
      suitability: 78,
      health: 75,
    },
    {
      period: "2",
      suitability: 81,
      health: 79,
    },
    {
      period: "3",
      suitability: 84,
      health: 82,
    },
    {
      period: "4",
      suitability: 86,
      health: 84,
    },
    {
      period: "5",
      suitability: 89,
      health: 88,
    },
    {
      period: "6",
      suitability: 92,
      health: 91,
    },
  ];

  // =====================================================
  // WATER CONDITION
  // =====================================================

  const waterData = [
    {
      category: "Water Quality",
      score: 87,
    },
    {
      category: "Availability",
      score: 92,
    },
    {
      category: "Purity",
      score: 84,
    },
    {
      category: "Stability",
      score: 89,
    },
  ];

  // =====================================================
  // CLASSIFICATION
  // =====================================================

  const getClassification = () => {
    if (overallSuitability >= 90) {
      return "Highly Suitable";
    }

    if (overallSuitability >= 75) {
      return "Suitable";
    }

    if (overallSuitability >= 50) {
      return "Moderately Suitable";
    }

    return "Unsuitable";
  };

  const classification = getClassification();

  // =====================================================
  // RATIOS
  // =====================================================

  const suitableRatio = 91;

  const degradationRatio = 10;

  const biodiversityRatio = 94;

  const waterRatio = 88;

  return (
    <div className="habitat-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="habitat-header">

        <div>
          <h1>
            <FaLeaf />
            Habitat Intelligence
          </h1>

          <p>
            Habitat suitability, environmental condition
            and ecosystem intelligence analysis
          </p>
        </div>

        <div className="month-badge">
          <FaChartLine />
          Last 1 Month Analysis
        </div>

      </div>

      {/* =================================================
          INFO BANNER
      ================================================= */}

      <div className="info-banner">

        <FaCheckCircle />

        <span>
          Habitat intelligence is generated from
          environmental and ecosystem indicators.
        </span>

      </div>

      {/* =================================================
          MAIN SUMMARY CARDS
      ================================================= */}

      <div className="habitat-cards">

        {/* Overall */}

        <div className="habitat-card green">

          <FaLeaf />

          <div>
            <p>Overall Suitability</p>

            <h2>
              {overallSuitability}%
            </h2>

            <span>
              {classification}
            </span>
          </div>

        </div>

        {/* Suitable */}

        <div className="habitat-card blue">

          <FaTree />

          <div>
            <p>Suitable Habitat</p>

            <h2>
              {suitableRatio}%
            </h2>

            <span>
              Habitat condition suitable
            </span>
          </div>

        </div>

        {/* Degradation */}

        <div className="habitat-card orange">

          <FaExclamationTriangle />

          <div>
            <p>Degradation Risk</p>

            <h2>
              {degradationRatio}%
            </h2>

            <span>
              Low overall degradation risk
            </span>
          </div>

        </div>

        {/* Ecosystem */}

        <div className="habitat-card purple">

          <FaShieldAlt />

          <div>
            <p>Ecosystem Health</p>

            <h2>
              {biodiversityRatio}%
            </h2>

            <span>
              Healthy biodiversity condition
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          SUITABILITY CLASSIFICATION
      ================================================= */}

      <div className="classification-card">

        <h2>
          Habitat Suitability Classification
        </h2>

        <p>
          Environmental suitability classification
          based on habitat quality indicators.
        </p>

        <div className="classification-grid">

          <div className="classification-item high">

            <strong>
              Highly Suitable
            </strong>

            <span>
              90–100%
            </span>

            <b>
              98%
            </b>

          </div>

          <div className="classification-item suitable">

            <strong>
              Suitable
            </strong>

            <span>
              75–89%
            </span>

            <b>
              86%
            </b>

          </div>

          <div className="classification-item moderate">

            <strong>
              Moderately Suitable
            </strong>

            <span>
              50–74%
            </span>

            <b>
              67%
            </b>

          </div>

          <div className="classification-item unsuitable">

            <strong>
              Unsuitable
            </strong>

            <span>
              0–49%
            </span>

            <b>
              32%
            </b>

          </div>

        </div>

      </div>

      {/* =================================================
          FIRST GRAPH ROW
      ================================================= */}

      <div className="habitat-grid">

        {/* Suitability Pie */}

        <div className="chart-card">

          <h2>
            Habitat Suitability Ratio
          </h2>

          <p>
            Distribution of habitat suitability levels.
          </p>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <PieChart>

              <Pie
                data={suitabilityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={105}
                label={({ value }) =>
                  `${value}%`
                }
              >

                {suitabilityData.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        suitabilityColors[index]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip
                formatter={(value) =>
                  `${value}%`
                }
              />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Habitat Types */}

        <div className="chart-card">

          <h2>
            Habitat Type Suitability
          </h2>

          <p>
            Suitability score across major habitat
            categories.
          </p>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <BarChart
              data={habitatTypeData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="habitat"
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip
                formatter={(value) =>
                  `${value}%`
                }
              />

              <Bar
                dataKey="suitability"
                fill="#15803d"
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

      {/* =================================================
          ENVIRONMENTAL RADAR
      ================================================= */}

      <div className="chart-card radar-card">

        <h2>
          Environmental Condition Analysis
        </h2>

        <p>
          Comparative assessment of vegetation,
          water, climate, biodiversity and habitat
          quality.
        </p>

        <ResponsiveContainer
          width="100%"
          height={430}
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

            <Legend />

          </RadarChart>

        </ResponsiveContainer>

      </div>

      {/* =================================================
          SECOND GRAPH ROW
      ================================================= */}

      <div className="habitat-grid">

        {/* Degradation */}

        <div className="chart-card">

          <h2>
            Habitat Degradation Risk
          </h2>

          <p>
            Current environmental degradation risk
            classification.
          </p>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <PieChart>

              <Pie
                data={degradationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={105}
                label={({ value }) =>
                  `${value}%`
                }
              >

                {degradationData.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        degradationColors[
                          index
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip
                formatter={(value) =>
                  `${value}%`
                }
              />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Water */}

        <div className="chart-card">

          <h2>
            <FaWater />
            Water Condition
          </h2>

          <p>
            Water quality and availability indicators.
          </p>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <BarChart
              data={waterData}
              layout="vertical"
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
                width={100}
              />

              <Tooltip
                formatter={(value) =>
                  `${value}%`
                }
              />

              <Bar
                dataKey="score"
                fill="#0284c7"
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

      </div>

      {/* =================================================
          HABITAT CONDITION TREND
      ================================================= */}

      <div className="chart-card">

        <h2>
          <FaChartLine />
          Habitat Condition Trend
        </h2>

        <p>
          Overall suitability and ecosystem health
          trend analysis.
        </p>

        <ResponsiveContainer
          width="100%"
          height={360}
        >

          <LineChart
            data={conditionTrend}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="period"
              tickFormatter={() => ""}
            />

            <YAxis
              domain={[0, 100]}
            />

            <Tooltip
              formatter={(value) =>
                `${value}%`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="suitability"
              name="Habitat Suitability"
              stroke="#15803d"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
            />

            <Line
              type="monotone"
              dataKey="health"
              name="Ecosystem Health"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* =================================================
          KEY INDICATORS
      ================================================= */}

      <div className="habitat-cards">

        <div className="habitat-card green">

          <FaTree />

          <div>
            <p>Vegetation Health</p>

            <h2>
              91%
            </h2>

            <span>
              Excellent condition
            </span>
          </div>

        </div>

        <div className="habitat-card blue">

          <FaWater />

          <div>
            <p>Water Sustainability</p>

            <h2>
              {waterRatio}%
            </h2>

            <span>
              Good water condition
            </span>
          </div>

        </div>

        <div className="habitat-card purple">

          <FaLeaf />

          <div>
            <p>Biodiversity Health</p>

            <h2>
              94%
            </h2>

            <span>
              Very healthy biodiversity
            </span>
          </div>

        </div>

        <div className="habitat-card orange">

          <FaThermometerHalf />

          <div>
            <p>Climate Suitability</p>

            <h2>
              82%
            </h2>

            <span>
              Suitable climate condition
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          AI / DECISION SUMMARY
      ================================================= */}

      <div className="classification-card">

        <h2>
          <FaShieldAlt />
          Habitat Intelligence Assessment
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "20px",
          }}
        >

          <div className="ai-box">

            <h4>
              Overall Condition
            </h4>

            <p>
              Highly Suitable
            </p>

          </div>

          <div className="ai-box">

            <h4>
              Conservation Priority
            </h4>

            <p>
              Low
            </p>

          </div>

          <div className="ai-box">

            <h4>
              Environmental Risk
            </h4>

            <p>
              Low Risk
            </p>

          </div>

          <div className="ai-box">

            <h4>
              Recommended Action
            </h4>

            <p>
              Continue habitat monitoring and
              maintain existing conservation measures.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default HabitatIntelligence;