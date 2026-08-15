import {
  Thermometer,
  Droplets,
  CloudRain,
  Waves,
  Wind,
  Globe,
} from "lucide-react";

interface Props{

    data:{

        averageTemperature:number;

        averageHumidity:number;

        averageRainfall:number;

        averageWaterQuality:number;

        averageAirQuality:number;

        environmentalStatus:string;

    };

}

export default function EnvironmentalMonitoringPanel({

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
                bg-cyan-100
                p-3
                rounded-2xl
                "
                >

                    <Globe
                    className="
                    text-cyan-600
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

                        Environmental Monitoring

                    </h2>

                    <p
                    className="
                    text-gray-500
                    text-sm
                    "
                    >

                        Live environmental indicators

                    </p>

                </div>

            </div>

            {/* Metrics */}

            <div
            className="
            grid
            grid-cols-2
            gap-4
            "
            >

                <MetricCard

                    icon={<Thermometer size={24}/>}

                    title="Temperature"

                    value={`${data.averageTemperature.toFixed(1)} °C`}

                    color="bg-red-100"

                    iconColor="text-red-600"

                />

                <MetricCard

                    icon={<Droplets size={24}/>}

                    title="Humidity"

                    value={`${data.averageHumidity.toFixed(1)} %`}

                    color="bg-blue-100"

                    iconColor="text-blue-600"

                />

                <MetricCard

                    icon={<CloudRain size={24}/>}

                    title="Rainfall"

                    value={`${data.averageRainfall.toFixed(1)} mm`}

                    color="bg-cyan-100"

                    iconColor="text-cyan-600"

                />

                <MetricCard

                    icon={<Waves size={24}/>}

                    title="Water Quality"

                    value={`${data.averageWaterQuality.toFixed(1)} %`}

                    color="bg-green-100"

                    iconColor="text-green-600"

                />

                <MetricCard

                    icon={<Wind size={24}/>}

                    title="Air Quality"

                    value={`${data.averageAirQuality.toFixed(1)} %`}

                    color="bg-purple-100"

                    iconColor="text-purple-600"

                />

                <div
                className="
                rounded-2xl
                bg-gradient-to-r
                from-green-500
                to-emerald-500
                text-white
                p-5
                flex
                flex-col
                justify-center
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

                        {data.environmentalStatus}

                    </h3>

                </div>

            </div>

            {/* AI Observation */}

            <div
            className="
            mt-6
            rounded-2xl
            border
            bg-cyan-50
            border-cyan-100
            p-5
            "
            >

                <h3
                className="
                font-semibold
                text-cyan-700
                mb-2
                "
                >

                    🌍 AI Environmental Observation

                </h3>

                <p
                className="
                text-gray-700
                leading-relaxed
                "
                >

                    {data.environmentalStatus==="Excellent"

                    ?

                    "Environmental conditions are excellent for sustaining biodiversity and healthy wildlife habitats."

                    :

                    data.environmentalStatus==="Good"

                    ?

                    "Current environmental conditions are suitable with minor monitoring recommendations."

                    :

                    data.environmentalStatus==="Moderate"

                    ?

                    "Environmental quality is declining. Preventive conservation measures are recommended."

                    :

                    "Critical environmental degradation detected. Immediate restoration is required."

                    }

                </p>

            </div>

        </div>

    );

}

interface MetricCardProps{

    icon:React.ReactNode;

    title:string;

    value:string;

    color:string;

    iconColor:string;

}

function MetricCard({

    icon,

    title,

    value,

    color,

    iconColor

}:MetricCardProps){

    return(

        <div
        className="
        rounded-2xl
        border
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
                    text-sm
                    text-gray-500
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