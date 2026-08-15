import {
  Brain,
  ShieldCheck,
  Trees,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface Props {
  quality: number;
  degradation: number;
  suitability: number;
  status: string;
}

export default function HabitatAIInsights({

  quality,
  degradation,
  suitability,
  status,

}: Props) {

  const qualityText =
    quality >= 85
      ? "Habitat quality is excellent across monitored regions."
      : quality >= 70
      ? "Habitat quality is good with minor restoration needs."
      : "Habitat quality requires restoration measures.";

  const degradationText =
    degradation < 25
      ? "Very low degradation detected."
      : degradation < 50
      ? "Moderate degradation detected."
      : "High degradation detected. Immediate conservation required.";

  const suitabilityText =
    suitability >= 80
      ? "Habitats are highly suitable for wildlife."
      : suitability >= 50
      ? "Habitats remain moderately suitable."
      : "Habitat suitability is currently poor.";

  return (

    <div className="bg-white rounded-3xl border shadow-sm p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <div className="p-3 rounded-2xl bg-green-100">

          <Brain className="text-green-600"/>

        </div>

        <div>

          <h2 className="text-2xl font-bold">

            AI Habitat Insights

          </h2>

          <p className="text-gray-500 text-sm">

            AI generated habitat intelligence

          </p>

        </div>

      </div>

      <div className="grid xl:grid-cols-2 gap-5">

        {/* Quality */}

        <div className="rounded-2xl border p-5">

          <div className="flex items-center gap-2 mb-3">

            <ShieldCheck className="text-green-600"/>

            <h3 className="font-semibold">

              Habitat Quality

            </h3>

          </div>

          <p className="text-gray-600">

            {qualityText}

          </p>

          <div className="mt-4">

            <div className="flex justify-between text-sm mb-2">

              <span>Quality</span>

              <span>{quality.toFixed(1)}%</span>

            </div>

            <div className="h-3 bg-gray-200 rounded-full">

              <div

                className="bg-green-600 h-full rounded-full"

                style={{
                  width: `${quality}%`
                }}

              />

            </div>

          </div>

        </div>

        {/* Degradation */}

        <div className="rounded-2xl border p-5">

          <div className="flex items-center gap-2 mb-3">

            <AlertTriangle className="text-orange-500"/>

            <h3 className="font-semibold">

              Degradation Analysis

            </h3>

          </div>

          <p className="text-gray-600">

            {degradationText}

          </p>

          <div className="mt-4">

            <div className="flex justify-between text-sm mb-2">

              <span>Degradation</span>

              <span>{degradation.toFixed(1)}%</span>

            </div>

            <div className="h-3 bg-gray-200 rounded-full">

              <div

                className="bg-red-500 h-full rounded-full"

                style={{
                  width: `${degradation}%`
                }}

              />

            </div>

          </div>

        </div>

        {/* Suitability */}

        <div className="rounded-2xl border p-5">

          <div className="flex items-center gap-2 mb-3">

            <Trees className="text-blue-600"/>

            <h3 className="font-semibold">

              Habitat Suitability

            </h3>

          </div>

          <p className="text-gray-600">

            {suitabilityText}

          </p>

          <div className="mt-4">

            <div className="flex justify-between text-sm mb-2">

              <span>Suitability</span>

              <span>{suitability.toFixed(1)}%</span>

            </div>

            <div className="h-3 bg-gray-200 rounded-full">

              <div

                className="bg-blue-600 h-full rounded-full"

                style={{
                  width: `${suitability}%`
                }}

              />

            </div>

          </div>

        </div>

        {/* Recommendation */}

        <div className="rounded-2xl bg-green-700 text-white p-5">

          <div className="flex items-center gap-2 mb-3">

            <Sparkles/>

            <h3 className="font-semibold">

              AI Recommendation

            </h3>

          </div>

          <p className="leading-7">

            {
              status === "Highly Suitable"
                ? "Maintain current conservation practices, continue biodiversity monitoring and periodic habitat assessments."
                : status === "Moderately Suitable"
                ? "Improve vegetation cover, restore degraded habitats and strengthen wildlife monitoring."
                : "Immediate ecological restoration, afforestation and environmental protection measures are recommended."
            }

          </p>

          <span className="inline-block mt-4 bg-white/20 px-3 py-1 rounded-full text-sm">

            {status}

          </span>

        </div>

      </div>

    </div>

  );

}