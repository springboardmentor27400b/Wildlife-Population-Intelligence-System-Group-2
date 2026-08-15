import { useEffect, useState } from "react";

import HabitatCard from "../components/habitat/HabitatCard";
import HabitatClassificationChart from "../components/habitat/HabitatClassificationChart";
import VegetationAnalysisCard from "../components/habitat/VegetationCard";
import HabitatDegradationPanel from "../components/habitat/HabitatDegradationPanel";
import EnvironmentalMonitoringPanel from "../components/habitat/EnvironmentMonitoringPanel";
import HabitatSuitabilityGauge from "../components/habitat/HabitatSuitabilityGauge";
import HabitatAIInsights from "../components/habitat/HabitatAIInsights";
import HabitatSummary from "../components/habitat/HabitatSummary";
import {
    getHabitatDashboard,
    getHabitatClassification,
    getHabitatDegradation,
    getVegetationAnalysis,
    getEnvironmentalMonitoring,
    getHabitatSuitability
} from "../services/HabitatService";

import {
    HabitatDashboard,
    HabitatClassification,
    HabitatDegradation,
    VegetationAnalysis,
    EnvironmentalMonitoring,
    HabitatSuitability
} from "../types/habitat";

import {
    Trees,
    Leaf,
    Mountain,
    Globe,
    ShieldCheck
} from "lucide-react";

export default function HabitatIntelligence(){

    const [dashboard,setDashboard] =
        useState<HabitatDashboard | null>(null);

    const [classification,setClassification] =
        useState<HabitatClassification | null>(null);

    const [degradation,setDegradation] =
        useState<HabitatDegradation | null>(null);

    const [vegetation,setVegetation] =
        useState<VegetationAnalysis | null>(null);

    const [environment,setEnvironment] =
        useState<EnvironmentalMonitoring | null>(null);

    const [suitability,setSuitability] =
        useState<HabitatSuitability | null>(null);

    useEffect(()=>{

        loadData();

    },[]);

    const loadData = async()=>{

        try{

            const dashboardData =
                await getHabitatDashboard();

            const classificationData =
                await getHabitatClassification();

            const degradationData =
                await getHabitatDegradation();

            const vegetationData =
                await getVegetationAnalysis();

            const environmentData =
                await getEnvironmentalMonitoring();

            const suitabilityData =
                await getHabitatSuitability();

            setDashboard(dashboardData);

            setClassification(classificationData);

            setDegradation(degradationData);

            setVegetation(vegetationData);

            setEnvironment(environmentData);

            setSuitability(suitabilityData);

        }
        catch(error){

            console.error(
                "Habitat dashboard loading failed",
                error
            );

        }

    };

    return(

        <div
        className="
        min-h-screen
        bg-slate-50
        p-8
        space-y-8
        "
        >

            {/* Header */}

            <div>

                <h1
                className="
                text-4xl
                font-bold
                "
                >

                    Habitat Intelligence 🌳

                </h1>

                <p
                className="
                mt-2
                text-gray-500
                "
                >

                    AI-powered habitat monitoring,
                    vegetation analysis and environmental intelligence.

                </p>

            </div>

            {/* KPI Cards */}

            <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-6
            "
            >

                <HabitatCard
                    title="Habitats"
                    value={dashboard?.totalHabitats ?? 0}
                    icon={<Trees size={24}/>}
                    color="bg-green-600"
                />

                <HabitatCard
                    title="Habitat Quality"
                    value={dashboard?.averageHabitatQuality ?? 0}
                    icon={<Leaf size={24}/>}
                    color="bg-blue-600"
                />

                <HabitatCard
                    title="Suitability"
                    value={`${dashboard?.averageSuitability ?? 0}%`}
                    icon={<Mountain size={24}/>}
                    color="bg-purple-600"
                />

                <HabitatCard
                    title="Healthy"
                    value={dashboard?.healthyHabitats ?? 0}
                    icon={<ShieldCheck size={24}/>}
                    color="bg-emerald-600"
                />

                <HabitatCard
                    title="Critical"
                    value={dashboard?.criticalHabitats ?? 0}
                    icon={<Globe size={24}/>}
                    color="bg-red-600"
                />

            </div>

            {/* Row 1 */}

            <div
            className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
            "
            >

                {
                    classification &&
                    <HabitatClassificationChart
                        data={classification}
                    />
                }

                {
                    vegetation &&
                    <VegetationAnalysisCard
                        data={vegetation}
                    />
                }

            </div>

            {/* Row 2 */}

            <div
            className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
            "
            >

                {
                    degradation &&
                    <HabitatDegradationPanel
                        data={degradation}
                    />
                }

                {
                    environment &&
                    <EnvironmentalMonitoringPanel
                        data={environment}
                    />
                }

            </div>

            {/* Suitability */}

            {
                suitability &&
                <HabitatSuitabilityGauge
                    data={suitability}
                />
            }

            {/* AI Insights */}

            {
                dashboard &&
                vegetation &&
                environment &&
                suitability &&
                <HabitatAIInsights

    quality={
        dashboard.averageHabitatQuality
    }

    degradation={
        vegetation.averageVegetationDensity
    }

    suitability={
        suitability.averageSuitabilityScore
    }

    status={
        environment.environmentalStatus
    }

/>
            }

            <HabitatSummary

    totalHabitats={
        dashboard?.totalHabitats ?? 0
    }

    quality={
        dashboard?.averageHabitatQuality ?? 0
    }

    suitability={
        dashboard?.averageSuitability ?? 0
    }

    healthy={
        dashboard?.healthyHabitats ?? 0
    }

/>

        </div>

        

    );



}