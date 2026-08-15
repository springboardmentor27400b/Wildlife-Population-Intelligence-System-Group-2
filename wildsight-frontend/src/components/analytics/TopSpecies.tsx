import {
    Trophy,
    Medal,
    Award
} from "lucide-react";

interface Props{
    data:any[];
}

export default function TopSpecies({data}:Props){

    const topSpecies=[...data]
        .sort((a,b)=>b.count-a.count)
        .slice(0,5);

    const medals=[
        <Trophy className="text-yellow-500" size={24}/>,
        <Medal className="text-gray-400" size={22}/>,
        <Award className="text-orange-500" size={22}/>
    ];

    return(

<div className="bg-white rounded-3xl shadow-lg border p-6">

<h2 className="text-xl font-bold mb-6">

🏆 Top Detected Species

</h2>

<div className="space-y-5">

{
topSpecies.map((item,index)=>(

<div
key={index}
className="flex items-center gap-5"
>

<div>

{
index<3
?medals[index]
:<div className="w-6 text-center font-bold">
{index+1}
</div>
}

</div>

<div className="flex-1">

<div className="flex justify-between mb-2">

<span className="font-semibold capitalize">

{item.species}

</span>

<span className="font-bold text-green-700">

{item.count}

</span>

</div>

<div className="h-3 rounded-full bg-gray-200 overflow-hidden">

<div
className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full"
style={{
width:`${(item.count/topSpecies[0].count)*100}%`
}}
/>

</div>

</div>

</div>

))
}

</div>

</div>

);

}