import { useEffect, useState } from "react";

import {
  Users,
  PawPrint,
  MapPin,
  ShieldAlert,
  Activity,
  Leaf,
  FileText
} from "lucide-react";

import { motion } from "framer-motion";

import { api } from "@/services/api";

import { StatCard } from "@/components/StatCard";



interface UserAnalytics {

  totalUsers:number;
  admins:number;
  researchers:number;
  forestOfficers:number;
  volunteers:number;

}


interface PopulationAnalytics {

  totalPopulation:number;
  speciesRichness:number;
  populationDensity:number;
  growthRate:number;
  monitoringSites:number;

}


interface BiodiversityAnalytics {

  totalAssessments:number;
  totalSpecies:number;
  averageSpeciesDiversity:number;
  averageHabitatQuality:number;
  averageEcosystemHealth:number;
  averageOverallScore:number;
  healthyCount:number;
  vulnerableCount:number;
  criticalCount:number;

}



interface ThreatAnalytics {

  totalLocations:number;
  highRisk:number;
  moderateRisk:number;
  lowRisk:number;
  averageHealthScore:number;
  criticalArea:string;

}




export default function AdminAnalytics(){



const [users,setUsers]=useState<UserAnalytics | null>(null);

const [population,setPopulation]=
useState<PopulationAnalytics | null>(null);


const [biodiversity,setBiodiversity]=
useState<BiodiversityAnalytics | null>(null);


const [threat,setThreat]=
useState<ThreatAnalytics | null>(null);



useEffect(()=>{

loadAnalytics();

},[]);





const loadAnalytics = async()=>{


try{


// ================= USER =================

const usersResponse =
await api.get("/api/dashboard/users");


console.log(
"USER ANALYTICS",
usersResponse.data
);



setUsers(
usersResponse.data
);




// ================= POPULATION =================


const populationResponse =
await api.get("/api/dashboard/population");


console.log(
"POPULATION ANALYTICS",
populationResponse.data
);



setPopulation(
populationResponse.data
);





// ================= BIODIVERSITY =================


const biodiversityResponse =
await api.get("/api/dashboard/biodiversity");


console.log(
"BIODIVERSITY ANALYTICS",
biodiversityResponse.data
);



setBiodiversity(
biodiversityResponse.data
);







// ================= THREAT =================
// separate because this API currently returns 500


try{


const threatResponse =
await api.get("/api/dashboard/threat");


console.log(
"THREAT ANALYTICS",
threatResponse.data
);



setThreat(
threatResponse.data
);



}

catch(error){

console.log(
"Threat API failed",
error
);


}





}


catch(error){


console.log(
"Admin dashboard loading failed",
error
);


}



};






return (

<div className="mt-8 space-y-8">





{/* ================= PLATFORM ANALYTICS ================= */}



<div>


<h2 className="text-xl font-bold mb-4 flex items-center gap-2">


<Activity className="h-5 w-5 text-primary"/>


Platform Analytics


</h2>





<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



<StatCard

title="Total Users"

value={
users?.totalUsers ?? 0
}

icon={
<Users className="h-5 w-5"/>
}

gradient

/>




<StatCard

title="Total Population"

value={
population?.totalPopulation ?? 0
}

icon={
<PawPrint className="h-5 w-5"/>
}

/>






<StatCard

title="Monitoring Sites"

value={
population?.monitoringSites ?? 0
}

icon={
<MapPin className="h-5 w-5"/>
}

/>





<StatCard

title="Species Recorded"

value={
biodiversity?.totalSpecies ?? 0
}

icon={
<Leaf className="h-5 w-5"/>
}

/>





</div>


</div>









{/* ================= BIODIVERSITY ================= */}



<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
glass
rounded-2xl
p-5
"

>



<h2 className="
font-display
text-lg
font-semibold
mb-5
">

Biodiversity Intelligence

</h2>





<div className="grid md:grid-cols-4 gap-5">


<div>

<p className="text-sm text-muted-foreground">

Biodiversity Score

</p>


<h3 className="text-3xl font-bold">

{
biodiversity?.averageOverallScore ?? 0
}%

</h3>


</div>




<div>

<p className="text-sm text-muted-foreground">

Healthy Areas

</p>


<h3 className="text-3xl font-bold">

{
biodiversity?.healthyCount ?? 0
}

</h3>


</div>





<div>

<p className="text-sm text-muted-foreground">

Vulnerable

</p>


<h3 className="text-3xl font-bold">

{
biodiversity?.vulnerableCount ?? 0
}

</h3>


</div>





<div>

<p className="text-sm text-muted-foreground">

Critical

</p>


<h3 className="text-3xl font-bold">

{
biodiversity?.criticalCount ?? 0
}

</h3>


</div>



</div>



</motion.div>









{/* ================= THREAT ================= */}



<motion.div

className="
glass
rounded-2xl
p-5
"

>



<h2 className="
font-display
text-lg
font-semibold
mb-5
flex
gap-2
">


<ShieldAlert
className="text-red-500"
/>


Threat Monitoring


</h2>





<div className="
grid
md:grid-cols-4
gap-5
">



<div>

<p>

High Risk Areas

</p>


<h2 className="
text-3xl
font-bold
text-red-600
">

{
threat?.highRisk ?? 0
}

</h2>


</div>





<div>

<p>

Moderate Risk

</p>


<h2 className="text-3xl font-bold">

{
threat?.moderateRisk ?? 0
}

</h2>


</div>





<div>

<p>

Low Risk

</p>


<h2 className="
text-3xl
font-bold
text-green-600
">

{
threat?.lowRisk ?? 0
}

</h2>


</div>





<div>

<p>

Average Health

</p>


<h2 className="text-3xl font-bold">

{
threat?.averageHealthScore ?? 0
}%

</h2>


</div>




</div>





<div className="
mt-5
p-4
rounded-xl
bg-red-50
">


<p className="text-sm">

Critical Area

</p>


<h3 className="font-bold">

{
threat?.criticalArea ??
"No Critical Area"
}

</h3>


</div>




</motion.div>










{/* ================= REPORT GENERATION ================= */}



<motion.div

className="
glass
rounded-2xl
p-5
"

>



<h2 className="
font-display
text-lg
font-semibold
flex
gap-2
">


<FileText
className="text-primary"
/>


Report Generation


</h2>




<p className="
text-muted-foreground
mt-2
">


Generate biodiversity, population and conservation reports.


</p>




<div className="
grid
md:grid-cols-3
gap-4
mt-5
">


<button className="
rounded-xl
border
p-4
hover:bg-muted
">

Biodiversity Report

</button>



<button className="
rounded-xl
border
p-4
hover:bg-muted
">

Population Report

</button>



<button className="
rounded-xl
border
p-4
hover:bg-muted
">

Conservation Report

</button>



</div>




</motion.div>







</div>

);



}