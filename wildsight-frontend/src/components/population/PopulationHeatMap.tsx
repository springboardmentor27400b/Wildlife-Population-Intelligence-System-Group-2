import {
    Flame,
    MapPinned,
    Trees,
    AlertTriangle,
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    ShieldCheck,
    Activity,
    Map,
} from "lucide-react";

interface HeatmapZone {
    region: string;
    species: string;
    density: number;
    population: number;
    trend: "Increasing" | "Stable" | "Decreasing";
    recommendation: string;
}

const heatmapData: HeatmapZone[] = [
    {
        region: "Western Ghats",
        species: "Elephant, Tiger",
        density: 92,
        population: 2340,
        trend: "Increasing",
        recommendation:
            "Increase anti-poaching patrols and camera trap monitoring.",
    },
    {
        region: "Nilgiris",
        species: "Tiger, Deer",
        density: 78,
        population: 1890,
        trend: "Stable",
        recommendation:
            "Maintain habitat connectivity and migration corridors.",
    },
    {
        region: "Mudumalai",
        species: "Elephant, Gaur",
        density: 65,
        population: 1425,
        trend: "Increasing",
        recommendation:
            "Continue seasonal wildlife surveys.",
    },
    {
        region: "Anamalai Tiger Reserve",
        species: "Leopard, Deer",
        density: 54,
        population: 980,
        trend: "Stable",
        recommendation:
            "Restore fragmented habitat around buffer zones.",
    },
    {
        region: "Sathyamangalam",
        species: "Elephant, Bear",
        density: 39,
        population: 610,
        trend: "Decreasing",
        recommendation:
            "Increase habitat restoration and monitor water resources.",
    },
    {
        region: "Kalakkad",
        species: "Lion-tailed Macaque",
        density: 27,
        population: 320,
        trend: "Decreasing",
        recommendation:
            "Prioritize endangered species conservation.",
    },
];

