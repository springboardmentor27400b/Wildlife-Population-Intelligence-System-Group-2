import { useEffect, useState } from "react";

import PopulationCard from "../components/population/PopulationCard";
import PopulationTrendChart from "../components/population/PopulationTrendChart";
import PopulationDistributionChart from "../components/population/PopulationDistributionChart";
import MigrationPanel from "../components/population/MigrationPanel";
import PopulationHeatmap from "../components/population/PopulationHeatMap";
import AIInsights from "../components/population/AIInsights";

import {
  getPopulationDashboard,
  getPopulationTrend,
  getPopulationDistribution,
  getMigrationAnalysis,
} from "../services/PopulationService";

import {
  PopulationDashboard,
  PopulationTrend,
  PopulationDistribution,
  Migration,
} from "../types/population";

import {
  Users,
  TrendingUp,
  MapPinned,
  Globe,
  PawPrint,
} from "lucide-react";


function PopulationIntelligence() {


  const [dashboard, setDashboard] =
    useState<PopulationDashboard | null>(null);


  const [trend, setTrend] =
    useState<PopulationTrend[]>([]);


  const [distribution, setDistribution] =
    useState<PopulationDistribution[]>([]);


  const [migration, setMigration] =
    useState<Migration[]>([]);



  useEffect(() => {

    loadPopulationData();

  }, []);



  const loadPopulationData = async () => {

    try {

      const dashboardData =
        await getPopulationDashboard();


      const trendData =
        await getPopulationTrend();


      const distributionData =
        await getPopulationDistribution();


      const migrationData =
        await getMigrationAnalysis();



      setDashboard(dashboardData);

      setTrend(trendData);

      setDistribution(distributionData);

      setMigration(migrationData);


    }
    catch(error){

      console.error(
        "Population data loading failed",
        error
      );

    }

  };



  return (

    <div
      className="
      min-h-screen
      bg-slate-50
      p-8
      space-y-8
      "
    >


      {/* HEADER */}

      <div>

        <h1
          className="
          text-4xl
          font-bold
          "
        >

          Population Intelligence 📊

        </h1>


        <p
          className="
          mt-2
          text-gray-500
          "
        >

          AI-powered wildlife population estimation,
          migration analysis and species distribution.

        </p>


      </div>




      {/* KPI CARDS */}


      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-5
        gap-6
        "
      >


        <PopulationCard

          title="Population"

          value={dashboard?.totalPopulation ?? 0}

          icon={<Users size={24}/>}

          color="bg-green-600"

        />



        <PopulationCard

          title="Species Richness"

          value={dashboard?.speciesRichness ?? 0}

          icon={<PawPrint size={24}/>}

          color="bg-orange-500"

        />



        <PopulationCard

          title="Population Density"

          value={dashboard?.populationDensity ?? 0}

          icon={<Globe size={24}/>}

          color="bg-blue-600"

        />



        <PopulationCard

          title="Growth Rate"

          value={`${dashboard?.growthRate ?? 0}%`}

          icon={<TrendingUp size={24}/>}

          color="bg-emerald-600"

        />



        <PopulationCard

          title="Monitoring Sites"

          value={dashboard?.monitoringSites ?? 0}

          icon={<MapPinned size={24}/>}

          color="bg-purple-600"

        />


      </div>





      {/* CHART SECTION */}


      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
        "
      >


        <PopulationTrendChart

          data={trend}

        />



        <PopulationDistributionChart

          data={distribution}

        />


      </div>






      {/* MIGRATION */}


      <MigrationPanel

        data={migration}

      />







      {/* AI INSIGHTS */}


      <AIInsights

        totalPopulation={
          dashboard?.totalPopulation ?? 0
        }

        growthRate={
          dashboard?.growthRate ?? 0
        }

        speciesRichness={
          dashboard?.speciesRichness ?? 0
        }

        monitoringSites={
          dashboard?.monitoringSites ?? 0
        }

      />







      {/* HEATMAP */}


      <PopulationHeatmap />




    </div>

  );

}



export default PopulationIntelligence;