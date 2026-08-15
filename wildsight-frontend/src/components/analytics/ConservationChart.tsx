import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
}
from "recharts";


export default function ConservationChart(){

const data=[

{
status:"Endangered",
count:5
},

{
status:"Vulnerable",
count:8
},

{
status:"Safe",
count:20
}

];


return (

<div className="bg-white rounded-xl shadow p-5">


<h2 className="font-bold text-xl mb-4">
Conservation Status
</h2>


<ResponsiveContainer width="100%" height={300}>


<BarChart data={data}>


<XAxis dataKey="status"/>

<YAxis/>

<Tooltip/>


<Bar dataKey="count"/>


</BarChart>


</ResponsiveContainer>


</div>

)

}