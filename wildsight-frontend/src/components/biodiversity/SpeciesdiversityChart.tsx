import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import {
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface Props {
  data: any[];
}

const colors = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
  "#14b8a6",
];

export default function SpeciesDiversityChart({ data }: Props) {
  return (
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

      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-3">

          <div className="bg-green-100 p-3 rounded-2xl">

            <BarChart3 className="text-green-600 w-6 h-6" />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Species Diversity Analysis
            </h2>

            <p className="text-gray-500 text-sm">
              AI calculated biodiversity distribution
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">

          <TrendingUp size={16} />

          Live

        </div>

      </div>

      {/* Chart */}

      <ResponsiveContainer width="100%" height={330}>

        <BarChart data={data}>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="speciesName"
            tick={{ fontSize: 12 }}
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="diversityScore"
            radius={[10,10,0,0]}
          >

            {
              data.map((_: any,index:number)=>(

                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                />

              ))
            }

          </Bar>

        </BarChart>

      </ResponsiveContainer>

      {/* Footer */}

      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="bg-green-50 rounded-xl p-4">

          <p className="text-gray-500 text-sm">
            Highest Diversity
          </p>

          <h3 className="font-bold text-xl text-green-700">
            {data.length > 0
              ? data[0].speciesName
              : "--"}
          </h3>

        </div>

        <div className="bg-blue-50 rounded-xl p-4">

          <p className="text-gray-500 text-sm">
            Species Count
          </p>

          <h3 className="font-bold text-xl text-blue-700">
            {data.length}
          </h3>

        </div>

        <div className="bg-purple-50 rounded-xl p-4">

          <p className="text-gray-500 text-sm">
            Average Score
          </p>

          <h3 className="font-bold text-xl text-purple-700">

            {data.length
              ? (
                  data.reduce(
                    (sum:any,item:any)=>
                      sum+item.diversityScore,
                    0
                  )/data.length
                ).toFixed(1)
              : 0}

          </h3>

        </div>

      </div>

    </div>
  );
}