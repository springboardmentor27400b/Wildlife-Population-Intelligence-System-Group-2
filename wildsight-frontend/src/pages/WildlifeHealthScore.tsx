import { useEffect, useState } from "react";

import HealthScoreCard from "../components/health/HealthScoreCard";
import HealthMetricsGrid from "../components/health/HealthMetricsGrid";

import {
    getHealthScore
} from "../services/HealthScoreService";

import {
    WildlifeHealthScore
} from "../types/health";

import {
    HeartPulse,
    Activity
} from "lucide-react";


export default function WildlifeHealthScore(){


    const [data,setData] =
        useState<WildlifeHealthScore | null>(null);



    useEffect(()=>{

        loadHealthScore();

    },[]);



    const loadHealthScore = async()=>{

        try{

            const response =
                await getHealthScore();

            setData(response);

        }
        catch(error){

            console.error(
                "Health score loading failed",
                error
            );

        }

    };



    if(!data){

        return(

            <div
            className="
            min-h-screen
            flex
            items-center
            justify-center
            "
            >

                Loading Health Intelligence...

            </div>

        );

    }



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

            <div
            className="
            flex
            items-center
            gap-4
            "
            >

                <div
                className="
                bg-green-100
                p-4
                rounded-2xl
                "
                >

                    <HeartPulse
                    className="
                    text-green-600
                    "
                    size={32}
                    />

                </div>


                <div>

                    <h1
                    className="
                    text-4xl
                    font-bold
                    "
                    >

                    Wildlife Health Intelligence

                    </h1>


                    <p
                    className="
                    text-gray-500
                    mt-2
                    "
                    >

                    AI-powered ecosystem health assessment

                    </p>


                </div>


            </div>




            {/* Main Score */}


            <HealthScoreCard

                score={
                    data.ecosystemHealthScore
                }

                status={
                    data.conservationStatus
                }

            />




            {/* Metrics */}


            <HealthMetricsGrid

                data={data}

            />




            {/* Recommendation */}


            <div
            className="
            bg-white
            rounded-3xl
            border
            shadow-sm
            p-6
            "
            >

                <div
                className="
                flex
                items-center
                gap-3
                mb-4
                "
                >

                    <Activity
                    className="
                    text-blue-600
                    "
                    />

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                    Health Assessment

                    </h2>


                </div>


                <p
                className="
                text-gray-600
                "
                >

                    Ecosystem is currently classified as

                    <span
                    className="
                    font-bold
                    mx-2
                    "
                    >

                    {data.conservationStatus}

                    </span>

                    based on biodiversity,
                    population stability,
                    habitat condition and
                    environmental parameters.

                </p>


            </div>


        </div>

    );

}