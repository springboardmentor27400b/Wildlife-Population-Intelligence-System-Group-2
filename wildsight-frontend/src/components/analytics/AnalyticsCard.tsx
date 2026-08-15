import { ReactNode } from "react";


interface Props{

title:string;

value:number;

icon:ReactNode;

color:string;

}



export default function AnalyticsCard({
title,
value,
icon,
color
}:Props){


return (

<div
className="
bg-white
rounded-2xl
border
shadow-sm
p-6
hover:shadow-lg
transition
"
>


<div
className="
flex
justify-between
items-center
"
>


<div>


<p className="
text-sm
text-gray-500
">

{title}

</p>


<h2
className="
text-4xl
font-bold
mt-2
text-gray-900
">

{value}

</h2>


</div>



<div
className={`
w-14
h-14
rounded-2xl
flex
items-center
justify-center
text-white
${color}
`}
>

{icon}

</div>



</div>


</div>


)

}