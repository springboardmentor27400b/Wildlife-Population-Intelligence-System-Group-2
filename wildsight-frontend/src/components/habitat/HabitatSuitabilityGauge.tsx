import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Props{

    data:{

        averageSuitabilityScore:number;

        highlySuitableHabitats:number;

        moderatelySuitableHabitats:number;

        unsuitableHabitats:number;

        suitabilityStatus:string;

    };

}

export default function HabitatSuitabilityGauge({

    data

}:Props){

    const chartData=[

        {

            name:"Suitability",

            value:data.averageSuitabilityScore,

            fill:"#22c55e"

        }

    ];

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
            mb-8
            "
            >

                <div
                className="
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                    <Target
                    className="
                    text-green-600
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

                        Habitat Suitability

                    </h2>

                    <p
                    className="
                    text-gray-500
                    text-sm
                    "
                    >

                        AI suitability prediction

                    </p>

                </div>

            </div>

            <div
            className="
            grid
            lg:grid-cols-2
            gap-8
            items-center
            "
            >

                {/* Gauge */}

                <div
                className="
                h-[320px]
                "
                >

                    <ResponsiveContainer
                    width="100%"
                    height="100%"
                    >

                        <RadialBarChart

                            cx="50%"

                            cy="50%"

                            innerRadius="70%"

                            outerRadius="100%"

                            barSize={18}

                            data={chartData}

                            startAngle={90}

                            endAngle={-270}

                        >

                            <PolarAngleAxis

                                type="number"

                                domain={[0,100]}

                                angleAxisId={0}

                                tick={false}

                            />

                            <RadialBar

                                background

                                dataKey="value"

                                cornerRadius={20}

                            />

                            <text

                                x="50%"

                                y="45%"

                                textAnchor="middle"

                                className="fill-gray-500"

                            >

                                Suitability

                            </text>

                            <text

                                x="50%"

                                y="57%"

                                textAnchor="middle"

                                className="fill-black"

                                fontSize="32"

                                fontWeight="bold"

                            >

                                {data.averageSuitabilityScore.toFixed(1)}%

                            </text>

                        </RadialBarChart>

                    </ResponsiveContainer>

                </div>

                {/* Statistics */}

                <div
                className="
                space-y-4
                "
                >

                    <StatusCard

                        icon={<CheckCircle2 size={22}/>}

                        color="bg-green-100"

                        iconColor="text-green-600"

                        title="Highly Suitable"

                        value={data.highlySuitableHabitats}

                    />

                    <StatusCard

                        icon={<AlertTriangle size={22}/>}

                        color="bg-yellow-100"

                        iconColor="text-yellow-600"

                        title="Moderately Suitable"

                        value={data.moderatelySuitableHabitats}

                    />

                    <StatusCard

                        icon={<XCircle size={22}/>}

                        color="bg-red-100"

                        iconColor="text-red-600"

                        title="Unsuitable"

                        value={data.unsuitableHabitats}

                    />

                    <div
                    className="
                    rounded-2xl
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-500
                    text-white
                    p-5
                    mt-6
                    "
                    >

                        <p
                        className="
                        text-sm
                        opacity-80
                        "
                        >

                            Overall Status

                        </p>

                        <h3
                        className="
                        text-2xl
                        font-bold
                        mt-2
                        "
                        >

                            {data.suitabilityStatus}

                        </h3>

                    </div>

                </div>

            </div>

            {/* AI Recommendation */}

            <div
            className="
            mt-8
            rounded-2xl
            bg-green-50
            border
            border-green-100
            p-5
            "
            >

                <h3
                className="
                font-semibold
                text-green-700
                mb-2
                "
                >

                    🤖 AI Habitat Recommendation

                </h3>

                <p
                className="
                text-gray-700
                leading-relaxed
                "
                >

                    {

                        data.averageSuitabilityScore>=80

                        ?

                        "Habitat suitability is excellent. Continue long-term conservation and monitoring."

                        :

                        data.averageSuitabilityScore>=50

                        ?

                        "Habitat is moderately suitable. Improve vegetation density and water quality."

                        :

                        "Habitat suitability is poor. Immediate restoration and protection measures are recommended."

                    }

                </p>

            </div>

        </div>

    );

}

interface StatusCardProps{

    icon:React.ReactNode;

    color:string;

    iconColor:string;

    title:string;

    value:number;

}

function StatusCard({

    icon,

    color,

    iconColor,

    title,

    value

}:StatusCardProps){

    return(

        <div
        className="
        flex
        items-center
        justify-between
        border
        rounded-2xl
        p-4
        hover:shadow-md
        transition-all
        "
        >

            <div
            className="
            flex
            items-center
            gap-3
            "
            >

                <div
                className={`
                ${color}
                p-3
                rounded-xl
                `}
                >

                    <div
                    className={iconColor}
                    >

                        {icon}

                    </div>

                </div>

                <div>

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
                    "
                    >

                        {value}

                    </h3>

                </div>

            </div>

        </div>

    );

}