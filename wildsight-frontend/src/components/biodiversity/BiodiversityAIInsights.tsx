import {
  Brain,
  Trees,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface Props {

  diversityScore?: number;

  habitatQuality?: number;

  ecosystemHealth?: number;

  status?: string;

}

export default function BiodiversityAIInsights({

  diversityScore = 0,

  habitatQuality = 0,

  ecosystemHealth = 0,

  status = "Unknown",

}: Props) {

  const biodiversity =
    diversityScore >= 80
      ? "Excellent biodiversity across monitored regions."
      : "Moderate biodiversity. Increase species monitoring.";

  const habitat =
    habitatQuality >= 80
      ? "Habitat quality supports sustainable wildlife."
      : "Habitat restoration is recommended.";

  const ecosystem =
    ecosystemHealth >= 80
      ? "Ecosystem remains stable and resilient."
      : "Environmental stress detected.";

  const recommendation =
    status === "Healthy"
      ? "Continue current conservation strategy."
      : "Increase habitat restoration and ecological monitoring.";

  return (

    <div className="space-y-6">

      <div className="flex items-center gap-3">

        <div className="rounded-2xl bg-green-100 p-3">
          <Brain className="text-green-600" />
        </div>

        <div>

          <h2 className="text-3xl font-bold">
            AI Biodiversity Insights
          </h2>

          <p className="text-gray-500">
            AI generated ecological intelligence
          </p>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Biodiversity */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all">

          <div className="mb-4 flex items-center gap-3">

            <TrendingUp className="text-green-600" />

            <h3 className="text-xl font-bold">
              Biodiversity Status
            </h3>

          </div>

          <p className="text-gray-600">
            {biodiversity}
          </p>

          <div className="mt-5">

            <div className="flex justify-between">

              <span>Score</span>

              <b>{diversityScore.toFixed(1)}%</b>

            </div>

            <div className="mt-2 h-3 rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-green-600"
                style={{
                  width: `${diversityScore}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Habitat */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all">

          <div className="mb-4 flex items-center gap-3">

            <Trees className="text-blue-600" />

            <h3 className="text-xl font-bold">
              Habitat Assessment
            </h3>

          </div>

          <p className="text-gray-600">
            {habitat}
          </p>

          <div className="mt-5">

            <div className="flex justify-between">

              <span>Quality</span>

              <b>{habitatQuality.toFixed(1)}%</b>

            </div>

            <div className="mt-2 h-3 rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-blue-600"
                style={{
                  width: `${habitatQuality}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Ecosystem */}

        <div className="rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">

          <div className="mb-4 flex items-center gap-3">

            <Sparkles />

            <h3 className="text-xl font-bold">
              AI Observation
            </h3>

          </div>

          <p>{ecosystem}</p>

          <h1 className="mt-6 text-5xl font-bold">
            {ecosystemHealth.toFixed(1)}
          </h1>

          <span>Ecosystem Score</span>

        </div>

        {/* Recommendation */}

        <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">

          <div className="mb-4 flex items-center gap-3">

            <ShieldCheck />

            <h3 className="text-xl font-bold">
              Conservation Strategy
            </h3>

          </div>

          <p>{recommendation}</p>

          <div className="mt-6 inline-block rounded-full bg-white/20 px-4 py-2">
            {status}
          </div>

        </div>

      </div>

    </div>

  );

}