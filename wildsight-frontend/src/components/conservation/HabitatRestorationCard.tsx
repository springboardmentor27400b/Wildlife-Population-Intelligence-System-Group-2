import {
    Trees,
    Hammer,
    CheckCircle2,
    Sparkles
} from "lucide-react";

interface Props{

    data:{

        averageHabitatQuality:number;

        totalHabitats:number;

        restorationPriority:string;

        restorationRecommendation:string;

        expectedOutcome:string;

    };

}

export default function HabitatRestorationCard({

    data

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-3xl
        shadow-sm
        border
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
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                    <Trees className="text-green-600"/>

                </div>

                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        Habitat Restoration

                    </h2>

                    <p
                    className="
                    text-gray-500
                    "
                    >

                        AI restoration recommendations

                    </p>

                </div>

            </div>

            {/* Statistics */}

            <div
            className="
            grid
            grid-cols-2
            gap-4
            "
            >

                <StatCard

                    title="Habitat Quality"

                    value={`${data.averageHabitatQuality}%`}

                />

                <StatCard

                    title="Habitats"

                    value={data.totalHabitats}

                />

            </div>

            {/* Priority */}

            <div
            className="
            mt-6
            rounded-2xl
            bg-yellow-50
            border
            border-yellow-100
            p-5
            "
            >

                <div
                className="
                flex
                items-center
                gap-2
                mb-3
                "
                >

                    <Hammer className="text-yellow-600"/>

                    <h3 className="font-semibold">

                        Restoration Priority

                    </h3>

                </div>

                <span
                className="
                inline-block
                bg-yellow-500
                text-white
                px-4
                py-2
                rounded-full
                font-semibold
                "
                >

                    {data.restorationPriority}

                </span>

            </div>

            {/* Recommendation */}

            <div
            className="
            mt-6
            rounded-2xl
            bg-green-50
            border
            border-green-100
            p-5
            "
            >

                <div
                className="
                flex
                items-center
                gap-2
                mb-2
                "
                >

                    <Sparkles className="text-green-600"/>

                    <h3 className="font-semibold">

                        AI Recommendation

                    </h3>

                </div>

                <p className="text-gray-700">

                    {data.restorationRecommendation}

                </p>

            </div>

            {/* Expected Outcome */}

            <div
            className="
            mt-6
            rounded-2xl
            bg-blue-50
            border
            border-blue-100
            p-5
            "
            >

                <div
                className="
                flex
                items-center
                gap-2
                mb-2
                "
                >

                    <CheckCircle2 className="text-blue-600"/>

                    <h3 className="font-semibold">

                        Expected Outcome

                    </h3>

                </div>

                <p className="text-gray-700">

                    {data.expectedOutcome}

                </p>

            </div>

        </div>

    );

}

interface StatProps{

    title:string;

    value:string|number;

}

function StatCard({

    title,

    value

}:StatProps){

    return(

        <div
        className="
        bg-slate-50
        rounded-2xl
        p-4
        "
        >

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