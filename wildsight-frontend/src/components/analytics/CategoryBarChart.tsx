import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

interface Props {
  data: any[];
}

export default function CategoryBarChart({ data }: Props) {

  return (

    <div className="bg-white rounded-3xl shadow-lg border p-6">

      <h2 className="text-xl font-bold mb-5">
        📊 Category Distribution
      </h2>

      <div className="h-[380px]">

        <ResponsiveContainer>

          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 30,
              right: 30,
            }}
          >

            <defs>

              <linearGradient
                id="greenBar"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >

                <stop
                  offset="0%"
                  stopColor="#16a34a"
                />

                <stop
                  offset="100%"
                  stopColor="#22c55e"
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              opacity={0.2}
            />

            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="url(#greenBar)"
              radius={[12, 12, 12, 12]}
              barSize={30}
            >

              <LabelList
                dataKey="count"
                position="right"
              />

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
}