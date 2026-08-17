import { useEffect, useState } from "react";
import api from "../api";

export default function ResearcherDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);

    const [biodiversity, setBiodiversity] = useState(null);
    const [diversity, setDiversity] = useState(null);
    const [habitatHealth, setHabitatHealth] = useState([]);
    const [ecosystem, setEcosystem] = useState(null);

    const [classification, setClassification] = useState([]);
    const [degradation, setDegradation] = useState([]);
    const [vegetation, setVegetation] = useState([]);
    const [environment, setEnvironment] = useState([]);
    const [suitability, setSuitability] = useState([]);

    const [health, setHealth] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadResearcherDashboard();

        const interval = setInterval(() => {
            loadResearcherDashboard();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadResearcherDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                metricsRes,
                historyRes,
                biodiversityRes,
                diversityRes,
                habitatHealthRes,
                ecosystemRes,
                classificationRes,
                degradationRes,
                vegetationRes,
                environmentRes,
                suitabilityRes,
                healthRes
            ] = await Promise.all([
                api.get("/dashboard/metrics"),
                api.get("/dashboard/history"),

                api.get("/biodiversity/index"),
                api.get("/biodiversity/species-diversity"),
                api.get("/biodiversity/habitat-health"),
                api.get("/biodiversity/ecosystem-monitoring"),

                api.get("/habitat/classification"),
                api.get("/habitat/degradation"),
                api.get("/habitat/vegetation"),
                api.get("/habitat/environmental-conditions"),
                api.get("/habitat/suitability"),

                api.get("/wildlife-health/score")
            ]);

            setMetrics(metricsRes.data);
            setHistory(
                Array.isArray(historyRes.data)
                    ? historyRes.data
                    : []
            );

            setBiodiversity(biodiversityRes.data);
            setDiversity(diversityRes.data);

            setHabitatHealth(
                habitatHealthRes.data?.habitat_health || []
            );

            setEcosystem(
                ecosystemRes.data?.ecosystem_monitoring || null
            );

            setClassification(
                classificationRes.data?.habitats || []
            );

            setDegradation(
                degradationRes.data?.habitat_degradation || []
            );

            setVegetation(
                vegetationRes.data?.vegetation_analysis || []
            );

            setEnvironment(
                environmentRes.data?.environmental_conditions || []
            );

            setSuitability(
                suitabilityRes.data?.habitat_suitability || []
            );

            setHealth(healthRes.data);
        } catch (err) {
            console.error(
                "Researcher Dashboard Error:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Session expired. Please login again."
                );
            } else {
                setError(
                    "Unable to load researcher dashboard data."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />

                    <p className="mt-4 text-slate-600">
                        Loading Wildlife Intelligence...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-xl mx-auto bg-white rounded-2xl border border-red-200 p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600">
                        Dashboard Error
                    </h2>

                    <p className="mt-2 text-slate-600">
                        {error}
                    </p>

                    <button
                        onClick={loadResearcherDashboard}
                        className="mt-5 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | POPULATION DATA
    |--------------------------------------------------------------------------
    */

    const population =
        metrics?.population_metrics || {};

    const populationSize =
        Number(population.population_size) || 0;

    const density =
        Number(population.density) || 0;

    const growthRate =
        Number(population.growth_rate) || 0;

    const speciesRichness =
        Number(population.species_richness) || 0;

    const dominantSpecies =
        population.dominant_species || "No Data";

    const trend =
        population.trend || "No Data";

    const migrationStatus =
        population.migration_status || "No Data";

    const migrationPattern =
        population.migration_pattern || "No Data";

    const speciesDistribution =
        metrics?.species_distribution || [];

    /*
    |--------------------------------------------------------------------------
    | BIODIVERSITY DATA
    |--------------------------------------------------------------------------
    */

    const biodiversityIndex =
        Number(
            biodiversity?.biodiversity_index
        ) || 0;

    const shannonIndex =
        Number(
            diversity?.shannon_index
        ) || 0;

    const evenness =
        Number(
            diversity?.evenness
        ) || 0;

    const biodiversitySpecies =
        diversity?.species || [];

    /*
    |--------------------------------------------------------------------------
    | HEALTH DATA
    |--------------------------------------------------------------------------
    */

    const ecosystemHealth =
        Number(
            health?.overall_ecosystem_health_score
        ) || 0;

    const speciesDiversityScore =
        Number(
            health?.species_diversity_score
        ) || 0;

    const populationStabilityScore =
        Number(
            health?.population_stability_score
        ) || 0;

    const habitatQualityScore =
        Number(
            health?.habitat_quality_score
        ) || 0;

    const endangeredScore =
        Number(
            health?.endangered_species_score
        ) || 0;

    const environmentalScore =
        Number(
            health?.environmental_condition_score
        ) || 0;

    const healthStatus =
        health?.conservation_status ||
        health?.status ||
        getHealthStatus(ecosystemHealth);

    /*
    |--------------------------------------------------------------------------
    | HABITAT SUMMARY
    |--------------------------------------------------------------------------
    */

    const stableHabitats =
        degradation.filter(
            item =>
                Number(item.degradation_score) < 40
        ).length;

    const degradedHabitats =
        degradation.filter(
            item =>
                Number(item.degradation_score) >= 75
        ).length;

    const totalHabitatPopulation =
        classification.reduce(
            (sum, item) =>
                sum +
                Number(item.population || 0),
            0
        );

    const totalHabitatSpecies =
        classification.reduce(
            (sum, item) =>
                sum +
                Number(item.species_count || 0),
            0
        );

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}

                <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                Wildlife Intelligence
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold mt-3">
                                Wildlife Researcher Dashboard
                            </h1>

                            <p className="mt-2 text-slate-300 max-w-2xl">
                                Population analytics, biodiversity
                                intelligence and habitat insights
                                from the wildlife monitoring system.
                            </p>

                        </div>

                        <button
                            onClick={loadResearcherDashboard}
                            className="bg-white text-emerald-800 px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-50"
                        >
                            ↻ Refresh Data
                        </button>

                    </div>

                </header>


                {/* =====================================================
                    POPULATION OVERVIEW
                ====================================================== */}

                <section>

                    <SectionHeading
                        title="Population Overview"
                        subtitle="Current wildlife population intelligence"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                        <MetricCard
                            title="Population Size"
                            value={populationSize}
                            suffix="animals"
                        />

                        <MetricCard
                            title="Density"
                            value={density}
                            suffix="animals/km²"
                            decimals={2}
                        />

                        <MetricCard
                            title="Species Richness"
                            value={speciesRichness}
                            suffix="species"
                        />

                        <MetricCard
                            title="Growth Rate"
                            value={growthRate}
                            suffix="%"
                            decimals={2}
                            positive={growthRate >= 0}
                        />

                        <MetricCard
                            title="Dominant Species"
                            value={dominantSpecies}
                            textValue
                        />

                    </div>

                </section>


                {/* =====================================================
                    POPULATION ANALYTICS
                ====================================================== */}

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">

                    <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-5">

                        <SectionHeading
                            title="Population Analytics"
                            subtitle="Population trend and monitoring history"
                        />

                        <div className="flex gap-3">

                            <SmallInfo
                                label="Trend"
                                value={trend}
                                tone={
                                    trend.toLowerCase().includes("increase")
                                        ? "green"
                                        : trend.toLowerCase().includes("decline")
                                        ? "red"
                                        : "yellow"
                                }
                            />

                            <SmallInfo
                                label="Migration"
                                value={migrationStatus}
                            />

                        </div>

                    </div>


                    {/* HISTORY */}

                    {history.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="border-b border-slate-200">

                                        <th className="text-left py-3 px-2 text-slate-500">
                                            Period
                                        </th>

                                        <th className="text-left py-3 px-2 text-slate-500">
                                            Population
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {history.map(
                                        (item, index) => (

                                            <tr
                                                key={index}
                                                className="border-b last:border-0"
                                            >

                                                <td className="py-3 px-2 font-medium">
                                                    {item.month || "-"}
                                                </td>

                                                <td className="py-3 px-2 font-bold">
                                                    {Number(
                                                        item.population || 0
                                                    ).toLocaleString()}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <EmptyState text="No population history available." />

                    )}


                    {/* MIGRATION */}

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                        <InfoPanel
                            title="Migration Status"
                            value={migrationStatus}
                        />

                        <InfoPanel
                            title="Migration Pattern"
                            value={migrationPattern}
                        />

                    </div>

                </section>


                {/* =====================================================
                    SPECIES OBSERVATIONS
                ====================================================== */}

                <section>

                    <SectionHeading
                        title="Species Observations"
                        subtitle="Species detected from wildlife observations"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* DISTRIBUTION */}

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Species Distribution
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Population count by species
                            </p>

                            <div className="mt-5 space-y-3">

                                {speciesDistribution.length === 0 ? (

                                    <EmptyState text="No species observations available." />

                                ) : (

                                    speciesDistribution.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4"
                                            >

                                                <span className="font-semibold text-slate-800">
                                                    {item.species || "Unknown"}
                                                </span>

                                                <span className="font-bold text-emerald-700">
                                                    {Number(
                                                        item.count || 0
                                                    ).toLocaleString()}
                                                </span>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>


                        {/* BIODIVERSITY SPECIES */}

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Species Diversity
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Species population composition
                            </p>

                            <div className="mt-5 space-y-3">

                                {biodiversitySpecies.length === 0 ? (

                                    <EmptyState text="No diversity records available." />

                                ) : (

                                    biodiversitySpecies.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                                className="rounded-xl border border-slate-200 p-4"
                                            >

                                                <div className="flex justify-between">

                                                    <span className="font-semibold">
                                                        {item.species}
                                                    </span>

                                                    <span className="font-bold">
                                                        {Number(
                                                            item.population || 0
                                                        ).toLocaleString()}
                                                    </span>

                                                </div>

                                                {item.proportion !== undefined && (

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Proportion:{" "}
                                                        {Number(
                                                            item.proportion
                                                        ).toFixed(3)}
                                                    </p>

                                                )}

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    BIODIVERSITY
                ====================================================== */}

                <section>

                    <SectionHeading
                        title="Biodiversity Intelligence"
                        subtitle="Dynamic biodiversity and ecosystem analysis"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <MetricCard
                            title="Biodiversity Index"
                            value={biodiversityIndex}
                            decimals={2}
                            suffix=""
                        />

                        <MetricCard
                            title="Species Richness"
                            value={speciesRichness}
                            suffix="species"
                        />

                        <MetricCard
                            title="Shannon Diversity"
                            value={shannonIndex}
                            decimals={3}
                        />

                        <MetricCard
                            title="Species Evenness"
                            value={evenness}
                            decimals={3}
                        />

                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Habitat Health
                            </h3>

                            <div className="mt-5 space-y-3">

                                {habitatHealth.length === 0 ? (

                                    <EmptyState text="No habitat health data available." />

                                ) : (

                                    habitatHealth.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                                className="border border-slate-200 rounded-xl p-4"
                                            >

                                                <div className="flex justify-between items-center">

                                                    <span className="font-semibold">
                                                        {item.habitat}
                                                    </span>

                                                    <span className="font-bold text-emerald-600">
                                                        {item.health_score}
                                                    </span>

                                                </div>

                                                <div className="mt-2 text-sm text-slate-500">

                                                    Species:{" "}
                                                    {item.species_count}

                                                    {" • "}

                                                    Population:{" "}
                                                    {item.population}

                                                    {" • "}

                                                    Observations:{" "}
                                                    {item.observations}

                                                </div>

                                                {item.status && (

                                                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                        {item.status}
                                                    </span>

                                                )}

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>


                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Ecosystem Monitoring
                            </h3>

                            {ecosystem ? (

                                <div className="mt-5 grid grid-cols-2 gap-4">

                                    <InfoBox
                                        label="Observations"
                                        value={
                                            ecosystem.total_observations
                                        }
                                    />

                                    <InfoBox
                                        label="Species Monitored"
                                        value={
                                            ecosystem.total_species
                                        }
                                    />

                                    <InfoBox
                                        label="Locations"
                                        value={
                                            ecosystem.total_locations
                                        }
                                    />

                                    <InfoBox
                                        label="Recent Observations"
                                        value={
                                            ecosystem.recent_observations
                                        }
                                    />

                                    <div className="col-span-2 rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs text-slate-500">
                                            Monitoring Activity
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {ecosystem.monitoring_status ||
                                                "No Data"}
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <EmptyState text="No ecosystem monitoring data available." />

                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    WILDLIFE HEALTH
                ====================================================== */}

                <section>

                    <SectionHeading
                        title="Wildlife Health"
                        subtitle="Weighted ecosystem health scoring"
                    />

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Overall Ecosystem Health
                                </p>

                                <div className="flex items-end gap-2 mt-1">

                                    <span
                                        className={`text-5xl font-bold ${scoreColor(
                                            ecosystemHealth
                                        )}`}
                                    >
                                        {ecosystemHealth.toFixed(1)}
                                    </span>

                                    <span className="text-slate-400 mb-2">
                                        / 100
                                    </span>

                                </div>

                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${healthStatusStyle(
                                        healthStatus
                                    )}`}
                                >
                                    {healthStatus}
                                </span>

                            </div>

                            <div className="w-full md:w-1/2">

                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">

                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                ecosystemHealth,
                                                100
                                            )}%`
                                        }}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">

                            <HealthScore
                                title="Species Diversity"
                                score={speciesDiversityScore}
                                weight="30%"
                            />

                            <HealthScore
                                title="Population Stability"
                                score={populationStabilityScore}
                                weight="25%"
                            />

                            <HealthScore
                                title="Habitat Quality"
                                score={habitatQualityScore}
                                weight="20%"
                            />

                            <HealthScore
                                title="Endangered Species"
                                score={endangeredScore}
                                weight="15%"
                            />

                            <HealthScore
                                title="Environmental Conditions"
                                score={environmentalScore}
                                weight="10%"
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    HABITAT INTELLIGENCE
                ====================================================== */}

                <section>

                    <SectionHeading
                        title="Habitat Insights"
                        subtitle="Habitat classification, degradation, vegetation and suitability"
                    />

                    {/* HABITAT SUMMARY */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

                        <MetricCard
                            title="Monitored Habitats"
                            value={classification.length}
                        />

                        <MetricCard
                            title="Habitat Population"
                            value={totalHabitatPopulation}
                        />

                        <MetricCard
                            title="Species Recorded"
                            value={totalHabitatSpecies}
                        />

                        <MetricCard
                            title="Stable Habitats"
                            value={stableHabitats}
                            positive
                        />

                    </div>


                    {/* CLASSIFICATION */}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-5">

                        <h3 className="text-lg font-bold">
                            Habitat Classification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">

                            {classification.length === 0 ? (

                                <div className="col-span-full">
                                    <EmptyState text="No habitat classification data available." />
                                </div>

                            ) : (

                                classification.map(
                                    (item, index) => (

                                        <div
                                            key={index}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                                        >

                                            <div className="flex justify-between gap-3">

                                                <div>

                                                    <h4 className="font-bold text-slate-900">
                                                        {item.location ||
                                                            "Unknown Location"}
                                                    </h4>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {item.habitat_type ||
                                                            "Unknown Habitat"}
                                                    </p>

                                                </div>

                                                <span className="h-fit px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                    Active
                                                </span>

                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-5">

                                                <InfoBox
                                                    label="Observations"
                                                    value={
                                                        item.observation_count
                                                    }
                                                />

                                                <InfoBox
                                                    label="Species"
                                                    value={
                                                        item.species_count
                                                    }
                                                />

                                                <InfoBox
                                                    label="Population"
                                                    value={
                                                        item.population
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* DEGRADATION */}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-5">

                        <div className="flex justify-between items-center">

                            <div>

                                <h3 className="text-lg font-bold">
                                    Habitat Degradation
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Higher scores indicate greater ecological pressure.
                                </p>

                            </div>

                            {degradedHabitats > 0 && (

                                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                                    {degradedHabitats} require attention
                                </span>

                            )}

                        </div>


                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-5">

                            {degradation.length === 0 ? (

                                <div className="col-span-full">
                                    <EmptyState text="No degradation data available." />
                                </div>

                            ) : (

                                degradation.map(
                                    (item, index) => {

                                        const score =
                                            Number(
                                                item.degradation_score
                                            ) || 0;

                                        const tone =
                                            getDegradationTone(score);

                                        return (

                                            <div
                                                key={index}
                                                className="rounded-2xl border border-slate-200 p-5"
                                            >

                                                <div className="flex justify-between gap-4">

                                                    <div>

                                                        <h4 className="font-bold">
                                                            {item.habitat}
                                                        </h4>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Ecological pressure assessment
                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`px-3 py-1 h-fit rounded-full text-xs font-semibold ${tone.badge}`}
                                                    >
                                                        {tone.label}
                                                    </span>

                                                </div>

                                                <div className="flex justify-between mt-5">

                                                    <span className="text-sm text-slate-500">
                                                        Degradation Score
                                                    </span>

                                                    <span className="font-bold">
                                                        {score}
                                                    </span>

                                                </div>

                                                <div className="h-2.5 bg-slate-100 rounded-full mt-2 overflow-hidden">

                                                    <div
                                                        className={`h-full ${tone.bar}`}
                                                        style={{
                                                            width: `${Math.min(
                                                                score,
                                                                100
                                                            )}%`
                                                        }}
                                                    />

                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4">

                                                    <InfoBox
                                                        label="Species Change"
                                                        value={`${item.species_change}%`}
                                                    />

                                                    <InfoBox
                                                        label="Population Change"
                                                        value={`${item.population_change}%`}
                                                    />

                                                </div>

                                            </div>

                                        );
                                    }
                                )

                            )}

                        </div>

                    </div>


                    {/* VEGETATION + ENVIRONMENT */}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Vegetation Analysis
                            </h3>

                            <div className="mt-5 space-y-3">

                                {vegetation.length === 0 ? (

                                    <EmptyState text="No vegetation data available." />

                                ) : (

                                    vegetation.map(
                                        (item, index) => {

                                            const score =
                                                Number(
                                                    item.vegetation_score
                                                ) || 0;

                                            return (

                                                <div
                                                    key={index}
                                                    className="border border-slate-200 rounded-xl p-4"
                                                >

                                                    <div className="flex justify-between">

                                                        <div>

                                                            <h4 className="font-semibold">
                                                                {item.habitat}
                                                            </h4>

                                                            <p className="text-xs text-slate-500">
                                                                {item.vegetation_condition}
                                                            </p>

                                                        </div>

                                                        <span
                                                            className={`text-2xl font-bold ${scoreColor(
                                                                score
                                                            )}`}
                                                        >
                                                            {score}
                                                        </span>

                                                    </div>

                                                    <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">

                                                        <div
                                                            className="h-full bg-emerald-500"
                                                            style={{
                                                                width: `${Math.min(
                                                                    score,
                                                                    100
                                                                )}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )

                                )}

                            </div>

                        </div>


                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                            <h3 className="text-lg font-bold">
                                Environmental Conditions
                            </h3>

                            <div className="mt-5 space-y-3">

                                {environment.length === 0 ? (

                                    <EmptyState text="No environmental condition data available." />

                                ) : (

                                    environment.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                                className="border border-slate-200 rounded-xl p-4"
                                            >

                                                <div className="flex justify-between">

                                                    <h4 className="font-semibold">
                                                        {item.habitat}
                                                    </h4>

                                                    <span className="font-bold">
                                                        {item.condition_score}
                                                    </span>

                                                </div>

                                                <p className="mt-2 text-sm text-slate-600">
                                                    {item.environmental_condition}
                                                </p>

                                                <div className="grid grid-cols-3 gap-2 mt-3">

                                                    <InfoBox
                                                        label="Species"
                                                        value={
                                                            item.species_count
                                                        }
                                                    />

                                                    <InfoBox
                                                        label="Population"
                                                        value={
                                                            item.population
                                                        }
                                                    />

                                                    <InfoBox
                                                        label="Monitoring"
                                                        value={
                                                            item.monitoring_score
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


                    {/* SUITABILITY */}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mt-5">

                        <h3 className="text-lg font-bold">
                            Habitat Suitability Prediction
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                            {suitability.length === 0 ? (

                                <div className="col-span-full">
                                    <EmptyState text="No habitat suitability data available." />
                                </div>

                            ) : (

                                suitability.map(
                                    (item, index) => {

                                        const score =
                                            Number(
                                                item.suitability_score
                                            ) || 0;

                                        return (

                                            <div
                                                key={index}
                                                className="border border-slate-200 rounded-2xl p-5"
                                            >

                                                <div className="flex justify-between">

                                                    <div>

                                                        <h4 className="font-bold">
                                                            {item.habitat}
                                                        </h4>

                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {item.suitability}
                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`text-2xl font-bold ${scoreColor(
                                                            score
                                                        )}`}
                                                    >
                                                        {score}
                                                    </span>

                                                </div>

                                                <div className="h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden">

                                                    <div
                                                        className="h-full bg-emerald-500"
                                                        style={{
                                                            width: `${Math.min(
                                                                score,
                                                                100
                                                            )}%`
                                                        }}
                                                    />

                                                </div>

                                                <p className="text-sm text-slate-600 mt-4">
                                                    {item.recommendation}
                                                </p>

                                            </div>

                                        );
                                    }
                                )

                            )}

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}


/* ============================================================
   COMPONENTS
============================================================ */

function SectionHeading({
    title,
    subtitle
}) {
    return (
        <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">
                {title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
                {subtitle}
            </p>

        </div>
    );
}


function MetricCard({
    title,
    value,
    suffix,
    decimals = 0,
    positive,
    textValue
}) {
    let displayValue = value;

    if (!textValue) {
        const number = Number(value) || 0;

        displayValue =
            decimals > 0
                ? number.toFixed(decimals)
                : number.toLocaleString();
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {title}
            </p>

            <div className="flex items-end gap-2 mt-2">

                <p
                    className={`text-3xl font-bold ${
                        positive === true
                            ? "text-emerald-600"
                            : positive === false
                            ? "text-red-600"
                            : "text-slate-900"
                    }`}
                >
                    {displayValue}
                </p>

                {suffix && (
                    <span className="text-xs text-slate-400 mb-1">
                        {suffix}
                    </span>
                )}

            </div>

        </div>
    );
}


function SmallInfo({
    label,
    value,
    tone
}) {
    const toneClass =
        tone === "green"
            ? "bg-emerald-50 text-emerald-700"
            : tone === "red"
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-700";

    return (
        <div className="text-right">

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${toneClass}`}
            >
                {value}
            </span>

        </div>
    );
}


function InfoPanel({
    title,
    value
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
                {title}
            </p>

            <p className="font-bold text-slate-900 mt-1">
                {value}
            </p>

        </div>
    );
}


function InfoBox({
    label,
    value
}) {
    return (
        <div className="rounded-lg bg-slate-50 p-3 text-center">

            <p className="text-[11px] text-slate-500">
                {label}
            </p>

            <p className="mt-1 font-bold text-slate-900">
                {value !== undefined &&
                value !== null &&
                value !== ""
                    ? value
                    : "—"}
            </p>

        </div>
    );
}


function HealthScore({
    title,
    score,
    weight
}) {
    const value = Number(score) || 0;

    return (
        <div className="rounded-xl border border-slate-200 p-4">

            <div className="flex justify-between gap-2">

                <p className="text-sm font-semibold">
                    {title}
                </p>

                <span className="text-xs text-slate-400">
                    {weight}
                </span>

            </div>

            <p
                className={`text-2xl font-bold mt-2 ${scoreColor(
                    value
                )}`}
            >
                {value.toFixed(1)}
            </p>

            <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">

                <div
                    className="h-full bg-emerald-500"
                    style={{
                        width: `${Math.min(
                            value,
                            100
                        )}%`
                    }}
                />

            </div>

        </div>
    );
}


function EmptyState({
    text
}) {
    return (
        <div className="py-8 text-center text-slate-400 text-sm">
            {text}
        </div>
    );
}


/* ============================================================
   HELPERS
============================================================ */

function scoreColor(score) {
    const value = Number(score) || 0;

    if (value >= 75) {
        return "text-emerald-600";
    }

    if (value >= 50) {
        return "text-amber-600";
    }

    return "text-red-600";
}


function getHealthStatus(score) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Healthy";
    if (score >= 50) return "Moderate Concern";
    if (score >= 25) return "Vulnerable";

    return "Critical";
}


function healthStatusStyle(status) {
    switch (status) {
        case "Excellent":
            return "bg-green-100 text-green-700";

        case "Healthy":
            return "bg-emerald-100 text-emerald-700";

        case "Moderate Concern":
            return "bg-yellow-100 text-yellow-700";

        case "Vulnerable":
            return "bg-orange-100 text-orange-700";

        case "Critical":
            return "bg-red-100 text-red-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}


function getDegradationTone(score) {
    if (score >= 75) {
        return {
            label: "Severe Degradation",
            badge: "bg-red-50 text-red-700"
        };
    }

    if (score >= 40) {
        return {
            label: "Potential Degradation",
            badge: "bg-amber-50 text-amber-700"
        };
    }

    return {
        label: "Stable",
        badge: "bg-emerald-50 text-emerald-700"
    };
}