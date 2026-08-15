import { useEffect, useState } from "react";


import BiodiversityCard from "../components/biodiversity/BiodiversityCard";
import SpeciesDiversityChart from "../components/biodiversity/SpeciesdiversityChart";
import HabitatHealthCard from "../components/biodiversity/HabitatHealthCard";
import EcosystemHealthGauge from "../components/biodiversity/EcosystemHealthGauge";
import BiodiversityAIInsights from "../components/biodiversity/BiodiversityAIInsights";


import {
    getBiodiversityDashboard,
    getSpeciesDiversity,
    getHabitatHealth,
    getEcosystemHealth
} from "../services/BiodiversityService";


import {
    BiodiversityDashboard
} from "../types/biodiversity";


import {
    Leaf,
    PawPrint,
    Trees,
    Activity,
    ShieldCheck
} from "lucide-react";



function BiodiversityIntelligence(){



    const [dashboard,setDashboard] =
        useState<BiodiversityDashboard | null>(null);



    const [speciesData,setSpeciesData] =
        useState<any[]>([]);



    const [habitatData,setHabitatData] =
        useState<any>(null);



    const [ecosystemData,setEcosystemData] =
        useState<any>(null);




    useEffect(()=>{

        loadData();

    },[]);





    const loadData = async()=>{


        try{


            const dashboardResponse =
                await getBiodiversityDashboard();



            const speciesResponse =
                await getSpeciesDiversity();



            const habitatResponse =
                await getHabitatHealth();



            const ecosystemResponse =
                await getEcosystemHealth();




            setDashboard(
                dashboardResponse
            );


            setSpeciesData(
                speciesResponse
            );


            setHabitatData(
                habitatResponse
            );


            setEcosystemData(
                ecosystemResponse
            );


        }
        catch(error){

            console.error(
                "Biodiversity loading failed",
                error
            );

        }


    };





    return (

        <div
        className="
        min-h-screen
        bg-slate-50
        p-8
        space-y-8
        "
        >



            {/* HEADER */}


            <div>


                <h1
                className="
                text-4xl
                font-bold
                "
                >

                    Biodiversity Intelligence 🌿

                </h1>


                <p
                className="
                text-gray-500
                mt-2
                "
                >

                    AI-powered biodiversity analysis,
                    ecosystem monitoring and conservation insights.

                </p>


            </div>






            {/* KPI CARDS */}



            <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-8
            "
            >



                <BiodiversityCard

                    title="Assessments"

                    value={
                        dashboard?.totalAssessments ?? 0
                    }

                    icon={
                        <Leaf size={25}/>
                    }

                    color="bg-gradient-to-r from-green-500 to-emerald-600"

                />





                <BiodiversityCard

                    title="Species"

                    value={
                        dashboard?.totalSpecies ?? 0
                    }

                    icon={
                        <PawPrint size={25}/>
                    }

                    color="bg-gradient-to-r from-orange-500 to-red-500"

                />





                <BiodiversityCard

                    title="Diversity Score"

                    value={
                        dashboard?.averageSpeciesDiversity ?? 0
                    }

                    icon={
                        <Activity size={25}/>
                    }

                    color="bg-gradient-to-r from-blue-500 to-indigo-600"

                />





                <BiodiversityCard

                    title="Habitat Quality"

                    value={
                        dashboard?.averageHabitatQuality ?? 0
                    }

                    icon={
                        <Trees size={25}/>
                    }

                    color="bg-gradient-to-r from-cyan-500 to-teal-600"

                />





                <BiodiversityCard

                    title="Ecosystem Health"

                    value={
                        dashboard?.averageEcosystemHealth ?? 0
                    }

                    icon={
                        <ShieldCheck size={25}/>
                    }

                    color="bg-gradient-to-r from-violet-500 to-purple-700"

                />



            </div>








            {/* CHART SECTION */}



            <div
            className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-6
            "
            >


                <SpeciesDiversityChart

                    data={speciesData}

                />



                {
                    habitatData &&

                    <HabitatHealthCard

                        averageQuality={
                            habitatData.averageHabitatHealth
                        }

                        healthyCount={
                            dashboard?.healthyCount ?? 0
                        }

                        vulnerableCount={
                            dashboard?.vulnerableCount ?? 0
                        }

                        criticalCount={
                            dashboard?.criticalCount ?? 0
                        }

                    />

                }


            </div>








            {/* ECOSYSTEM */}



            {
                ecosystemData &&


                <EcosystemHealthGauge

                    ecosystemHealth={
                        ecosystemData.averageEcosystemHealth
                    }

                    overallScore={
                        dashboard?.averageOverallScore ?? 0
                    }

                    status={
                        ecosystemData.monitoringStatus
                    }

                />

            }








            {/* AI INSIGHTS */}



            <BiodiversityAIInsights

                diversityScore={
                    dashboard?.averageSpeciesDiversity ?? 0
                }


                habitatQuality={
                    dashboard?.averageHabitatQuality ?? 0
                }


                ecosystemHealth={
                    dashboard?.averageEcosystemHealth ?? 0
                }


                status={
                    ecosystemData?.monitoringStatus ??
                    "Unknown"
                }

            />




        </div>

    );


}


export default BiodiversityIntelligence;