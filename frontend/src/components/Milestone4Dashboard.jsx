import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function Milestone4Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_URL}/api/milestone4/dashboard`
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                const result = await response.json();

                setData(result);
            } catch (err) {
                console.error(
                    "Milestone 4 dashboard error:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <section style={styles.container}>
                <div style={styles.loading}>
                    Loading wildlife intelligence dashboard...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section style={styles.container}>
                <div style={styles.error}>
                    <h2>Dashboard Error</h2>
                    <p>{error}</p>

                    <p>
                        Make sure the FastAPI backend is running at:
                    </p>

                    <code>
                        http://127.0.0.1:8000
                    </code>
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section style={styles.container}>
                No dashboard data available.
            </section>
        );
    }

    const summary = data.summary || {};
    const speciesPopulation =
        data.species_population || [];

    return (
        <section style={styles.container}>

            {/* ==================================================
                HEADER
            ================================================== */}

            <div style={styles.header}>
                <h1 style={styles.title}>
                    Wildlife Population Intelligence
                </h1>

                <p style={styles.subtitle}>
                    Milestone 4 Executive Analytics Dashboard
                </p>
            </div>

            {/* ==================================================
                METRIC CARDS
            ================================================== */}

            <div style={styles.metricsGrid}>

                <MetricCard
                    title="Total Records"
                    value={
                        summary.total_records ?? 0
                    }
                />

                <MetricCard
                    title="Species"
                    value={
                        summary.species_count ?? 0
                    }
                />

                <MetricCard
                    title="Population Records"
                    value={speciesPopulation.length}
                />

                <MetricCard
                    title="Data Status"
                    value="Active"
                />

            </div>

            {/* ==================================================
                SPECIES POPULATION
            ================================================== */}

            <div style={styles.card}>

                <h2 style={styles.sectionTitle}>
                    Species Population Records
                </h2>

                <p style={styles.description}>
                    Distribution of wildlife records in the
                    current training dataset.
                </p>

                {speciesPopulation.length === 0 ? (
                    <p>
                        No species population data available.
                    </p>
                ) : (
                    <div style={styles.tableWrapper}>

                        <table style={styles.table}>

                            <thead>
                                <tr>
                                    <th style={styles.th}>
                                        Species
                                    </th>

                                    <th style={styles.th}>
                                        Records
                                    </th>

                                    <th style={styles.th}>
                                        Percentage
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {speciesPopulation.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.species
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {formatSpeciesName(
                                                    item.species
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {item.count ??
                                                    0}
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {item.percentage ??
                                                    0}
                                                %
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ==================================================
                DATA NOTE
            ================================================== */}

            <div style={styles.note}>

                <strong>
                    Data interpretation:
                </strong>

                <p>
                    These values represent records/images
                    available in the current training dataset.
                    They should not be interpreted as the actual
                    number of animals in the Serengeti ecosystem.
                </p>

            </div>

        </section>
    );
}


/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({ title, value }) {
    return (
        <div style={styles.metricCard}>

            <h3 style={styles.metricTitle}>
                {title}
            </h3>

            <strong style={styles.metricValue}>
                {value}
            </strong>

        </div>
    );
}


/* ============================================================
   SPECIES NAME FORMATTER
============================================================ */

function formatSpeciesName(name) {
    if (!name) {
        return "Unknown";
    }

    return name
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (char) =>
            char.toUpperCase()
        );
}


/* ============================================================
   STYLES
============================================================ */

const styles = {
    container: {
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
    },

    header: {
        marginBottom: "30px",
    },

    title: {
        margin: 0,
        fontSize: "32px",
    },

    subtitle: {
        marginTop: "8px",
        color: "#666",
        fontSize: "16px",
    },

    loading: {
        padding: "40px",
        textAlign: "center",
        fontSize: "18px",
    },

    error: {
        padding: "25px",
        border: "1px solid #f0b7b7",
        borderRadius: "10px",
        background: "#fff5f5",
    },

    metricsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },

    metricCard: {
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fff",
    },

    metricTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: 500,
    },

    metricValue: {
        display: "block",
        marginTop: "10px",
        fontSize: "32px",
    },

    card: {
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fff",
    },

    sectionTitle: {
        marginTop: 0,
        marginBottom: "8px",
    },

    description: {
        color: "#666",
        marginBottom: "20px",
    },

    tableWrapper: {
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        textAlign: "left",
        padding: "12px",
        borderBottom: "2px solid #ddd",
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #eee",
    },

    note: {
        marginTop: "25px",
        padding: "20px",
        borderRadius: "10px",
        background: "#f5f5f5",
    },
};