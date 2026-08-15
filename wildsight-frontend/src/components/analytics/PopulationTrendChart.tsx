import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart
} from "recharts";

const data = [
  { month: "Jan", detections: 8 },
  { month: "Feb", detections: 14 },
  { month: "Mar", detections: 11 },
  { month: "Apr", detections: 18 },
  { month: "May", detections: 25 },
  { month: "Jun", detections: 22 },
  { month: "Jul", detections: 30 },
];

export default function PopulationTrendChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">

      <h2 className="text-xl font-bold mb-1">
        📈 Population Trend
      </h2>

      <p className="text-gray-500 text-sm mb-5">
        Wildlife detections over the last 7 months
      </p>

      <ResponsiveContainer width="100%" height={350}>

        <ComposedChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Area
            type="monotone"
            dataKey="detections"
            fill="#bbf7d0"
            stroke="none"
            fillOpacity={0.4}
          />

          <Line
            type="monotone"
            dataKey="detections"
            stroke="#16a34a"
            strokeWidth={4}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />

        </ComposedChart>

      </ResponsiveContainer>

    </div>
  );
}