import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";

interface Props {
  data: any[];
}

const COLORS = [
  "#16a34a",
  "#22c55e",
  "#84cc16",
  "#65a30d",
  "#0f766e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

export default function SpeciesPieChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-3xl shadow-lg border p-6">

      <h2 className="text-xl font-bold mb-5">
        🐾 Species Distribution
      </h2>

      <div className="h-[380px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="count"
              nameKey="species"
              innerRadius={85}
              outerRadius={130}
              paddingAngle={5}
              cornerRadius={10}
              animationDuration={1800}
              animationBegin={100}
              label={({ species, percent }) =>
                `${species} ${(percent! * 100).toFixed(0)}%`
              }
            >

              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

              <Label
                position="center"
                content={() => (
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                  >
                    <tspan
                      x="50%"
                      dy="-10"
                      fontSize="32"
                    >
                      🐾
                    </tspan>

                    <tspan
                      x="50%"
                      dy="35"
                      fontSize="34"
                      fontWeight="bold"
                    >
                      {total}
                    </tspan>

                    <tspan
                      x="50%"
                      dy="24"
                      fontSize="15"
                      fill="#777"
                    >
                      Species
                    </tspan>

                  </text>
                )}
              />

            </Pie>

            <Tooltip
              formatter={(value: any) => [
                `${value} detections`,
                "Count",
              ]}
            />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}