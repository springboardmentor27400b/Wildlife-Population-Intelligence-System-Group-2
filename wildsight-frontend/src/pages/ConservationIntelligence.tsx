import { useEffect, useState } from "react";

import ConservationCard from "../components/conservation/ConservationCard";
import ConservationPriorityCard from "../components/conservation/ConservationPriorityCard";
import HabitatRestorationCard from "../components/conservation/HabitatRestorationCard";
import ProtectionStrategyCard from "../components/conservation/ProtectionStratergyCard";
import MonitoringOptimizationCard from "../components/conservation/MonitoringOptimizationCard";
import ResourceAllocationCard from "../components/conservation/ResourceAllocationCard";
import ConservationAIInsights from "../components/conservation/ConservationAIInsights";

import {
    getConservationDashboard,
    getConservationPriority,
    getHabitatRestoration,
    getProtectionStrategy,
    getMonitoringOptimization,
    getResourceAllocation
} from "../services/ConservationService";

import {
    ConservationDashboard,
    ConservationPriority,
    HabitatRestoration,
    ProtectionStrategy,
    MonitoringOptimization,
    ResourceAllocation
} from "../types/conservation";

import {
    ShieldCheck,
    Leaf,
    Trees,
    Activity,
    Target
} from "lucide-react";

export default function ConservationIntelligence(){

    const [dashboard,setDashboard] =
        useState<ConservationDashboard | null>(null);

    const [priority,setPriority] =
        useState<ConservationPriority | null>(null);

    const [restoration,setRestoration] =
        useState<HabitatRestoration | null>(null);

    const [protection,setProtection] =
        useState<ProtectionStrategy | null>(null);

    const [monitoring,setMonitoring] =
        useState<MonitoringOptimization | null>(null);

    const [resources,setResources] =
        useState<ResourceAllocation | null>(null);

    useEffect(()=>{

        loadData();

    },[]);

    const loadData = async()=>{

        try{

            const dashboardData =
                await getConservationDashboard();

            const priorityData =
                await getConservationPriority();

            const restorationData =
                await getHabitatRestoration();

            const protectionData =
                await getProtectionStrategy();

            const monitoringData =
                await getMonitoringOptimization();

            const resourceData =
                await getResourceAllocation();

            setDashboard(dashboardData);

            setPriority(priorityData);

            setRestoration(restorationData);

            setProtection(protectionData);

            setMonitoring(monitoringData);

            setResources(resourceData);

        }
        catch(error){

            console.error(
                "Conservation dashboard loading failed",
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

                    Conservation Intelligence 🌍

                </h1>

                <p
                className="
                mt-2
                text-gray-500
                "
                >

                    AI-powered conservation planning, restoration,
                    monitoring optimization and protection strategies.

                </p>

            </div>

            {/* KPI */}

            <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-6
            "
            >

                <ConservationCard
                    title="Biodiversity"
                    value={priority?.biodiversityScore ?? 0}
                    icon={<Leaf size={24}/>}
                    color="bg-green-600"
                />

                <ConservationCard
                    title="Growth Rate"
                    value={`${priority?.averageGrowthRate ?? 0}%`}
                    icon={<Activity size={24}/>}
                    color="bg-blue-600"
                />

                <ConservationCard
                    title="Increasing Species"
                    value={priority?.increasingSpecies ?? 0}
                    icon={<Trees size={24}/>}
                    color="bg-emerald-600"
                />

                <ConservationCard
                    title="Stable Species"
                    value={priority?.stableSpecies ?? 0}
                    icon={<ShieldCheck size={24}/>}
                    color="bg-purple-600"
                />

                <ConservationCard
                    title="Priority"
                    value={priority?.conservationPriority ?? "--"}
                    icon={<Target size={24}/>}
                    color="bg-red-600"
                />

            </div>

            {/* Row 1 */}

            <div
            className="
            grid
            xl:grid-cols-2
            gap-6
            "
            >

                {
                    priority &&
                    <ConservationPriorityCard
                        data={priority}
                    />
                }

                {
                    restoration &&
                    <HabitatRestorationCard
                        data={restoration}
                    />
                }

            </div>

            {/* Row 2 */}

            <div
            className="
            grid
            xl:grid-cols-2
            gap-6
            "
            >

                {
                    protection &&
                    <ProtectionStrategyCard
                        data={protection}
                    />
                }

                {
                    monitoring &&
                    <MonitoringOptimizationCard
                        data={monitoring}
                    />
                }

            </div>

            {/* Resources */}

            {
                resources &&
                <ResourceAllocationCard
                    data={resources}
                />
            }

            {/* AI */}

            {
                priority &&
                restoration &&
                protection &&
                resources &&
                <ConservationAIInsights

                    biodiversityScore={
                        priority.biodiversityScore
                    }

                    habitatQuality={
                        restoration.averageHabitatQuality
                    }

                    protectionLevel={
                        protection.protectionLevel
                    }

                    budgetPriority={
                        resources.budgetPriority
                    }

                />
            }

        </div>

    );

}