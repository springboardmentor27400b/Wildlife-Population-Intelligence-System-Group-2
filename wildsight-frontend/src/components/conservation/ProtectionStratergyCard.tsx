import {
  Shield,
  Trees,
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";

interface Props {

    data:{

        biodiversityScore:number;

        habitatQuality:number;

        averageGrowthRate:number;

        protectionLevel:string;

        strategy:string;

        expectedImpact:string;

    };

}

export default function ProtectionStrategyCard({

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

            <div className="flex items-center gap-3 mb-6">

                <div
                className="
                bg-blue-100
                p-3
                rounded-2xl
                "
                >

                    <Shield className="text-blue-600"/>

                </div>

                <div>

                    <h2 className="text-2xl font-bold">

                        Protection Strategy

                    </h2>

                    <p className="text-gray-500">

                        AI wildlife protection planning

                    </p>

                </div>

            </div>

            {/* Metrics */}

            <div className="grid grid-cols-3 gap-4">

                <MetricCard

                    title="Biodiversity"

                    value={`${data.biodiversityScore}%`}

                    icon={<Trees className="text-green-600"/>}

                />

                <MetricCard

                    title="Habitat"

                    value={`${data.habitatQuality}%`}

                    icon={<Shield className="text-blue-600"/>}

                />

                <MetricCard

                    title="Growth"

                    value={`${data.averageGrowthRate}%`}

                    icon={<TrendingUp className="text-purple-600"/>}

                />

            </div>

            {/* Protection */}

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

                <div className="flex items-center gap-2 mb-3">

                    <Target className="text-blue-600"/>

                    <h3 className="font-semibold">

                        Protection Level

                    </h3>

                </div>

                <span
                className="
                inline-block
                bg-blue-600
                text-white
                px-4
                py-2
                rounded-full
                font-semibold
                "
                >

                    {data.protectionLevel}

                </span>

            </div>

            {/* Strategy */}

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

                <div className="flex items-center gap-2 mb-2">

                    <Sparkles className="text-green-600"/>

                    <h3 className="font-semibold">

                        Protection Strategy

                    </h3>

                </div>

                <p className="text-gray-700">

                    {data.strategy}

                </p>

            </div>

            {/* Expected Impact */}

            <div
            className="
            mt-6
            rounded-2xl
            bg-purple-50
            border
            border-purple-100
            p-5
            "
            >

                <h3 className="font-semibold mb-2">

                    Expected Impact

                </h3>

                <p className="text-gray-700">

                    {data.expectedImpact}

                </p>

            </div>

        </div>

    );

}

interface MetricProps{

    title:string;

    value:string;

    icon:React.ReactNode;

}

function MetricCard({

    title,

    value,

    icon

}:MetricProps){

    return(

        <div
        className="
        bg-slate-50
        rounded-2xl
        p-4
        text-center
        "
        >

            <div className="flex justify-center mb-2">

                {icon}

            </div>

            <p className="text-gray-500 text-sm">

                {title}

            </p>

            <h3 className="font-bold text-xl mt-2">

                {value}

            </h3>

        </div>

    );

}