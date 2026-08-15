import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

import { PopulationTrend } from "../../types/population";

interface Props{

    data: PopulationTrend[];

}

export default function PopulationTrendChart({

    data

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        p-6
        ">

            <h2
            className="
            text-2xl
            font-bold
            mb-5
            ">

                📈 Population Trend

            </h2>

            <ResponsiveContainer
            width="100%"
            height={320}>

                <AreaChart
                data={data}>

                    <defs>

                        <linearGradient
                        id="populationGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">

                            <stop
                            offset="5%"
                            stopColor="#16a34a"
                            stopOpacity={0.8}/>

                            <stop
                            offset="95%"
                            stopColor="#16a34a"
                            stopOpacity={0}/>

                        </linearGradient>

                    </defs>

                    <CartesianGrid
                    strokeDasharray="4 4"/>

                    <XAxis
                    dataKey="month"/>

                    <YAxis/>

                    <Tooltip/>

                    <Area

                    type="monotone"

                    dataKey="population"

                    stroke="#16a34a"

                    strokeWidth={3}

                    fill="url(#populationGradient)"

                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>

    );

}