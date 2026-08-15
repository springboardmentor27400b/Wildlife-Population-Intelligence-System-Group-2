import {
  HeartPulse,
  Activity,
  Leaf,
  ShieldCheck,
} from "lucide-react";

interface Props {

  ecosystemHealth:number;

  overallScore:number;

  status:string;

}

export default function EcosystemHealthGauge({

  ecosystemHealth,

  overallScore,

  status

}:Props){

  const safeHealth = ecosystemHealth ?? 0;
const safeOverall = overallScore ?? 0;

const percentage =
    Math.min(Math.round(safeHealth),100);

  const circumference = 2 * Math.PI * 90;

  const offset =
    circumference -
    (percentage / 100) * circumference;

  const statusColor = () => {

    if(status==="Healthy")
      return "text-green-600";

    if(status==="Moderate Concern")
      return "text-yellow-600";

    if(status==="Vulnerable")
      return "text-orange-600";

    return "text-red-600";

  };

  return (

    <div
      className="
      bg-white
      rounded-3xl
      shadow-sm
      border
      p-8
      hover:shadow-xl
      transition-all
      "
    >

      {/* Header */}

      <div className="flex items-center gap-3 mb-8">

        <div className="bg-green-100 p-3 rounded-2xl">

          <HeartPulse className="text-green-600"/>

        </div>

        <div>

          <h2 className="text-2xl font-bold">

            Ecosystem Health Monitoring

          </h2>

          <p className="text-gray-500">

            AI generated ecosystem assessment

          </p>

        </div>

      </div>

      <div className="grid xl:grid-cols-2 gap-10">

        {/* Circular Gauge */}

        <div className="flex justify-center">

          <div className="relative w-64 h-64">

            <svg
              className="w-full h-full rotate-[-90deg]"
            >

              <circle
                cx="128"
                cy="128"
                r="90"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="18"
              />

              <circle
                cx="128"
                cy="128"
                r="90"
                fill="none"
                stroke="#16A34A"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />

            </svg>

            <div
              className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              "
            >

              <Activity
                className="text-green-600 w-8 h-8"
              />

              <h1 className="text-5xl font-bold mt-2">

                {safeHealth.toFixed(1)}

              </h1>

              <span className="text-gray-500">

                /100

              </span>

            </div>

          </div>

        </div>

        {/* Metrics */}

        <div className="space-y-5">

          <div className="bg-green-50 rounded-2xl p-5">

            <div className="flex justify-between">

              <span>Overall Biodiversity</span>

              <b>{safeOverall.toFixed(2)}</b>

            </div>

            <div className="mt-3 h-3 rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-green-600"
                style={{
                  width:`${safeOverall}%`
                }}
              />

            </div>

          </div>

          <div className="bg-blue-50 rounded-2xl p-5">

            <div className="flex items-center gap-3">

              <Leaf className="text-blue-600"/>

              <div>

                <h3 className="font-semibold">

                  Ecosystem Status

                </h3>

                <p
                  className={statusColor()}
                >

                  {status}

                </p>

              </div>

            </div>

          </div>

          <div
            className="
            bg-gradient-to-r
            from-green-600
            to-emerald-700
            rounded-2xl
            p-6
            text-white
            "
          >

            <div className="flex items-center gap-3">

              <ShieldCheck/>

              <div>

                <h3 className="text-xl font-bold">

                  AI Recommendation

                </h3>

                <p className="mt-2 text-sm">

                  Ecosystem health is currently stable.
                  Continue biodiversity monitoring,
                  maintain habitat quality and perform
                  monthly conservation surveys.

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}