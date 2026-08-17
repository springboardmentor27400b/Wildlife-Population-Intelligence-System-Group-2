import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
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

function Analytics() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/wildlife_data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load wildlife data");
        }

        return res.json();
      })
      .then((data) => {
        setAnimals(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const analytics = useMemo(() => {
    const totalRecords = animals.length;

    const totalPopulation = animals.reduce(
      (sum, animal) => sum + Number(animal.population || 0),
      0
    );

    const averageHealth =
      totalRecords > 0
        ? (
            animals.reduce(
              (sum, animal) => sum + Number(animal.health || 0),
              0
            ) / totalRecords
          ).toFixed(1)
        : 0;

    const averageConfidence =
      totalRecords > 0
        ? (
            animals.reduce(
              (sum, animal) => sum + Number(animal.confidence || 0),
              0
            ) / totalRecords
          ).toFixed(1)
        : 0;

    const speciesCount = {};
    const forestCount = {};
    const statusCount = {};
    const detectionCount = {};

    animals.forEach((animal) => {
      speciesCount[animal.species] =
        (speciesCount[animal.species] || 0) + 1;

      forestCount[animal.forest] =
        (forestCount[animal.forest] || 0) + 1;

      statusCount[animal.status] =
        (statusCount[animal.status] || 0) + 1;

      detectionCount[animal.detectionType] =
        (detectionCount[animal.detectionType] || 0) + 1;
    });

    const speciesChartData = Object.entries(speciesCount).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    const forestChartData = Object.entries(forestCount).map(
      ([name, value]) => ({
        name: name.replace(" Tiger Reserve", ""),
        fullName: name,
        value,
      })
    );

    const statusChartData = Object.entries(statusCount).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    const detectionChartData = Object.entries(detectionCount).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      totalRecords,
      totalPopulation,
      averageHealth,
      averageConfidence,
      speciesCount,
      forestCount,
      statusCount,
      detectionCount,
      speciesChartData,
      forestChartData,
      statusChartData,
      detectionChartData,
    };
  }, [animals]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
        <h2>Loading Wildlife Analytics...</h2>
        <p>Please wait while the monitoring data is loaded.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <div style={styles.titleIcon}>📊</div>

            <div>
              <h1 style={styles.title}>Wildlife Analytics</h1>

              <p style={styles.subtitle}>
                AI-powered analysis of Maharashtra wildlife
                monitoring data
              </p>
            </div>
          </div>
        </div>

        <div style={styles.badge}>
          <span style={styles.badgeDot}></span>
          Live Analytics
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div style={styles.cards}>
        <StatCard
          icon="📋"
          title="Total Records"
          value={analytics.totalRecords}
          description="Detection records"
          color="#2d6a4f"
        />

        <StatCard
          icon="🐾"
          title="Total Population"
          value={analytics.totalPopulation.toLocaleString()}
          description="Animals monitored"
          color="#40916c"
        />

        <StatCard
          icon="❤️"
          title="Average Health"
          value={`${analytics.averageHealth}%`}
          description="Overall health score"
          color="#52b788"
        />

        <StatCard
          icon="🤖"
          title="AI Confidence"
          value={`${analytics.averageConfidence}%`}
          description="Detection accuracy"
          color="#6a4c93"
        />
      </div>

      {/* CHART ROW 1 */}

      <div style={styles.chartGrid}>
        {/* SPECIES BAR CHART */}

        <ChartCard
          title="Species Detection"
          subtitle="Number of monitoring records by species"
          large
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={analytics.speciesChartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 50,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e9ecef"
              />

              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{
                  fill: "#52796f",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "#52796f",
                }}
              />

              <Tooltip
                contentStyle={styles.tooltip}
                cursor={{
                  fill: "rgba(45,106,79,0.08)",
                }}
              />

              <Bar
                dataKey="value"
                fill="#2d6a4f"
                radius={[7, 7, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* HEALTH STATUS */}

        <ChartCard
          title="Animal Health Status"
          subtitle="Distribution of current animal status"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.statusChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={4}
              >
                {analytics.statusChartData.map(
                  (entry, index) => {
                    const colors = {
                      Healthy: "#40916c",
                      Monitoring: "#f4a261",
                      Endangered: "#e63946",
                    };

                    return (
                      <Cell
                        key={`status-${index}`}
                        fill={
                          colors[entry.name] ||
                          "#6c757d"
                        }
                      />
                    );
                  }
                )}
              </Pie>

              <Tooltip contentStyle={styles.tooltip} />

              <Legend
                verticalAlign="bottom"
                height={40}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CHART ROW 2 */}

      <div style={styles.chartGrid}>
        {/* FOREST CHART */}

        <ChartCard
          title="Forest-wise Records"
          subtitle="Monitoring records across wildlife areas"
          large
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={analytics.forestChartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 30,
                left: 30,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e9ecef"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{
                  fill: "#52796f",
                }}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{
                  fill: "#344e41",
                  fontSize: 11,
                }}
              />

              <Tooltip
                contentStyle={styles.tooltip}
                formatter={(value) => [
                  value,
                  "Records",
                ]}
                labelFormatter={(label) => label}
              />

              <Bar
                dataKey="value"
                fill="#40916c"
                radius={[0, 7, 7, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI METHODS */}

        <ChartCard
          title="AI Detection Methods"
          subtitle="How wildlife detections are being identified"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.detectionChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={120}
                innerRadius={65}
                paddingAngle={4}
              >
                {analytics.detectionChartData.map(
                  (entry, index) => {
                    const colors = [
                      "#6a4c93",
                      "#2d6a4f",
                      "#40916c",
                      "#f4a261",
                    ];

                    return (
                      <Cell
                        key={`detection-${index}`}
                        fill={
                          colors[index % colors.length]
                        }
                      />
                    );
                  }
                )}
              </Pie>

              <Tooltip contentStyle={styles.tooltip} />

              <Legend
                verticalAlign="bottom"
                height={40}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* DATA QUALITY */}

      <div style={styles.quality}>
        <div style={styles.qualityHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              AI Data Quality
            </h2>

            <p style={styles.sectionSubtitle}>
              Overview of the quality and coverage of
              wildlife monitoring data
            </p>
          </div>

          <div style={styles.qualityBadge}>
            ✓ Data Verified
          </div>
        </div>

        <div style={styles.qualityGrid}>
          <QualityItem
            icon="📋"
            title="Records Processed"
            value={`${analytics.totalRecords}/100`}
            description="Wildlife detection records"
          />

          <QualityItem
            icon="🎯"
            title="AI Confidence"
            value={`${analytics.averageConfidence}%`}
            description="Average detection confidence"
          />

          <QualityItem
            icon="❤️"
            title="Health Monitoring"
            value={`${analytics.averageHealth}%`}
            description="Average animal health score"
          />

          <QualityItem
            icon="🌲"
            title="Monitoring Areas"
            value={Object.keys(analytics.forestCount).length}
            description="Wildlife monitoring locations"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================= */
/* STAT CARD */
/* ============================= */

function StatCard({
  icon,
  title,
  value,
  description,
  color,
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          background: `${color}18`,
          color: color,
        }}
      >
        {icon}
      </div>

      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>

        <h2 style={styles.statValue}>{value}</h2>

        <p style={styles.statDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================= */
/* CHART CARD */
/* ============================= */

function ChartCard({
  title,
  subtitle,
  children,
  large,
}) {
  return (
    <div
      style={{
        ...styles.chartCard,
        ...(large ? styles.chartCardLarge : {}),
      }}
    >
      <div style={styles.chartHeader}>
        <div>
          <h2 style={styles.cardTitle}>{title}</h2>

          <p style={styles.cardSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div style={styles.chartContainer}>
        {children}
      </div>
    </div>
  );
}

/* ============================= */
/* QUALITY ITEM */
/* ============================= */

function QualityItem({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div style={styles.qualityItem}>
      <div style={styles.qualityIcon}>{icon}</div>

      <div>
        <p style={styles.qualityTitle}>{title}</p>

        <h2 style={styles.qualityValue}>{value}</h2>

        <p style={styles.qualityDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================= */
/* STYLES */
/* ============================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f6",
    padding: "30px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  loading: {
    minHeight: "100vh",
    background: "#f5f7f6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#1b4332",
  },

  loadingSpinner: {
    width: "45px",
    height: "45px",
    border: "5px solid #d8f3dc",
    borderTop: "5px solid #2d6a4f",
    borderRadius: "50%",
    marginBottom: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  titleIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    background: "#d8f3dc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  title: {
    margin: 0,
    color: "#1b4332",
    fontSize: "32px",
    fontWeight: "700",
  },

  subtitle: {
    color: "#6c757d",
    margin: "7px 0 0",
    fontSize: "15px",
  },

  badge: {
    background: "#d8f3dc",
    color: "#1b4332",
    padding: "10px 18px",
    borderRadius: "25px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  },

  badgeDot: {
    width: "8px",
    height: "8px",
    background: "#2d6a4f",
    borderRadius: "50%",
    display: "inline-block",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow:
      "0 3px 14px rgba(0,0,0,0.07)",
    border: "1px solid #edf1ee",
  },

  statIcon: {
    width: "55px",
    height: "55px",
    minWidth: "55px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  statContent: {
    minWidth: 0,
  },

  statTitle: {
    margin: 0,
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "600",
  },

  statValue: {
    margin: "5px 0 2px",
    color: "#1b4332",
    fontSize: "27px",
  },

  statDescription: {
    margin: 0,
    color: "#8a938d",
    fontSize: "12px",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  chartCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow:
      "0 3px 14px rgba(0,0,0,0.07)",
    border: "1px solid #edf1ee",
    minWidth: 0,
  },

  chartCardLarge: {
    minWidth: 0,
  },

  chartHeader: {
    marginBottom: "10px",
  },

  cardTitle: {
    color: "#1b4332",
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#8a938d",
    margin: "6px 0 0",
    fontSize: "13px",
  },

  chartContainer: {
    width: "100%",
    minHeight: "350px",
    marginTop: "5px",
  },

  tooltip: {
    background: "#ffffff",
    border: "1px solid #d8e5dc",
    borderRadius: "10px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.1)",
  },

  quality: {
    background: "#ffffff",
    marginTop: "5px",
    padding: "25px",
    borderRadius: "16px",
    boxShadow:
      "0 3px 14px rgba(0,0,0,0.07)",
    border: "1px solid #edf1ee",
  },

  qualityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#1b4332",
    margin: 0,
    fontSize: "20px",
  },

  sectionSubtitle: {
    color: "#8a938d",
    margin: "6px 0 0",
    fontSize: "13px",
  },

  qualityBadge: {
    background: "#d8f3dc",
    color: "#2d6a4f",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  qualityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  qualityItem: {
    background: "#f1f8f4",
    padding: "18px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  qualityIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "11px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  qualityTitle: {
    margin: 0,
    color: "#52796f",
    fontSize: "13px",
  },

  qualityValue: {
    margin: "5px 0",
    color: "#1b4332",
    fontSize: "24px",
  },

  qualityDescription: {
    margin: 0,
    color: "#6c757d",
    fontSize: "12px",
  },
};

export default Analytics;