export default function PopulationHeatMap() {
    const highestDensity = Math.max(...heatmapData.map((z) => z.density));

    const averageDensity = Math.round(
        heatmapData.reduce((a, b) => a + b.density, 0) /
        heatmapData.length
    );

    const totalPopulation = heatmapData.reduce(
        (a, b) => a + b.population,
        0
    );

    const getDensityColor = (density: number) => {
        if (density >= 80) return "bg-red-500";
        if (density >= 60) return "bg-orange-500";
        if (density >= 40) return "bg-yellow-400";
        return "bg-green-500";
    };

    const getRisk = (density: number) => {
        if (density >= 80) return "High";
        if (density >= 60) return "Moderate";
        if (density >= 40) return "Medium";
        return "Low";
    };

    const getRiskColor = (density: number) => {
        if (density >= 80)
            return "bg-red-100 text-red-700";

        if (density >= 60)
            return "bg-orange-100 text-orange-700";

        if (density >= 40)
            return "bg-yellow-100 text-yellow-700";

        return "bg-green-100 text-green-700";
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "Increasing":
                return (
                    <TrendingUp
                        size={18}
                        className="text-green-600"
                    />
                );

            case "Stable":
                return (
                    <Minus
                        size={18}
                        className="text-yellow-500"
                    />
                );

            default:
                return (
                    <TrendingDown
                        size={18}
                        className="text-red-600"
                    />
                );
        }
    };
    return (

        <div className="bg-white rounded-3xl shadow-lg p-8">

            {/* ================= HEADER ================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">

                <div className="flex items-center gap-4">

                    <div className="bg-red-100 p-4 rounded-2xl">

                        <Flame
                            size={34}
                            className="text-red-600"
                        />

                    </div>

                    <div>

                        <h2 className="text-3xl font-bold text-gray-800">

                            Population Density Intelligence

                        </h2>

                        <p className="text-gray-500 mt-2">

                            AI powered wildlife density monitoring across protected habitats.

                        </p>

                    </div>

                </div>

                <div className="mt-6 lg:mt-0">

                    <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">

                        <p className="text-sm text-gray-500">

                            AI Model Confidence

                        </p>

                        <h2 className="text-3xl font-bold text-green-600">

                            96%

                        </h2>

                    </div>

                </div>

            </div>

        

            {/* ================= EXECUTIVE SUMMARY ================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                <div className="rounded-2xl p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">

                    <Flame size={26} />

                    <p className="mt-4 text-sm opacity-90">
                        Highest Density
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        {highestDensity}%
                    </h2>

                    <p className="mt-3">
                        Western Ghats
                    </p>

                </div>
                <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">

                    <Activity size={26} />

                    <p className="mt-4 text-sm opacity-90">
                        Average Density
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        {averageDensity}%
                    </h2>

                    <p className="mt-3">
                        Across {heatmapData.length} Regions
                    </p>

                </div>
                <div className="rounded-2xl p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">

                    <Users size={26} />

                    <p className="mt-4 text-sm opacity-90">

                        Estimated Population

                    </p>

                    <h2 className="text-4xl font-bold mt-2">

                        {totalPopulation.toLocaleString()}

                    </h2>

                    <p className="mt-3">

                        Individuals Monitored

                    </p>

                </div>
                <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">

                    <ShieldCheck size={26} />

                    <p className="mt-4 text-sm opacity-90">

                        Protected Regions

                    </p>

                    <h2 className="text-4xl font-bold mt-2">

                        {heatmapData.length}

                    </h2>

                    <p className="mt-3">

                        Active Conservation Zones

                    </p>

                </div>

            </div>
            <div className="flex items-center gap-3 mb-6">

                <Map
                    size={24}
                    className="text-green-600"
                />

                <div>

                    <h2 className="text-2xl font-bold">

                        Regional Wildlife Intelligence

                    </h2>

                    <p className="text-gray-500">

                        AI analysed wildlife density, population trends and conservation recommendations.

                    </p>

                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

                {heatmapData.map((zone) => (

                    <div
                        key={zone.region}
                        className="
        bg-white
        rounded-3xl
        border
        shadow-md
        hover:shadow-2xl
        transition-all
        duration-300
        overflow-hidden
    "
                    >

                        {/* Top Density Indicator */}

                        <div
                            className={`${getDensityColor(zone.density)} h-2`}
                        />



                        <div className="p-6">

                            {/* Header */}

                            <div className="flex justify-between items-start">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <MapPinned
                                            className="text-green-600"
                                            size={20}
                                        />

                                        <h2 className="text-xl font-bold">

                                            {zone.region}

                                        </h2>

                                    </div>

                                    <p className="text-gray-500 mt-3">

                                        Dominant Species

                                    </p>

                                    <p className="font-semibold">

                                        {zone.species}

                                    </p>

                                </div>

                                <span
                                    className={`
                    px-4
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                    ${getRiskColor(zone.density)}
                `}
                                >

                                    {getRisk(zone.density)}

                                </span>

                            </div>


                            {/* Statistics */}

                            <div className="grid grid-cols-2 gap-5 mt-8">

                                <div>

                                    <p className="text-sm text-gray-500">

                                        Population

                                    </p>

                                    <div className="flex items-center gap-2 mt-2">

                                        <Users
                                            size={18}
                                            className="text-blue-600"
                                        />

                                        <span className="font-bold text-lg">

                                            {zone.population.toLocaleString()}

                                        </span>

                                    </div>

                                </div>



                                <div>

                                    <p className="text-sm text-gray-500">

                                        Population Trend

                                    </p>

                                    <div className="flex items-center gap-2 mt-2">

                                        {getTrendIcon(zone.trend)}

                                        <span className="font-semibold">

                                            {zone.trend}

                                        </span>

                                    </div>

                                </div>

                            </div>



                            {/* Density Progress */}

                            <div className="mt-8">

                                <div className="flex justify-between mb-3">

                                    <span className="text-gray-600">

                                        Wildlife Density Score

                                    </span>

                                    <span className="font-bold">

                                        {zone.density}%

                                    </span>

                                </div>

                                <div className="bg-gray-200 rounded-full h-3">

                                    <div

                                        className={`
                        ${getDensityColor(zone.density)}
                        h-3
                        rounded-full
                        transition-all
                    `}

                                        style={{
                                            width: `${zone.density}%`,
                                        }}

                                    />

                                </div>

                            </div>



                            {/* AI Recommendation */}

                            <div
                                className="
                mt-8
                bg-gradient-to-r
                from-blue-50
                to-indigo-50
                border
                border-blue-100
                rounded-2xl
                p-5
            "
                            >

                                <div className="flex items-center gap-2 mb-3">

                                    <Brain
                                        size={18}
                                        className="text-blue-600"
                                    />

                                    <h3 className="font-bold text-blue-700">

                                        AI Recommendation

                                    </h3>

                                </div>

                                <p className="text-gray-700 leading-7">

                                    {zone.recommendation}

                                </p>

                            </div>



                            {/* Bottom Status */}

                            <div
                                className="
                mt-6
                flex
                justify-between
                items-center
            "
                            >

                                <div className="flex items-center gap-2">

                                    <Trees
                                        size={18}
                                        className="text-green-600"
                                    />

                                    <span className="text-gray-500">

                                        Habitat Monitoring Active

                                    </span>

                                </div>

                                <div
                                    className="
                    bg-green-100
                    text-green-700
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                "
                                >

                                    Live Tracking

                                </div>

                            </div>

                        </div>

                    </div>

                ))}
            </div>
            {/* ================= AI POPULATION REPORT ================= */}

            <div className="mt-10 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-green-900 text-white p-8">

                <div className="flex items-center gap-3 mb-6">

                    <Brain size={32} />

                    <div>

                        <h2 className="text-2xl font-bold">

                            AI Population Intelligence Report

                        </h2>

                        <p className="text-blue-100">

                            Automatically generated conservation assessment

                        </p>

                    </div>

                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                    <div className="bg-white/10 rounded-2xl p-5">

                        <p className="text-gray-300 text-sm">

                            Overall Population

                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-green-300">

                            Healthy

                        </h2>

                        <p className="mt-3 text-sm">

                            Population is stable across most protected habitats.

                        </p>

                    </div>

                    <div className="bg-white/10 rounded-2xl p-5">

                        <p className="text-gray-300 text-sm">

                            Critical Region

                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-red-300">

                            Kalakkad

                        </h2>

                        <p className="mt-3 text-sm">

                            Low density with decreasing population trend.

                        </p>

                    </div>

                    <div className="bg-white/10 rounded-2xl p-5">

                        <p className="text-gray-300 text-sm">

                            Highest Biodiversity

                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-yellow-300">

                            Western Ghats

                        </h2>

                        <p className="mt-3 text-sm">

                            Highest species richness and wildlife density.

                        </p>

                    </div>

                    <div className="bg-white/10 rounded-2xl p-5">

                        <p className="text-gray-300 text-sm">

                            AI Recommendation

                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-cyan-300">

                            Moderate Risk

                        </h2>

                        <p className="mt-3 text-sm">

                            Restore low-density habitats while maintaining surveillance in high-density zones.

                        </p>

                    </div>

                </div>

            </div>{/* ================= POPULATION ANALYTICS ================= */}

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Population Distribution */}

                <div className="bg-white rounded-3xl shadow border p-6">

                    <h2 className="text-xl font-bold mb-6">
                        Population Distribution
                    </h2>

                    <div className="space-y-5">

                        {/* Increasing */}

                        <div>
                            <div className="flex justify-between">
                                <span>Increasing</span>
                                <span className="font-bold text-green-600">
                                    2 Regions
                                </span>
                            </div>

                            <div className="bg-gray-200 h-3 rounded-full mt-2">
                                <div
                                    className="bg-green-500 h-3 rounded-full"
                                    style={{ width: "34%" }}
                                />
                            </div>
                        </div>

                        {/* Stable */}

                        <div>
                            <div className="flex justify-between">
                                <span>Stable</span>
                                <span className="font-bold text-yellow-500">
                                    2 Regions
                                </span>
                            </div>

                            <div className="bg-gray-200 h-3 rounded-full mt-2">
                                <div
                                    className="bg-yellow-400 h-3 rounded-full"
                                    style={{ width: "34%" }}
                                />
                            </div>
                        </div>

                        {/* Declining */}

                        <div>
                            <div className="flex justify-between">
                                <span>Declining</span>
                                <span className="font-bold text-red-500">
                                    2 Regions
                                </span>
                            </div>

                            <div className="bg-gray-200 h-3 rounded-full mt-2">
                                <div
                                    className="bg-red-500 h-3 rounded-full"
                                    style={{ width: "34%" }}
                                />
                            </div>
                        </div>

                    </div>

                </div>

                {/* AI Monitoring Summary */}

                <div className="bg-white rounded-3xl shadow border p-6">

                    <h2 className="text-xl font-bold mb-6">
                        AI Monitoring Summary
                    </h2>

                    <div className="space-y-4">

                        <div className="flex justify-between">
                            <span>Camera Stations</span>
                            <strong>248</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Survey Reports</span>
                            <strong>84</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Images Processed</span>
                            <strong>24,536</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>AI Accuracy</span>
                            <strong className="text-green-600">
                                96%
                            </strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Last Updated</span>
                            <strong>5 mins ago</strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
            );
}