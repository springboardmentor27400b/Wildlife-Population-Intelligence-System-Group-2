import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

import { api } from "@/services/api";

import {
    AlertTriangle,
    ShieldCheck,
    Leaf,
    TrendingUp,
    TreePine,
    Activity,
    Siren,
    Target
} from "lucide-react";



interface LocationData {

    id:number;
    name:string;
    state:string;
    threatLevel:string;
    population:number;
    speciesCount:number;
    healthScore:number;

}



interface BiodiversityData {

    averageOverallScore:number;
    healthyCount:number;
    vulnerableCount:number;
    criticalCount:number;

}




export default function ConservationOfficerDashboard(){


const [locations,setLocations]=useState<LocationData[]>([]);

const [biodiversity,setBiodiversity]=useState<BiodiversityData|null>(null);



useEffect(()=>{

loadDashboard();

},[]);



async function loadDashboard(){


try{


const locationResponse =
await api.get("/api/dashboard/map");


const biodiversityResponse =
await api.get("/api/dashboard/biodiversity");



setLocations(
locationResponse.data
);


setBiodiversity(
biodiversityResponse.data
);



}

catch(error){

console.log(
"Conservation dashboard error",
error
);

}


}




const highRiskAreas =
locations.filter(
item=>item.threatLevel==="HIGH"
).length;



const moderateRiskAreas =
locations.filter(
item=>item.threatLevel==="MODERATE"
).length;



const healthyAreas =
locations.filter(
item=>item.threatLevel==="LOW"
).length;




return(

<div>


<PageHeader

title="Conservation Officer Dashboard 🛡️"

subtitle="Threat monitoring, conservation priorities and restoration intelligence"

/>





{/* ================= KPI ================= */}



<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


<StatCard

title="High Risk Areas"

value={highRiskAreas}

icon={<AlertTriangle className="h-5 w-5"/>}

gradient

/>



<StatCard

title="Moderate Risk Areas"

value={moderateRiskAreas}

icon={<Activity className="h-5 w-5"/>}

/>



<StatCard

title="Healthy Ecosystems"

value={healthyAreas}

icon={<ShieldCheck className="h-5 w-5"/>}

/>



<StatCard

title="Biodiversity Score"

value={
biodiversity?.averageOverallScore?.toFixed(2) || 0
}

icon={<Leaf className="h-5 w-5"/>}

/>



</div>







{/* ================= THREAT MONITORING ================= */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Threat Monitoring

</h2>



<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">


{

locations

.filter(
l=>l.threatLevel!=="LOW"
)

.slice(0,9)

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
"text-yellow-500"

}>


{location.threatLevel}


</span>


</div>



<p className="text-sm text-muted-foreground">

{location.state}

</p>



<div className="mt-3 text-sm">


Health Score:

<b>

{" "}

{location.healthScore}

</b>


<br/>


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








{/* ================= CONSERVATION PRIORITIES ================= */}



<div className="mt-6 grid gap-4 lg:grid-cols-3">



<div className="glass rounded-2xl p-5">


<Siren className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Emergency Actions

</h3>


<p className="text-sm text-muted-foreground">

Prioritize high threat locations for immediate intervention.

</p>


</div>






<div className="glass rounded-2xl p-5">


<Target className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Conservation Priorities

</h3>


<p className="text-sm text-muted-foreground">

AI ranks areas based on biodiversity and habitat health.

</p>


</div>






<div className="glass rounded-2xl p-5">


<TreePine className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Restoration Recommendations

</h3>


<p className="text-sm text-muted-foreground">

Habitat restoration plans generated from ecosystem analysis.

</p>


</div>



</div>







{/* ================= SPECIES TREND ================= */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-3 text-lg font-semibold">

Species Trend Analysis

</h2>


<div className="flex items-center gap-3">


<TrendingUp className="h-6 w-6"/>


<p>

Tracking population changes and biodiversity patterns across protected areas.

</p>


</div>


</div>




</div>


);


}