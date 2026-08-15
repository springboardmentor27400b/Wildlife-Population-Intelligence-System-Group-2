import {
    Camera,
    Drone,
    Brain,
    CalendarDays,
    Activity
} from "lucide-react";

interface Props{

    data:{

        recommendedSurveyFrequency:number;

        monitoringLevel:string;

        cameraTrapRecommendation:string;

        droneMonitoring:string;

        aiRecommendation:string;

    };

}

export default function MonitoringOptimizationCard({

    data

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-3xl
        border
        shadow-sm
        p-6
        hover:shadow-xl
        transition-all
        "
        >

            {/* Header */}

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
                bg-indigo-100
                p-3
                rounded-2xl
                "
                >

                    <Activity
                    className="
                    text-indigo-600
                    "
                    />

                </div>

                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        Monitoring Optimization

                    </h2>

                    <p
                    className="
                    text-gray-500
                    "
                    >

                        AI monitoring recommendations

                    </p>

                </div>

            </div>

            {/* Survey Frequency */}

            <div
            className="
            bg-slate-50
            rounded-2xl
            p-5
            mb-5
            "
            >

                <div
                className="
                flex
                items-center
                gap-2
                "
                >

                    <CalendarDays className="text-blue-600"/>

                    <h3 className="font-semibold">

                        Survey Frequency

                    </h3>

                </div>

                <p
                className="
                mt-3
                text-3xl
                font-bold
                "
                >

                    Every {data.recommendedSurveyFrequency} Days

                </p>

            </div>

            {/* Monitoring Level */}

            <div
            className="
            bg-blue-50
            border
            border-blue-100
            rounded-2xl
            p-5
            mb-5
            "
            >

                <h3 className="font-semibold">

                    Monitoring Level

                </h3>

                <span
                className="
                inline-block
                mt-3
                bg-blue-600
                text-white
                px-4
                py-2
                rounded-full
                font-semibold
                "
                >

                    {data.monitoringLevel}

                </span>

            </div>

            {/* Camera */}

            <InfoBox

                icon={<Camera className="text-green-600"/>}

                title="Camera Trap Recommendation"

                text={data.cameraTrapRecommendation}

            />

            {/* Drone */}

            <InfoBox

                icon={<Drone className="text-orange-600"/>}

                title="Drone Monitoring"

                text={data.droneMonitoring}

            />

            {/* AI */}

            <InfoBox

                icon={<Brain className="text-purple-600"/>}

                title="AI Recommendation"

                text={data.aiRecommendation}

            />

        </div>

    );

}

interface InfoProps{

    icon:React.ReactNode;

    title:string;

    text:string;

}

function InfoBox({

    icon,

    title,

    text

}:InfoProps){

    return(

        <div
        className="
        mt-5
        rounded-2xl
        border
        p-4
        "
        >

            <div
            className="
            flex
            items-center
            gap-3
            mb-2
            "
            >

                {icon}

                <h3
                className="
                font-semibold
                "
                >

                    {title}

                </h3>

            </div>

            <p
            className="
            text-gray-700
            "
            >

                {text}

            </p>

        </div>

    );

}