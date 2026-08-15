import { useEffect, useState } from "react";

import SurveyCard from "../components/survey/SurveyCard";
import SurveyStatusChart from "../components/survey/SurveyStatusChart";
import HabitatCoverageChart from "../components/survey/HabitatCoverageChart";
import RecentSurveyTable from "../components/survey/RecentSurveyTable";
import SurveyAIInsights from "../components/survey/SurveyAIInsights";


import {
    getSurveyDashboard,
    getAllSurveys
} from "../services/SurveyService";


import {
    SurveyDashboard,
    Survey
} from "../types/survey";


import {
    ClipboardList,
    CheckCircle,
    Clock,
    Trees,
    MapPin
} from "lucide-react";



export default function SurveyIntelligence(){


    const [dashboard,setDashboard] =
        useState<SurveyDashboard | null>(null);



    const [surveys,setSurveys] =
        useState<Survey[]>([]);



    useEffect(()=>{

        loadData();

    },[]);



    const loadData = async()=>{


        try{


            const dashboardData =
                await getSurveyDashboard();



            const surveyData =
                await getAllSurveys();



            setDashboard(
                dashboardData
            );


            setSurveys(
                surveyData
            );


        }
        catch(error){

            console.error(
                "Survey loading failed",
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



            {/* HEADER */}


            <div>


                <h1
                className="
                text-4xl
                font-bold
                "
                >

                    Wildlife Survey Intelligence 📍

                </h1>



                <p
                className="
                text-gray-500
                mt-2
                "
                >

                    AI-powered wildlife monitoring,
                    survey management and habitat coverage analysis.

                </p>


            </div>





            {/* KPI CARDS */}



            <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-6
            "
            >



                <SurveyCard

                    title="Total Surveys"

                    value={
                        dashboard?.totalSurveys ?? 0
                    }

                    icon={
                        <ClipboardList size={25}/>
                    }

                    color="bg-green-600"

                />



                <SurveyCard

                    title="Completed"

                    value={
                        dashboard?.completedSurveys ?? 0
                    }

                    icon={
                        <CheckCircle size={25}/>
                    }

                    color="bg-blue-600"

                />



                <SurveyCard

                    title="Active"

                    value={
                        dashboard?.activeSurveys ?? 0
                    }

                    icon={
                        <Clock size={25}/>
                    }

                    color="bg-purple-600"

                />



                <SurveyCard

                    title="Forest Surveys"

                    value={
                        dashboard?.forestSurveys ?? 0
                    }

                    icon={
                        <Trees size={25}/>
                    }

                    color="bg-emerald-600"

                />



                <SurveyCard

                    title="Dominant Habitat"

                    value={
                        dashboard?.dominantHabitat ?? "--"
                    }

                    icon={
                        <MapPin size={25}/>
                    }

                    color="bg-orange-500"

                />


            </div>






            {/* CHARTS */}



            <div
            className="
            grid
            xl:grid-cols-2
            gap-6
            "
            >


                {
                    dashboard &&

                    <SurveyStatusChart

                        active={
                            dashboard.activeSurveys
                        }

                        completed={
                            dashboard.completedSurveys
                        }

                        pending={
                            dashboard.pendingSurveys
                        }

                    />

                }



                {
                    dashboard &&

                    <HabitatCoverageChart

                        forest={
                            dashboard.forestSurveys
                        }

                        grassland={
                            dashboard.grasslandSurveys
                        }

                        wetland={
                            dashboard.wetlandSurveys
                        }

                    />

                }



            </div>







            {/* TABLE */}



            <RecentSurveyTable

                data={surveys}

            />








            {/* AI INSIGHTS */}



            {
                dashboard &&


                <SurveyAIInsights

                    totalSurveys={
                        dashboard.totalSurveys
                    }

                    completedSurveys={
                        dashboard.completedSurveys
                    }

                    dominantHabitat={
                        dashboard.dominantHabitat
                    }

                />

            }



        </div>


    );

}