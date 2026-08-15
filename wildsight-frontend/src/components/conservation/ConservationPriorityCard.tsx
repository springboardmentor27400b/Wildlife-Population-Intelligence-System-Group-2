import {
    ShieldAlert,
    TrendingUp,
    PawPrint,
    Sparkles
} from "lucide-react";

interface Props{

    data:{

        biodiversityScore:number;

        averageGrowthRate:number;

        increasingSpecies:number;

        stableSpecies:number;

        decreasingSpecies:number;

        conservationPriority:string;

        reason:string;

        recommendedAction:string;

    };

}

export default function ConservationPriorityCard({

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
                bg-red-100
                p-3
                rounded-2xl
                "
                >

                    <ShieldAlert
                    className="
                    text-red-600
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

                        Conservation Priority

                    </h2>

                    <p
                    className="
                    text-gray-500
                    "
                    >

                        AI Priority Assessment

                    </p>

                </div>

            </div>

            <div
            className="
            grid
            grid-cols-2
            gap-4
            "
            >

                <InfoCard
                    title="Biodiversity Score"
                    value={`${data.biodiversityScore}%`}
                />

                <InfoCard
                    title="Growth Rate"
                    value={`${data.averageGrowthRate}%`}
                />

                <InfoCard
                    title="Increasing Species"
                    value={data.increasingSpecies}
                />

                <InfoCard
                    title="Stable Species"
                    value={data.stableSpecies}
                />

            </div>

            <div
            className="
            mt-6
            rounded-2xl
            bg-red-50
            border
            border-red-100
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

                    <TrendingUp
                    className="
                    text-red-600
                    "
                    />

                    <h3
                    className="
                    font-semibold
                    "
                    >

                        Priority Level

                    </h3>

                </div>

                <span
                className="
                inline-block
                px-4
                py-2
                rounded-full
                bg-red-600
                text-white
                font-semibold
                "
                >

                    {data.conservationPriority}

                </span>

                <p
                className="
                mt-4
                text-gray-700
                "
                >

                    {data.reason}

                </p>

            </div>

            <div
            className="
            mt-6
            bg-green-50
            border
            border-green-100
            rounded-2xl
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

                    <Sparkles
                    className="
                    text-green-600
                    "
                    />

                    <h3
                    className="
                    font-semibold
                    "
                    >

                        AI Recommendation

                    </h3>

                </div>

                <p
                className="
                text-gray-700
                "
                >

                    {data.recommendedAction}

                </p>

            </div>

        </div>

    );

}

interface CardProps{

    title:string;

    value:string|number;

}

function InfoCard({

    title,

    value

}:CardProps){

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