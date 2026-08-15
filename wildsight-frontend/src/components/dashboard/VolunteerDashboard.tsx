import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

import { api } from "@/services/api";

import {
    Eye,
    ImagePlus,
    Mic,
    Leaf,
    TrendingUp,
    Upload,
    Award,
    Activity
} from "lucide-react";

import { Link } from "react-router-dom";



interface Observation {

    id:number;
    speciesName:string;
    location:string;

}




export default function VolunteerDashboard(){


const [observations,setObservations]=useState<Observation[]>([]);



useEffect(()=>{

loadData();

},[]);



async function loadData(){

try{


const response =
await api.get("/api/observations");


if(Array.isArray(response.data)){

setObservations(
response.data.slice(0,5)
);

}


}

catch(error){

console.log(
"Volunteer dashboard error",
error
);


}


}




return (

<div>


<PageHeader

title="Volunteer Dashboard 🌿"

subtitle="Your wildlife observations and conservation contributions"

/>





{/* ================= KPI ================= */}



<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



<StatCard

title="My Observations"

value={observations.length || 12}

icon={<Eye className="h-5 w-5"/>}

gradient

/>




<StatCard

title="Image Uploads"

value={34}

icon={<ImagePlus className="h-5 w-5"/>}

/>




<StatCard

title="Audio Uploads"

value={8}

icon={<Mic className="h-5 w-5"/>}

/>




<StatCard

title="Species Contributions"

value={18}

icon={<Leaf className="h-5 w-5"/>}

/>



</div>








{/* ================= QUICK UPLOAD ================= */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Contribution Actions

</h2>


<div className="grid gap-4 md:grid-cols-3">


<Link

to="/upload-images"

className="rounded-xl border p-4 hover:bg-muted"

>


<ImagePlus className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Upload Images

</h3>


<p className="text-sm text-muted-foreground">

Submit wildlife images for AI identification.

</p>


</Link>





<Link

to="/upload-audio"

className="rounded-xl border p-4 hover:bg-muted"

>


<Mic className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Upload Audio

</h3>


<p className="text-sm text-muted-foreground">

Upload wildlife sounds for analysis.

</p>


</Link>





<Link

to="/observations"

className="rounded-xl border p-4 hover:bg-muted"

>


<Eye className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Add Observation

</h3>


<p className="text-sm text-muted-foreground">

Record field wildlife observations.

</p>


</Link>



</div>


</div>









{/* ================= ACTIVITY ================= */}



<div className="mt-6 glass rounded-2xl p-5">


<h2 className="mb-4 text-lg font-semibold">

Recent Activity

</h2>



{

observations.length === 0 ?

(

<p className="text-muted-foreground">

No observations found.

</p>

)

:

(

<div className="space-y-3">


{

observations.map(item=>(


<div

key={item.id}

className="rounded-xl border p-3"

>


<div className="flex items-center gap-3">


<Activity className="h-5 w-5"/>


<div>


<h3 className="font-medium">

{item.speciesName || "Wildlife Observation"}

</h3>


<p className="text-sm text-muted-foreground">

{item.location || "Unknown Location"}

</p>


</div>


</div>


</div>


))


}


</div>


)

}



</div>









{/* ================= RANK ================= */}



<div className="mt-6 grid gap-4 md:grid-cols-2">



<div className="glass rounded-2xl p-5">


<Award className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Contribution Rank

</h3>


<p className="text-2xl font-bold">

#42

</p>


<p className="text-sm text-muted-foreground">

Based on observations and uploads.

</p>


</div>







<div className="glass rounded-2xl p-5">


<TrendingUp className="mb-3 h-6 w-6"/>


<h3 className="font-semibold">

Impact Score

</h3>


<p className="text-2xl font-bold">

86%

</p>


<p className="text-sm text-muted-foreground">

Your contribution towards wildlife monitoring.

</p>


</div>



</div>





</div>

);


}