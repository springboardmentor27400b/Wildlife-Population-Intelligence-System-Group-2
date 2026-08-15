import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface Props {
  data: {
    averageDegradationLevel: number;
    lowRiskHabitats: number;
    moderateRiskHabitats: number;
    highRiskHabitats: number;
    criticalHabitats: number;
    overallStatus: string;
  };
}

export default function HabitatDegradationPanel({ data }: Props) {

  const level = Math.min(
    data.averageDegradationLevel,
    100
  );

  const total =
    data.lowRiskHabitats +
    data.moderateRiskHabitats +
    data.highRiskHabitats +
    data.criticalHabitats;

  const percentage = (value: number): number => {

    if (total === 0) return 0;

    return Math.round((value / total) * 100);

  };

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
          bg-red-100
          p-3
          rounded-2xl
          "
        >

          <AlertTriangle className="text-red-600" />

        </div>

        <div>

          <h2 className="text-2xl font-bold">

            Habitat Degradation

          </h2>

          <p className="text-gray-500 text-sm">

            AI degradation assessment

          </p>

        </div>

      </div>

      {/* Average */}

      <div className="mb-6">

        <div className="flex justify-between">

          <span className="text-gray-500">

            Average Degradation

          </span>

          <span className="font-bold">

            {level.toFixed(1)}%

          </span>

        </div>

        <div
          className="
          w-full
          h-4
          bg-gray-200
          rounded-full
          mt-3
          overflow-hidden
          "
        >

          <div
            style={{
              width: `${level}%`,
            }}
            className="
            h-full
            bg-red-500
            rounded-full
            transition-all
            duration-700
            "
          />

        </div>

      </div>

      {/* Risk Cards */}

      <div className="space-y-4">

        <RiskBar
          title="Low Risk"
          value={data.lowRiskHabitats}
          percent={percentage(data.lowRiskHabitats)}
          color="bg-green-600"
        />

        <RiskBar
          title="Moderate Risk"
          value={data.moderateRiskHabitats}
          percent={percentage(data.moderateRiskHabitats)}
          color="bg-yellow-500"
        />

        <RiskBar
          title="High Risk"
          value={data.highRiskHabitats}
          percent={percentage(data.highRiskHabitats)}
          color="bg-orange-500"
        />

        <RiskBar
          title="Critical"
          value={data.criticalHabitats}
          percent={percentage(data.criticalHabitats)}
          color="bg-red-600"
        />

      </div>

      {/* Status */}

      <div
        className="
        mt-6
        rounded-2xl
        border
        bg-red-50
        border-red-100
        p-5
        "
      >

        <div
          className="
          flex
          items-center
          gap-2
          mb-2
          "
        >

          {

            data.overallStatus === "Low Risk"

              ?

              <ShieldCheck className="text-green-600" />

              :

              <ShieldAlert className="text-red-600" />

          }

          <h3 className="font-semibold">

            Overall Status

          </h3>

        </div>

        <p className="text-gray-700">

          {data.overallStatus}

        </p>

      </div>

    </div>

  );

}

interface RiskProps {

  title: string;

  value: number;

  percent: number;

  color: string;

}

function RiskBar({

  title,

  value,

  percent,

  color,

}: RiskProps) {

  return (

    <div>

      <div
        className="
        flex
        justify-between
        mb-1
        "
      >

        <span>

          {title}

        </span>

        <span className="font-semibold">

          {value}

        </span>

      </div>

      <div
        className="
        h-3
        bg-gray-200
        rounded-full
        overflow-hidden
        "
      >

        <div
          style={{
            width: `${percent}%`,
          }}
          className={`
            ${color}
            h-full
            rounded-full
            transition-all
            duration-700
          `}
        />

      </div>

    </div>

  );

}