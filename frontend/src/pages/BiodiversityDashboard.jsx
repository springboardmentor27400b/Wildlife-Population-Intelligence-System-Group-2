import { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import api from "../api";


const PIE_COLORS = [
    "#16a34a",
    "#2563eb",
    "#f59e0b",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
    "#db2777",
    "#65a30d"
];


export default function BiodiversityDashboard() {

    const [biodiversity, setBiodiversity] = useState(null);
    const [diversity, setDiversity] = useState(null);
    const [habitat, setHabitat] = useState([]);
    const [ecosystem, setEcosystem] = useState(null);
    const [conservation, setConservation] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [metrics, setMetrics] = useState(null);


    useEffect(() => {

        loadBiodiversityData();

    }, []);


    const loadBiodiversityData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                biodiversityResponse,
                diversityResponse,
                habitatResponse,
                ecosystemResponse,
                conservationResponse,
                metricsResponse
            ] = await Promise.all([

                api.get("/biodiversity/index"),

                api.get(
                    "/biodiversity/species-diversity"
                ),

                api.get(
                    "/biodiversity/habitat-health"
                ),

                api.get(
                    "/biodiversity/ecosystem-monitoring"
                ),

                api.get(
                    "/biodiversity/conservation-priority"
                ),

                api.get("/dashboard/metrics")

            ]);


            setBiodiversity(
                biodiversityResponse.data
            );

            setDiversity(
                diversityResponse.data
            );

            setHabitat(
                habitatResponse.data.habitat_health || []
            );

            setEcosystem(
                ecosystemResponse.data.ecosystem_monitoring
            );

            setConservation(
                conservationResponse.data.conservation_priority || []
            );
            setMetrics(metricsResponse.data);

                console.log(
                    "FRONTEND DASHBOARD METRICS:",
                    metricsResponse.data
                );

        } catch (err) {

            console.error(
                "Biodiversity Dashboard Error:",
                err
            );

            setError(
                "Unable to load biodiversity data."
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-slate-600 font-medium">
                        Loading Biodiversity Intelligence...
                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="min-h-screen bg-slate-50 p-8">

                <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">

                    <p className="text-red-700 font-semibold">
                        {error}
                    </p>

                    <button
                        onClick={loadBiodiversityData}
                        className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

            <div className="max-w-7xl mx-auto space-y-6">


                {/* ================= HEADER ================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                                Wildlife Intelligence
                            </p>

                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-1">
                                Biodiversity Intelligence
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Dynamic biodiversity analysis based on wildlife observations
                            </p>

                        </div>


                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100">

                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>

                            <span className="text-sm font-semibold text-green-700">
                                Live Analysis
                            </span>

                        </div>

                    </div>

                </div>



                {/* ================= KPI CARDS ================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                    <MetricCard
                        title="Biodiversity Index"
                        value={
                            biodiversity?.biodiversity_index ?? 0
                        }
                        icon="🌿"
                    />

                    <MetricCard
                        title="Species Richness"
                        value={
                            metrics?.population_metrics?.species_richness ?? 0
                        }
                        icon="🦋"
                    />

                    <MetricCard
                        title="Shannon Diversity"
                        value={
                            diversity?.shannon_index ?? 0
                        }
                        icon="📊"
                    />

                    <MetricCard
                        title="Species Evenness"
                        value={
                            diversity?.evenness ?? 0
                        }
                        icon="⚖️"
                    />

                </div>



                {/* ================= SPECIES ANALYSIS ================= */}

                <SectionTitle
                    title="Species Diversity Analysis"
                    subtitle="Population distribution and species composition"
                />


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                    {/* Species Population */}

                    <ChartCard
                        title="Species Population"
                        subtitle="Detected population by species"
                    >

                        <div className="h-[340px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                   data={metrics?.species_distribution || []}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 50
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="species"
                                        angle={-25}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{
                                            fontSize: 12
                                        }}
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Bar
                                        dataKey="population"
                                        name="Population"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0
                                        ]}
                                        fill="#16a34a"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </ChartCard>



                    {/* Species Composition */}

                    <ChartCard
                        title="Species Composition"
                        subtitle="Relative contribution of each species"
                    >

                        <div className="h-[340px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={metrics?.species_distribution || []}
                                        dataKey="population"
                                        nameKey="species"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={105}
                                        innerRadius={55}
                                        paddingAngle={2}
                                    >

                                        {(diversity?.species || []).map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        PIE_COLORS[
                                                            index %
                                                            PIE_COLORS.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={40}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </ChartCard>

                </div>



                {/* ================= DIVERSITY SUMMARY ================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionTitle
                        title="Diversity Summary"
                        subtitle="Key indicators describing ecosystem diversity"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <InfoCard
                            label="Shannon Diversity Index"
                            value={
                                diversity?.shannon_index ?? 0
                            }
                        />

                        <InfoCard
                            label="Species Evenness"
                            value={
                                diversity?.evenness ?? 0
                            }
                        />

                        <InfoCard
                            label="Dominant Species"
                            value={
                                diversity?.dominant_species ??
                                "No Data"
                            }
                        />

                    </div>

                </div>



                {/* ================= HABITAT ================= */}

                <SectionTitle
                    title="Habitat Health"
                    subtitle="Health condition and biodiversity indicators across monitored habitats"
                />


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">


                    {/* Habitat Chart */}

                    <ChartCard
                        title="Habitat Health Score"
                        subtitle="Health score out of 100"
                    >

                        <div className="h-[280px] w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={habitat}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="habitat"
                                    />

                                    <YAxis
                                        domain={[0, 100]}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="health_score"
                                        name="Health Score"
                                        fill="#2563eb"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </ChartCard>



                    {/* Habitat Details */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        <h2 className="text-xl font-bold text-slate-800">
                            Habitat Assessment
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-5">
                            Current condition of monitored habitats
                        </p>


                        <div className="space-y-4">

                            {habitat.length === 0 ? (

                                <p className="text-slate-500">
                                    No habitat data available.
                                </p>

                            ) : (

                                habitat.map(
                                    (item, index) => (

                                        <div
                                            key={index}
                                            className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition"
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <h3 className="font-semibold text-slate-800">
                                                    {item.habitat}
                                                </h3>

                                                <span className="text-lg font-bold text-slate-800">
                                                    {item.health_score}
                                                </span>

                                            </div>


                                            <div className="grid grid-cols-3 gap-2 mt-4 text-center">

                                                <SmallStat
                                                    label="Species"
                                                    value={
                                                        item.species_count
                                                    }
                                                />

                                                <SmallStat
                                                    label="Population"
                                                    value={
                                                        item.population
                                                    }
                                                />

                                                <SmallStat
                                                    label="Observations"
                                                    value={
                                                        item.observations
                                                    }
                                                />

                                            </div>


                                            <div className="mt-4 flex items-center justify-between">

                                                <span className="text-sm text-slate-500">
                                                    Status
                                                </span>

                                                <StatusBadge
                                                    status={
                                                        item.status
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>

                </div>



                {/* ================= ECOSYSTEM MONITORING ================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionTitle
                        title="Ecosystem Monitoring"
                        subtitle="Current monitoring activity across the ecosystem"
                    />


                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                        <InfoCard
                            label="Total Observations"
                            value={
                                ecosystem?.total_observations ?? 0
                            }
                        />

                        <InfoCard
                            label="Species Monitored"
                            value={
                                ecosystem?.total_species ?? 0
                            }
                        />

                        <InfoCard
                            label="Monitoring Locations"
                            value={
                                ecosystem?.total_locations ?? 0
                            }
                        />

                        <InfoCard
                            label="Recent Observations"
                            value={
                                ecosystem?.recent_observations ?? 0
                            }
                        />

                    </div>


                    <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>

                                <h3 className="font-semibold text-slate-800">
                                    Monitoring Activity
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Based on observations recorded during the recent monitoring period.
                                </p>

                            </div>

                            <MonitoringStatus
                                status={
                                    ecosystem?.monitoring_status
                                }
                            />

                        </div>

                    </div>

                </div>



                {/* ================= MONITORING COVERAGE ================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionTitle
                        title="Ecosystem Monitoring Coverage"
                        subtitle="Coverage of species, locations and recent monitoring activity"
                    />


                    <div className="space-y-6">

                        <MonitoringBar
                            label="Species Coverage"
                            value={
                                ecosystem?.total_species ?? 0
                            }
                            max={
                                diversity?.species_richness ?? 1
                            }
                        />

                        <MonitoringBar
                            label="Location Coverage"
                            value={
                                ecosystem?.total_locations ?? 0
                            }
                            max={
                                ecosystem?.total_locations || 1
                            }
                        />

                        <MonitoringBar
                            label="Recent Monitoring Activity"
                            value={
                                ecosystem?.recent_observations ?? 0
                            }
                            max={
                                ecosystem?.total_observations || 1
                            }
                        />

                    </div>

                </div>



                {/* ================= CONSERVATION ================= */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionTitle
                        title="Conservation Priority"
                        subtitle="Species ranked according to dynamically calculated conservation priority"
                    />


                    {conservation.length === 0 ? (

                        <p className="text-slate-500">
                            No conservation data available.
                        </p>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[750px]">

                                <thead>

                                    <tr className="border-b border-slate-200">

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Rank
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Species
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Population
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Observations
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Locations
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Score
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                            Priority
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {conservation.map(
                                        (item, index) => (

                                            <tr
                                                key={index}
                                                className="border-b border-slate-100 hover:bg-slate-50 transition"
                                            >

                                                <td className="px-4 py-4 font-semibold text-slate-700">
                                                    #{index + 1}
                                                </td>

                                                <td className="px-4 py-4 font-semibold text-slate-800">
                                                    {item.species}
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {item.population}
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {item.observations}
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {item.locations}
                                                </td>

                                                <td className="px-4 py-4 font-semibold text-slate-700">
                                                    {item.priority_score}
                                                </td>

                                                <td className="px-4 py-4">

                                                    <PriorityBadge
                                                        priority={
                                                            item.priority
                                                        }
                                                    />

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>



                {/* ================= PRIORITY SCORES ================= */}

                {conservation.length > 0 && (

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        <SectionTitle
                            title="Conservation Priority Scores"
                            subtitle="Visual comparison of conservation priority"
                        />


                        <div className="space-y-5">

                            {conservation.map(
                                (item, index) => {

                                    const score =
                                        Math.min(
                                            Number(
                                                item.priority_score
                                            ) || 0,
                                            100
                                        );

                                    return (

                                        <div key={index}>

                                            <div className="flex justify-between items-center mb-2">

                                                <span className="font-medium text-slate-700">
                                                    {item.species}
                                                </span>

                                                <span className="text-sm font-semibold text-slate-600">
                                                    {item.priority_score}
                                                </span>

                                            </div>


                                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{
                                                        width: `${score}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */


function SectionTitle({
    title,
    subtitle
}) {

    return (

        <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-800">
                {title}
            </h2>

            {subtitle && (

                <p className="text-sm text-slate-500 mt-1">
                    {subtitle}
                </p>

            )}

        </div>

    );

}


function ChartCard({
    title,
    subtitle,
    children
}) {

    return (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <h2 className="text-xl font-bold text-slate-800">
                {title}
            </h2>

            {subtitle && (

                <p className="text-sm text-slate-500 mt-1 mb-4">
                    {subtitle}
                </p>

            )}

            {children}

        </div>

    );

}


function MetricCard({
    title,
    value,
    icon
}) {

    return (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="text-3xl font-bold text-slate-800 mt-3">
                        {value}
                    </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                    {icon}
                </div>

            </div>

        </div>

    );

}


function InfoCard({
    label,
    value
}) {

    return (

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-2">
                {value}
            </p>

        </div>

    );

}


function SmallStat({
    label,
    value
}) {

    return (

        <div className="bg-slate-50 rounded-lg p-2">

            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="font-semibold text-slate-800 mt-1">
                {value}
            </p>

        </div>

    );

}


function StatusBadge({
    status
}) {

    const styles =

        status === "Healthy"
            ? "bg-green-100 text-green-700"

            : status === "Moderate"
                ? "bg-yellow-100 text-yellow-700"

                : "bg-red-100 text-red-700";


    return (

        <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${styles}`}
        >
            {status || "Unknown"}
        </span>

    );

}


function MonitoringStatus({
    status
}) {

    const styles =

        status === "High"
            ? "bg-green-100 text-green-700"

            : status === "Moderate"
                ? "bg-yellow-100 text-yellow-700"

                : status === "Low"
                    ? "bg-orange-100 text-orange-700"

                    : "bg-slate-100 text-slate-600";


    return (

        <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${styles}`}
        >
            {status || "No Data"}
        </span>

    );

}


function PriorityBadge({
    priority
}) {

    const styles =

        priority === "Critical"
            ? "bg-red-100 text-red-700"

            : priority === "High"
                ? "bg-orange-100 text-orange-700"

                : priority === "Moderate"
                    ? "bg-yellow-100 text-yellow-700"

                    : "bg-green-100 text-green-700";


    return (

        <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${styles}`}
        >
            {priority || "Low"}
        </span>

    );

}


function MonitoringBar({
    label,
    value,
    max
}) {

    const percentage =

        max > 0

            ? Math.min(
                (Number(value) / Number(max)) * 100,
                100
            )

            : 0;


    return (

        <div>

            <div className="flex justify-between items-center mb-2">

                <span className="text-sm font-medium text-slate-700">
                    {label}
                </span>

                <span className="text-sm font-semibold text-slate-600">
                    {value}
                </span>

            </div>


            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                        width: `${percentage}%`
                    }}
                />

            </div>

        </div>

    );

}