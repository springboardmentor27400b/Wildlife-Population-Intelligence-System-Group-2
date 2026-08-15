import {
BrainCircuit,
Leaf,
TriangleAlert,
Activity
}
from "lucide-react";

interface Props{

dashboard:any;
species:any[];
categories:any[];

}

export default function AIInsights({

dashboard,
species,
categories

}:Props){

const topSpecies=

species.length
?
[...species].sort((a,b)=>b.count-a.count)[0]
:null;

const topCategory=

categories.length
?
[...categories].sort((a,b)=>b.count-a.count)[0]
:null;

return(

<div
className="
rounded-3xl
p-8
bg-gradient-to-r
from-green-700
to-emerald-500
text-white
shadow-xl
"
>

<div className="flex items-center gap-3 mb-8">

<BrainCircuit size={34}/>

<h2 className="text-2xl font-bold">

AI Wildlife Insights

</h2>

</div>

<div className="grid md:grid-cols-4 gap-8">

<div>

<div className="flex items-center gap-2 mb-2">

<Leaf/>

<h3 className="font-semibold">

Most Species

</h3>

</div>

<p className="text-2xl font-bold capitalize">

{topSpecies?.species||"-"}

</p>

</div>

<div>

<div className="flex items-center gap-2 mb-2">

<Activity/>

<h3>

Total Species

</h3>

</div>

<p className="text-2xl font-bold">

{dashboard?.totalSpecies}

</p>

</div>

<div>

<div className="flex items-center gap-2 mb-2">

🦁

<h3>

Detection Category

</h3>

</div>

<p className="text-2xl font-bold">

{topCategory?.category}

</p>

</div>

<div>

<div className="flex items-center gap-2 mb-2">

<TriangleAlert/>

<h3>

Endangered

</h3>

</div>

<p className="text-2xl font-bold">

{dashboard?.endangeredSpecies}

</p>

</div>

</div>

</div>

);

}

