import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  PieChart as PieChartIcon,
  Map,
} from "lucide-react";

interface Props {

  data:{

    forestHabitats:number;

    grasslandHabitats:number;

    wetlandHabitats:number;

    mountainHabitats:number;

    riverHabitats:number;

    dominantHabitat:string;

    totalHabitats:number;

  };

}

const COLORS=[

  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4"

];

export default function HabitatClassificationChart({

  data

}:Props){

  const chartData=[

    {
      name:"Forest",
      value:data.forestHabitats
    },

    {
      name:"Grassland",
      value:data.grasslandHabitats
    },

    {
      name:"Wetland",
      value:data.wetlandHabitats
    },

    {
      name:"Mountain",
      value:data.mountainHabitats
    },

    {
      name:"River",
      value:data.riverHabitats
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
      justify-between
      items-center
      mb-6
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
          className="
          bg-green-100
          p-3
          rounded-2xl
          "
          >

            <PieChartIcon
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

              Habitat Classification

            </h2>

            <p
            className="
            text-sm
            text-gray-500
            "
            >

              Distribution of monitored habitats

            </p>

          </div>

        </div>

      </div>

      {/* Pie Chart */}

      <ResponsiveContainer
      width="100%"
      height={320}
      >

        <PieChart>

          <Pie

            data={chartData}

            dataKey="value"

            nameKey="name"

            cx="50%"

            cy="50%"

            outerRadius={110}

            innerRadius={55}

            paddingAngle={4}

            label

          >

            {

              chartData.map((_,index)=>(

                <Cell

                  key={index}

                  fill={
                    COLORS[index]
                  }

                />

              ))

            }

          </Pie>

          <Tooltip/>

          <Legend/>

        </PieChart>

      </ResponsiveContainer>

      {/* Summary */}

      <div
      className="
      grid
      grid-cols-2
      gap-4
      mt-6
      "
      >

        <div
        className="
        bg-green-50
        rounded-2xl
        p-5
        "
        >

          <p
          className="
          text-sm
          text-gray-500
          "
          >

            Total Habitats

          </p>

          <h3
          className="
          text-3xl
          font-bold
          text-green-700
          "
          >

            {data.totalHabitats}

          </h3>

        </div>

        <div
        className="
        bg-blue-50
        rounded-2xl
        p-5
        "
        >

          <div
          className="
          flex
          items-center
          gap-2
          "
          >

            <Map
            className="
            text-blue-600
            "
            size={20}
            />

            <span
            className="
            text-sm
            text-gray-500
            "
            >

              Dominant Habitat

            </span>

          </div>

          <h3
          className="
          text-2xl
          font-bold
          text-blue-700
          mt-2
          "
          >

            {data.dominantHabitat}

          </h3>

        </div>

      </div>

    </div>

  );

}