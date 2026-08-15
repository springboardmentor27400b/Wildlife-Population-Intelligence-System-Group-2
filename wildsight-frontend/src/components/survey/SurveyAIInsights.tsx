import {
    Brain,
    Map,
    Activity,
    Sparkles
} from "lucide-react";


interface Props{

    totalSurveys:number;

    completedSurveys:number;

    dominantHabitat:string;

}


export default function SurveyAIInsights({

    totalSurveys,

    completedSurveys,

    dominantHabitat

}:Props){


    const completionRate =

        totalSurveys===0

        ?

        0

        :

        Math.round(
            (completedSurveys/totalSurveys)*100
        );



    return(

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
            mb-6
            "
            >

                <div
                className="
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                    <Brain
                    className="text-green-600"
                    />

                </div>


                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        AI Survey Insights

                    </h2>


                    <p
                    className="
                    text-gray-500
                    "
                    >

                        Intelligent monitoring analysis

                    </p>


                </div>


            </div>



            <div
            className="
            grid
            md:grid-cols-3
            gap-5
            "
            >


                <Insight

                    icon={
                        <Activity
                        className="text-blue-600"/>
                    }

                    title="Completion Rate"

                    value={`${completionRate}%`}

                />


                <Insight

                    icon={
                        <Map
                        className="text-green-600"/>
                    }

                    title="Dominant Habitat"

                    value={dominantHabitat}

                />


                <Insight

                    icon={
                        <Sparkles
                        className="text-purple-600"/>
                    }

                    title="Monitoring Status"

                    value={
                        completedSurveys>0
                        ?
                        "Stable"
                        :
                        "Needs Attention"
                    }

                />


            </div>


        </div>

    );

}



function Insight({

    icon,

    title,

    value

}:{

    icon:React.ReactNode;

    title:string;

    value:string;

}){


    return(

        <div
        className="
        bg-slate-50
        rounded-2xl
        p-5
        "
        >

            <div
            className="
            mb-3
            "
            >

                {icon}

            </div>


            <p
            className="
            text-gray-500
            text-sm
            "
            >

                {title}

            </p>


            <h3
            className="
            text-xl
            font-bold
            mt-2
            "
            >

                {value}

            </h3>


        </div>

    );

}