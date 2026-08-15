import { Brain, TrendingUp, Trees, Sparkles } from "lucide-react";

interface AIInsightsProps {
  totalPopulation: number;
  growthRate: number;
  speciesRichness: number;
  monitoringSites: number;
}

export default function AIInsights({
  totalPopulation,
  growthRate,
  speciesRichness,
  monitoringSites,
}: AIInsightsProps) {
  const populationStatus =
    growthRate >= 5
      ? "Wildlife population is growing steadily across monitored regions."
      : growthRate >= 0
      ? "Population remains stable with moderate growth."
      : "Population decline detected. Additional monitoring is recommended.";

  const habitatCondition =
    speciesRichness >= 50
      ? "Habitat quality is healthy with high biodiversity."
      : "Habitat diversity is moderate. Conservation measures are advised.";

  const observation =
    monitoringSites >= 20
      ? "Monitoring network provides strong ecological coverage across protected areas."
      : "Expand monitoring stations to improve wildlife surveillance.";

  const recommendation =
    growthRate < 0
      ? "Increase conservation efforts, restore habitats, and intensify wildlife monitoring."
      : "Continue periodic surveys and strengthen monitoring around migration corridors.";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-7 h-7 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            AI Population Insights
          </h2>
          <p className="text-sm text-gray-500">
            AI-generated analysis based on current population statistics.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Population Status */}
        <div className="flex gap-4">
          <div className="bg-blue-100 p-3 rounded-full h-fit">
            <TrendingUp className="text-blue-600 w-6 h-6" />
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              Population Status
            </h3>

            <p className="text-gray-600 mt-1">
              {populationStatus}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Current Population : <b>{totalPopulation.toLocaleString()}</b>
            </p>

            <p className="text-sm text-gray-500">
              Growth Rate : <b>{growthRate}%</b>
            </p>
          </div>
        </div>

        {/* Habitat Condition */}
        <div className="flex gap-4">
          <div className="bg-green-100 p-3 rounded-full h-fit">
            <Trees className="text-green-600 w-6 h-6" />
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              Habitat Condition
            </h3>

            <p className="text-gray-600 mt-1">
              {habitatCondition}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Species Richness : <b>{speciesRichness}</b>
            </p>

            <p className="text-sm text-gray-500">
              Active Monitoring Sites : <b>{monitoringSites}</b>
            </p>
          </div>
        </div>

        {/* AI Observation */}
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-600 w-5 h-5" />

            <h3 className="font-semibold text-gray-800">
              AI Observation
            </h3>
          </div>

          <p className="text-gray-700">
            {observation}
          </p>
        </div>

        {/* Recommendation */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-700 mb-2">
            Conservation Recommendation
          </h3>

          <p className="text-gray-700">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}