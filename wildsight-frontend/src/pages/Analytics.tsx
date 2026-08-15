import { useEffect, useState } from "react";

import {
  getDashboardSummary,
  getSpeciesDistribution,
  getCategoryDistribution,
  getConservationStatus
} from "../services/analyticsService";

import AnalyticsCard from "../components/analytics/AnalyticsCard";
import SpeciesPieChart from "../components/analytics/SpeciesPieChart";
import CategoryBarChart from "../components/analytics/CategoryBarChart";
import PopulationTrendChart from "../components/analytics/PopulationTrendChart";
import ConservationStatusChart from "../components/analytics/ConservationStatusChart";
import TopSpecies from "../components/analytics/TopSpecies";
import AIInsights from "../components/analytics/AIInsights";

import {
  Camera,
  Mic,
  PawPrint,
  MapPinned,
  Bird,
  Rabbit,
  Bug,
  Fish,
  TriangleAlert,
  Download
} from "lucide-react";

function Analytics() {

  const [dashboard, setDashboard] = useState<any>(null);
  const [species, setSpecies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [conservation, setConservation] = useState<any[]>([]);

  useEffect(() => {

    getDashboardSummary()
      .then(res => setDashboard(res.data))
      .catch(console.error);

    getSpeciesDistribution()
      .then(res => setSpecies(res.data));

    getCategoryDistribution()
      .then(res => setCategories(res.data));

    getConservationStatus()
      .then(res => setConservation(res.data));

  }, []);

  return (

    <div className="p-8 space-y-10 bg-[#f7faf7] min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold text-gray-900">
            Wildlife Analytics Dashboard 🐾
          </h1>

          <p className="text-gray-500 mt-2">
            AI-powered biodiversity insights and wildlife statistics
          </p>

        </div>

        <button
          className="
          flex
          items-center
          gap-2
          bg-green-600
          hover:bg-green-700
          text-white
          px-5
          py-3
          rounded-xl
          shadow
          transition
          "
        >

          <Download size={18} />

          Export Report

        </button>

      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <AnalyticsCard
          title="Observations"
          value={dashboard?.totalObservations ?? 0}
          icon={<MapPinned size={25} />}
          color="bg-green-600"
        />

        <AnalyticsCard
          title="Images"
          value={dashboard?.totalImages ?? 0}
          icon={<Camera size={25} />}
          color="bg-blue-600"
        />

        <AnalyticsCard
          title="Audio"
          value={dashboard?.totalAudio ?? 0}
          icon={<Mic size={25} />}
          color="bg-purple-600"
        />

        <AnalyticsCard
          title="Species"
          value={dashboard?.totalSpecies ?? 0}
          icon={<PawPrint size={25} />}
          color="bg-orange-500"
        />

      </div>

      {/* CATEGORY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

        <AnalyticsCard
          title="Birds"
          value={dashboard?.birdDetections ?? 0}
          icon={<Bird size={25} />}
          color="bg-sky-500"
        />

        <AnalyticsCard
          title="Mammals"
          value={dashboard?.mammalDetections ?? 0}
          icon={<Rabbit size={25} />}
          color="bg-emerald-600"
        />

        <AnalyticsCard
          title="Reptiles"
          value={dashboard?.reptileDetections ?? 0}
          icon={<Fish size={25} />}
          color="bg-teal-600"
        />

        <AnalyticsCard
          title="Insects"
          value={dashboard?.insectDetections ?? 0}
          icon={<Bug size={25} />}
          color="bg-yellow-500"
        />

        <AnalyticsCard
          title="Endangered"
          value={dashboard?.endangeredSpecies ?? 0}
          icon={<TriangleAlert size={25} />}
          color="bg-red-600"
        />

      </div>

      {/* PIE + BAR */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <SpeciesPieChart data={species} />

        <CategoryBarChart data={categories} />

      </div>

      {/* LINE + CONSERVATION */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <PopulationTrendChart />

        <ConservationStatusChart
          data={conservation}
        />

      </div>

      {/* TOP SPECIES + AI */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <TopSpecies
          data={species}
        />

        <AIInsights
          dashboard={dashboard}
          species={species}
          categories={categories}
        />

      </div>

    </div>

  );

}

export default Analytics;