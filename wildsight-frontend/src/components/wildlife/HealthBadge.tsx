interface Props{

score:number;

}


export default function HealthBadge(
{
score
}:Props
){


let status="Critical";


if(score>=75)
{
    status="Healthy";
}
else if(score>=50)
{
    status="Moderate";
}


return (

<span
className="
px-3
py-1
rounded-full
text-sm
font-semibold
"
>

{status}

</span>

);


}