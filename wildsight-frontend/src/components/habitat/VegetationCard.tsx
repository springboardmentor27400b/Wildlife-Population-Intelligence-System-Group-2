import {
  Trees,
  Leaf,
  Activity,
} from "lucide-react";

interface Props {

  data:{

    averageVegetationDensity:number;

    dominantVegetationType:string;

    vegetationStatus:string;

  };

}

export default function VegetationAnalysisCard({

  data

}:Props){

  const progress =
    Math.min(
      data.averageVegetationDensity,
      100
    );

  const statusColor =
    data.vegetationStatus === "Dense Vegetation"
      ? "bg-green-600"
      : data.vegetationStatus === "Moderate Vegetation"
      ? "bg-yellow-500"
      : data.vegetationStatus === "Sparse Vegetation"
      ? "bg-orange-500"
      : "bg-red-600";

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
          bg-green-100
          p-3
          rounded-2xl
          "
        >

          <Trees
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

            Vegetation Analysis

          </h2>

          <p
            className="
            text-gray-500
            text-sm
            "
          >

            AI vegetation density assessment

          </p>

        </div>

      </div>

      {/* Density */}

      <div
        className="
        mb-6
        "
      >

        <div
          className="
          flex
          justify-between
          "
        >

          <span
            className="
            text-gray-500
            "
          >

            Average Density

          </span>

          <span
            className="
            font-bold
            "
          >

            {progress.toFixed(1)}%

          </span>

        </div>

        <div
          className="
          mt-3
          w-full
          h-4
          bg-gray-200
          rounded-full
          overflow-hidden
          "
        >

          <div

            className="
            h-full
            bg-green-600
            rounded-full
            transition-all
            duration-500
            "

            style={{

              width:`${progress}%`

            }}

          />

        </div>

      </div>

      {/* Information Cards */}

      <div
        className="
        grid
        grid-cols-2
        gap-4
        "
      >

        <div
          className="
          bg-green-50
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

            <Leaf
              className="
              text-green-600
              "
              size={20}
            />

            <span
              className="
              text-gray-500
              text-sm
              "
            >

              Dominant Type

            </span>

          </div>

          <h3
            className="
            text-xl
            font-bold
            text-green-700
            mt-2
            "
          >

            {data.dominantVegetationType}

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

            <Activity
              className="
              text-blue-600
              "
              size={20}
            />

            <span
              className="
              text-gray-500
              text-sm
              "
            >

              Vegetation Status

            </span>

          </div>

          <span
            className={`
              inline-block
              mt-3
              px-4
              py-2
              rounded-full
              text-white
              text-sm
              font-semibold
              ${statusColor}
            `}
          >

            {data.vegetationStatus}

          </span>

        </div>

      </div>

      {/* AI Recommendation */}

      <div
        className="
        mt-6
        rounded-2xl
        bg-gradient-to-r
        from-green-50
        to-emerald-50
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

          🌿 AI Vegetation Insight

        </h3>

        <p
          className="
          text-gray-700
          leading-relaxed
          "
        >

          {progress >= 80
            ? "Dense vegetation provides excellent habitat conditions and supports rich biodiversity."
            : progress >= 60
            ? "Vegetation cover is healthy. Continue routine habitat monitoring."
            : progress >= 40
            ? "Vegetation density is declining. Habitat restoration is recommended."
            : "Critical vegetation loss detected. Immediate conservation measures are required."}

        </p>

      </div>

    </div>

  );

}