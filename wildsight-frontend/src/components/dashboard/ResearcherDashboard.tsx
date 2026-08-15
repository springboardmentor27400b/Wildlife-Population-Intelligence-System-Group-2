import { useEffect, useState } from "react";

import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/services/api";

import {
    Activity,
    Leaf,
    MapPin,
    TrendingUp,
    TreePine,
    ShieldCheck,
    Sprout
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";


interface PopulationData {

    totalPopulation:number;
    speciesRichness:number;
    populationDensity:number;
    growthRate:number;
    monitoringSites:number;

}


interface BiodiversityData {

    totalAssessments:number;
    totalSpecies:number;
    averageSpeciesDiversity:number;
    averageHabitatQuality:number;
    averageEcosystemHealth:number;
    averageOverallScore:number;

}


interface HabitatData {

    totalHabitats:number;
    averageHabitatQuality:number;
    averageSuitability:number;
    healthyHabitats:number;
    degradedHabitats:number;
    criticalHabitats:number;

}



export default function ResearcherDashboard(){


const [population,setPopulation]=useState<PopulationData | null>(null);

const [biodiversity,setBiodiversity]=useState<BiodiversityData | null>(null);

const [habitat,setHabitat]=useState<HabitatData | null>(null);



useEffect(()=>{

    loadDashboard();

},[]);



async function loadDashboard(){

    try{

        const pop =
        await api.get("/api/dashboard/population");


        const bio =
        await api.get("/api/dashboard/biodiversity");


        const hab =
        await api.get("/api/dashboard/habitat");



        setPopulation(pop.data);

        setBiodiversity(bio.data);

        setHabitat(hab.data);


    }
    catch(error){

        console.log(
            "Dashboard loading error",
            error
        );

    }

}




const chartData=[

{
name:"Species",
value:biodiversity?.totalSpecies || 0
},

{
name:"Assessments",
value:biodiversity?.totalAssessments || 0
},

{
name:"Habitats",
value:habitat?.totalHabitats || 0
}

];





return (

<div>


<PageHeader

title="Wildlife Researcher Dashboard 🌿"

subtitle="Species observations, population intelligence and biodiversity analytics"

/>



{/* ================= POPULATION ================= */}


<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


<StatCard

title="Total Population"

value={population?.totalPopulation || 0}

icon={<Activity className="h-5 w-5"/>}

gradient

/>


<StatCard

title="Species Richness"

value={population?.speciesRichness || 0}

icon={<Leaf className="h-5 w-5"/>}

/>


<StatCard

title="Population Growth"

value={`${population?.growthRate || 0}%`}

icon={<TrendingUp className="h-5 w-5"/>}

/>


<StatCard

title="Monitoring Sites"

value={population?.monitoringSites || 0}

icon={<MapPin className="h-5 w-5"/>}

/>


</div>





{/* ================= BIODIVERSITY ================= */}



<div className="mt-6">


<h2 className="mb-3 text-lg font-semibold">

Biodiversity Reports

</h2>


<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


<StatCard

title="Diversity Score"

value={
biodiversity?.averageSpeciesDiversity?.toFixed(2) || 0
}

icon={<Sprout className="h-5 w-5"/>}

gradient

/>



<StatCard

title="Habitat Quality"

value={
`${biodiversity?.averageHabitatQuality?.toFixed(2)||0}%`
}

icon={<TreePine className="h-5 w-5"/>}

/>



<StatCard

title="Ecosystem Health"

value={
`${biodiversity?.averageEcosystemHealth?.toFixed(2)||0}%`
}

icon={<ShieldCheck className="h-5 w-5"/>}

/>



<StatCard

title="Overall Score"

value={
`${biodiversity?.averageOverallScore?.toFixed(2)||0}%`
}

icon={<Activity className="h-5 w-5"/>}

/>


</div>

</div>





{/* ================= HABITAT ================= */}



<div className="mt-6">


<h2 className="mb-3 text-lg font-semibold">

Habitat Insights

</h2>



<div className="grid gap-4 sm:grid-cols-3">


<StatCard

title="Healthy Habitats"

value={habitat?.healthyHabitats || 0}

icon={<TreePine className="h-5 w-5"/>}

/>



<StatCard

title="Degraded Habitats"

value={habitat?.degradedHabitats || 0}

icon={<Activity className="h-5 w-5"/>}

/>



<StatCard

title="Critical Habitats"

value={habitat?.criticalHabitats || 0}

icon={<ShieldCheck className="h-5 w-5"/>}

/>


</div>


</div>





{/* ================= ANALYTICS CHART ================= */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Research Analytics Overview

</h2>



<div className="h-72">


<ResponsiveContainer width="100%" height="100%">


<BarChart data={chartData}>


<CartesianGrid strokeDasharray="3 3"/>


<XAxis dataKey="name"/>


<YAxis/>


<Tooltip/>


<Bar

dataKey="value"

fill="currentColor"

/>


</BarChart>


</ResponsiveContainer>


</div>


</div>




</div>

);


}