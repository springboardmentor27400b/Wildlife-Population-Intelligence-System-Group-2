import {
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 Tooltip,
 Legend
} from "recharts";


interface Props{

 data:any[];

}



const COLORS=[
 "#22c55e",
 "#eab308",
 "#f97316",
 "#ef4444"
];



export default function ConservationStatusChart({
data
}:Props){


return(

<div className="
bg-white
rounded-2xl
border
shadow-sm
p-6
">


<h2 className="text-xl font-bold mb-5">

🛡️ Conservation Status

</h2>



<ResponsiveContainer
width="100%"
height={320}
>


<PieChart>


<Pie

data={data}

dataKey="count"

nameKey="status"

cx="50%"

cy="50%"

outerRadius={100}

innerRadius={55}

paddingAngle={5}

label


>


{
data.map((_,index)=>(

<Cell

key={index}

fill={COLORS[index % COLORS.length]}

/>

))
}


</Pie>



<Tooltip/>

<Legend/>


</PieChart>


</ResponsiveContainer>


</div>


);


}