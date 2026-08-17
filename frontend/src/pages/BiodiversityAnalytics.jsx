import React, { useEffect, useState } from "react";
import api from "../api";

import {
  Download,
  RefreshCcw,
  Leaf,
  ClipboardList,
  PawPrint,
  Trees,
  Activity,
} from "lucide-react";

export default function BiodiversityAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const habitatData = [
  {
    name: "Healthy Habitat",
    value: 82,
    color: "bg-green-600",
  },
  {
    name: "Moderate Habitat",
    value: 14,
    color: "bg-yellow-500",
  },
  {
    name: "Critical Habitat",
    value: 4,
    color: "bg-red-500",
  },
  ];
  const loadAnalytics = async () => {
  try {
    const res = await api.get("/analytics/dashboard");
    console.log("Analytics:", res.data);

    setAnalytics(res.data);
  } catch (err) {
    console.error("Error loading analytics:", err);
  } finally {
    setLoading(false);
  }
  };
  useEffect(() => {
  loadAnalytics();
  }, []);
  if (loading) {
  return (
    <div className="flex justify-center items-center h-screen text-xl font-semibold">
      Loading Biodiversity Analytics...
    </div>
  );
  }
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">

          <div className="flex items-center gap-5">

            <div className="bg-white/20 p-4 rounded-2xl">

              <Leaf size={42} />

            </div>

            <div>

              <h1 className="text-4xl font-bold">

                Biodiversity Analytics

              </h1>

              <p className="text-green-100 mt-2">

                AI-powered biodiversity intelligence and ecosystem monitoring

              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <button className="bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition flex items-center gap-2">

              <RefreshCcw size={18} />

              Refresh

            </button>

            <button className="bg-green-900 px-5 py-3 rounded-xl font-semibold hover:bg-green-950 transition flex items-center gap-2">

              <Download size={18} />

              Export Report

            </button>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="max-w-7xl mx-auto p-8">

        {/* KPI cards will be added here */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard
            title="Total Observations"
            value={analytics?.total_observations ?? 0}
            subtitle="Wildlife records"
            icon={<ClipboardList size={30} />}
            color="green"
          />

          <StatCard
            title="Species Identified"
            value={analytics?.species_count ?? 0}
            subtitle="Unique species"
            icon={<PawPrint size={30} />}
            color="blue"
          />

          <StatCard
            title="Animals Observed"
            value={analytics?.animal_count ?? 0}
            subtitle="Total count"
            icon={<Trees size={30} />}
            color="emerald"
          />

          <StatCard
            title="Biodiversity Score"
            value={`${analytics?.biodiversity_score ?? 0}%`}
            subtitle="AI ecosystem health"
            icon={<Activity size={30} />}
            color="orange"
          />

        </div>
        <div className="mt-10 bg-white rounded-3xl shadow-lg p-8">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h2 className="text-2xl font-bold text-gray-800">

                🐾 Species Distribution

              </h2>

              <p className="text-gray-500 mt-1">

                Distribution of detected wildlife species

              </p>

            </div>

          </div>

          <div className="space-y-6">

            {analytics?.species_distribution?.map((item, index) => {

              const colors = [
                  "bg-green-600",
                  "bg-blue-600",
                  "bg-orange-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-yellow-500",
              ];

              return (
                  <SpeciesBar
                      key={item.name}
                      name={item.name}
                      value={item.percentage}
                      color={colors[index % colors.length]}
                  />
              );
            

            })}
            

          </div>
        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8">

          {/* Habitat Health */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-2xl font-bold text-gray-800 mb-2">

                🌿 Habitat Health

              </h2>

              <p className="text-gray-500 mb-8">

                AI evaluation of monitored habitats

              </p>

              <div className="space-y-6">

                {habitatData.map((item) => (

                  <SpeciesBar
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    color={item.color}
                  />

              ))}

            </div>

          </div>

          {/* Ecosystem Status */}

          <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-center">

            <div className="text-center">

              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">

                  <Leaf size={55} className="text-green-700" />

              </div>

              <h2 className="text-3xl font-bold text-gray-800">

                  Healthy Ecosystem

              </h2>

              <p className="text-gray-500 mt-3">

                  Overall Habitat Score

              </p>

              <div className="text-6xl font-bold text-green-700 mt-6">
                  91

              </div>

              <div className="text-gray-500">

                  /100

              </div>

            </div>

          </div>

        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8">

          {/* AI Insights */}

          <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-2xl font-bold text-gray-800 mb-2">

                  🧠 Recent AI Insights

              </h2>

              <p className="text-gray-500 mb-8">

                  Latest intelligence generated from AI wildlife analysis

              </p>

              <div className="space-y-5">

                  <InsightCard
                      title="Tiger activity increased in Bandhavgarh National Park"
                      status="High Confidence"
                      color="green"
                  />

                  <InsightCard
                      title="Habitat quality improving after recent rainfall"
                      status="Verified"
                      color="blue"
                  />

                  <InsightCard
                      title="New elephant movement detected near water source"
                      status="Monitoring"
                      color="orange"
                  />

                  <InsightCard
                      title="Overall biodiversity trend remains stable"
                      status="Completed"
                      color="emerald"
                  />

              </div>

          </div>

          {/* Protected Species */}

          <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-2xl font-bold text-gray-800 mb-2">

                  🛡 Protected Species

              </h2>

              <p className="text-gray-500 mb-8">

                  Species requiring continuous conservation monitoring

              </p>

              <div className="space-y-5">

                  <ProtectedSpecies
                      emoji="🐅"
                      name="Bengal Tiger"
                      status="Endangered"
                  />

                  <ProtectedSpecies
                      emoji="🐘"
                      name="Asian Elephant"
                      status="Endangered"
                  />

                  <ProtectedSpecies
                      emoji="🐆"
                      name="Indian Leopard"
                      status="Vulnerable"
                  />

                  <ProtectedSpecies
                      emoji="🦏"
                      name="Indian Rhinoceros"
                      status="Protected"
                  />

              </div>

          </div>

      </div>

      </div>

    </div>
  );
}
function StatCard({ title, value, subtitle, icon, color }) {
  const colors = {
    green: "from-green-500 to-green-700",
    blue: "from-blue-500 to-blue-700",
    emerald: "from-emerald-500 to-emerald-700",
    orange: "from-orange-500 to-orange-700",
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden">

      <div className={`h-2 bg-gradient-to-r ${colors[color]}`}></div>

      <div className="p-6">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-gray-500 text-sm">
              {title}
            </p>

            <h2 className="text-4xl font-bold mt-2 text-gray-800">
              {value}
            </h2>

            <p className="text-gray-400 mt-2 text-sm">
              {subtitle}
            </p>

          </div>

          <div className={`bg-gradient-to-r ${colors[color]} text-white p-4 rounded-2xl`}>
            {icon}
          </div>

        </div>

      </div>

    </div>
  );
}
function SpeciesBar({ name, value, color }) {
  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="font-medium text-gray-700">
          {name}
        </span>

        <span className="font-semibold text-gray-800">
          {value}%
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
            className={`${color} h-3 rounded-full transition-all duration-1000`}
            style={{ width: `${value}%` }}
        ></div>

      </div>
    </div>
  );
}
function InsightCard({ title, status, color }) {

    const badge = {
        green: "bg-green-100 text-green-700",
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
        emerald: "bg-emerald-100 text-emerald-700",
    };

    return (

        <div className="border rounded-2xl p-5 hover:shadow-md transition">

            <div className="flex justify-between items-start">

                <div>

                    <h3 className="font-semibold text-gray-800">

                        {title}

                    </h3>

                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge[color]}`}>

                    {status}

                </span>

            </div>

        </div>

    );

}
function ProtectedSpecies({ emoji, name, status }) {

    return (

        <div className="flex justify-between items-center border rounded-2xl p-5 hover:bg-gray-50 transition">

            <div className="flex items-center gap-4">

                <div className="text-4xl">

                    {emoji}

                </div>

                <div>

                    <h3 className="font-semibold text-gray-800">

                        {name}

                    </h3>

                </div>

            </div>

            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">

                {status}

            </span>

        </div>

    );

}