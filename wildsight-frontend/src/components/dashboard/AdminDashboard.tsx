import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

import { api } from "@/services/api";

import {
    Users,
    Activity,
    MapPin,
    Leaf,
    FileText,
    ShieldCheck,
    Database,
    BarChart3
} from "lucide-react";



interface Analytics {

    totalPopulation:number;
    monitoringSites:number;

}



interface Biodiversity {

    totalAssessments:number;
    totalSpecies:number;
    averageOverallScore:number;

}



interface Location {

    id:number;
    name:string;
    threatLevel:string;

}



export default function AdminDashboard(){


const [analytics,setAnalytics]=useState<Analytics|null>(null);

const [biodiversity,setBiodiversity]=useState<Biodiversity|null>(null);

const [locations,setLocations]=useState<Location[]>([]);

const [users,setUsers]=useState<number>(0);



useEffect(()=>{

loadDashboard();

},[]);



async function loadDashboard(){

try{


const population =
await api.get("/api/dashboard/population");


const bio =
await api.get("/api/dashboard/biodiversity");


const map =
await api.get("/api/dashboard/map");



setAnalytics(
population.data
);


setBiodiversity(
bio.data
);


setLocations(
map.data
);



try{

const userResponse =
await api.get("/api/users");


if(Array.isArray(userResponse.data)){

setUsers(
userResponse.data.length
);

}


}

catch{

setUsers(0);

}



}

catch(error){

console.log(
"Admin dashboard error",
error
);

}


}



const highThreat =
locations.filter(
l=>l.threatLevel==="HIGH"
).length;



return (

<div>


<PageHeader

title="Admin Dashboard ⚙️"

subtitle="Platform analytics, user management and monitoring system control"

/>




{/* MAIN ANALYTICS */}


<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


<StatCard

title="Total Users"

value={users}

icon={<Users className="h-5 w-5"/>}

gradient

/>



<StatCard

title="Total Population"

value={analytics?.totalPopulation || 0}

icon={<Activity className="h-5 w-5"/>}

/>



<StatCard

title="Monitoring Sites"

value={analytics?.monitoringSites || 0}

icon={<MapPin className="h-5 w-5"/>}

/>



<StatCard

title="Species Recorded"

value={biodiversity?.totalSpecies || 0}

icon={<Leaf className="h-5 w-5"/>}

/>


</div>







{/* PLATFORM ANALYTICS */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Platform Analytics

</h2>


<div className="grid gap-4 md:grid-cols-3">


<div className="rounded-xl border p-4">


<BarChart3 className="mb-2 h-6 w-6"/>


<h3 className="font-semibold">

Biodiversity Score

</h3>


<p>

{
biodiversity?.averageOverallScore?.toFixed(2)
||0
}

%

</p>


</div>





<div className="rounded-xl border p-4">


<Database className="mb-2 h-6 w-6"/>


<h3 className="font-semibold">

Wildlife Records

</h3>


<p>

{
biodiversity?.totalAssessments
||0
}

Assessments

</p>


</div>





<div className="rounded-xl border p-4">


<ShieldCheck className="mb-2 h-6 w-6"/>


<h3 className="font-semibold">

Threat Monitoring

</h3>


<p>

{highThreat}

High Risk Areas

</p>


</div>



</div>


</div>








{/* MONITORING MANAGEMENT */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Monitoring System Management

</h2>


<div className="grid gap-3 md:grid-cols-3">


{

locations.slice(0,6)
.map(location=>(


<div

key={location.id}

className="rounded-xl border p-4"

>


<h3 className="font-semibold">

{location.name}

</h3>


<p className="text-sm">

Threat:

{" "}

<b>

{location.threatLevel}

</b>

</p>


</div>


))

}



</div>


</div>







{/* REPORT GENERATION */}



<div className="mt-6 glass rounded-2xl p-5">


<div className="flex items-center gap-3">


<FileText className="h-6 w-6"/>


<div>


<h2 className="font-semibold">

Report Generation

</h2>


<p className="text-sm text-muted-foreground">

Generate biodiversity, population and conservation reports.

</p>


</div>


</div>


</div>




</div>


);


}