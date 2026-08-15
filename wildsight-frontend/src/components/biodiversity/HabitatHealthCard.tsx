import {
  Trees,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface Props {
  averageQuality?: number;
  healthyCount?: number;
  vulnerableCount?: number;
  criticalCount?: number;
}

export default function HabitatHealthCard({
  averageQuality = 0,
  healthyCount = 0,
  vulnerableCount = 0,
  criticalCount = 0,
}: Props) {

  const progress = Math.min(Math.round(averageQuality), 100);

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

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-green-100 p-3 rounded-2xl">
          <Trees className="text-green-600 w-6 h-6" />
        </div>

        <div>

          <h2 className="text-2xl font-bold">
            Habitat Health
          </h2>

          <p className="text-sm text-gray-500">
            AI habitat quality assessment
          </p>

        </div>

      </div>

      {/* Progress */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">

          <span className="font-medium">
            Habitat Quality Score
          </span>

          <span className="font-bold text-green-700">
            {averageQuality.toFixed(1)}%
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">

          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* Cards */}

      <div className="space-y-4">

        <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-green-600" />

            <span className="font-medium">
              Healthy Habitats
            </span>

          </div>

          <span className="text-xl font-bold text-green-700">
            {healthyCount}
          </span>

        </div>

        <div className="flex items-center justify-between rounded-xl bg-yellow-50 p-4">

          <div className="flex items-center gap-3">

            <AlertTriangle className="text-yellow-600" />

            <span className="font-medium">
              Vulnerable
            </span>

          </div>

          <span className="text-xl font-bold text-yellow-700">
            {vulnerableCount}
          </span>

        </div>

        <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">

          <div className="flex items-center gap-3">

            <Activity className="text-red-600" />

            <span className="font-medium">
              Critical
            </span>

          </div>

          <span className="text-xl font-bold text-red-700">
            {criticalCount}
          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 p-5 text-white">

        <p className="text-sm opacity-90">
          AI Habitat Rating
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          {averageQuality.toFixed(1)}%
        </h2>

        <p className="mt-2 text-sm opacity-90">
          Habitat conditions are suitable for sustaining biodiversity.
        </p>

      </div>

    </div>
  );

}