import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from "recharts";

import { PopulationDistribution } from "../../types/population";

interface Props {
    data: PopulationDistribution[];
}

const COLORS = [
    "#16a34a",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4"
];

export default function PopulationDistributionChart({
    data
}: Props) {

    return (

        <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            p-6
            "
        >

            <h2 className="text-2xl font-bold mb-5">

                🌍 Species Distribution

            </h2>

            <ResponsiveContainer
                width="100%"
                height={340}
            >

                <BarChart data={data}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="species" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="population"
                        radius={[8, 8, 0, 0]}
                    >

                        {
                            data.map((_, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />

                            ))
                        }

                    </Bar>

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}