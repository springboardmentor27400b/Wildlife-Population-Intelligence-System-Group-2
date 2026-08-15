import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

import { api } from "@/services/api";

import {
    MapPin,
    ShieldAlert,
    Activity,
    Navigation,
    TreePine,
    PawPrint,
    Route,
    FileWarning
} from "lucide-react";



interface MapLocation {

    id:number;
    name:string;
    state:string;
    threatLevel:string;
    population:number;
    speciesCount:number;

}



interface PopulationData {

    totalPopulation:number;
    monitoringSites:number;

}



export default function ForestOfficerDashboard(){


const [locations,setLocations]=useState<MapLocation[]>([]);

const [population,setPopulation]=useState<PopulationData|null>(null);



useEffect(()=>{

loadData();

},[]);



async function loadData(){

try{


const map =
await api.get("/api/dashboard/map");


const pop =
await api.get("/api/dashboard/population");



setLocations(map.data);

setPopulation(pop.data);



}
catch(error){

console.log(
"Forest dashboard error",
error
);

}

}





const highThreat =
locations.filter(
l=>l.threatLevel==="HIGH"
).length;



const totalProtectedAreas =
locations.length;



const wildlifeMovement =
locations.reduce(
(sum,item)=>
sum + (item.population || 0),
0
);




return(

<div>


<PageHeader

title="Forest Department Dashboard 🌳"

subtitle="Protected area monitoring, wildlife movement and field operations"

/>





{/* KPI CARDS */}

<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



<StatCard

title="Protected Areas"

value={totalProtectedAreas}

icon={<MapPin className="h-5 w-5"/>}

gradient

/>



<StatCard

title="Threat Areas"

value={highThreat}

icon={<ShieldAlert className="h-5 w-5"/>}

/>



<StatCard

title="Wildlife Population"

value={population?.totalPopulation || 0}

icon={<PawPrint className="h-5 w-5"/>}

/>



<StatCard

title="Monitoring Sites"

value={population?.monitoringSites || 0}

icon={<Navigation className="h-5 w-5"/>}

/>



</div>





{/* PROTECTED AREA MONITORING */}


<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Protected Area Monitoring

</h2>


<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">


{
locations.slice(0,6)
.map(location=>(


<div

key={location.id}

className="rounded-xl border border-border p-4"

>


<div className="flex justify-between">


<h3 className="font-semibold">

{location.name}

</h3>


<span className={

location.threatLevel==="HIGH"

?
"text-red-500"

:
"text-green-500"

}>

{location.threatLevel}

</span>


</div>



<p className="text-sm text-muted-foreground">

{location.state}

</p>


<div className="mt-3 text-sm">


Species:
<b>
{" "}
{location.speciesCount}
</b>

<br/>


Population:
<b>
{" "}
{location.population}
</b>


</div>



</div>


))

}



</div>


</div>







{/* FIELD OPERATIONS */}



<div className="mt-6 grid gap-4 lg:grid-cols-3">



<div className="glass rounded-2xl p-5">


<Route className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Patrol Planning

</h3>


<p className="text-sm text-muted-foreground">

AI assisted patrol route optimization coming soon.

</p>


</div>






<div className="glass rounded-2xl p-5">


<Activity className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Wildlife Movement Analysis

</h3>


<p className="text-sm text-muted-foreground">

Movement patterns generated from monitoring data.

</p>


</div>






<div className="glass rounded-2xl p-5">


<FileWarning className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Incident Reports

</h3>


<p className="text-sm text-muted-foreground">

Human-wildlife conflicts and field incidents.

</p>


</div>



</div>





{/* SUMMARY */}


<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-3 font-semibold">

Forest Intelligence Summary

</h2>


<div className="flex items-center gap-3">


<TreePine className="h-6 w-6"/>


<p>

Monitoring {totalProtectedAreas} protected areas with {wildlifeMovement} recorded wildlife population.

</p>


</div>


</div>



</div>


);


}