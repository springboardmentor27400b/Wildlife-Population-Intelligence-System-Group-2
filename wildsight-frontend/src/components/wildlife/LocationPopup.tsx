import type { WildlifeLocation } from "@/types/wildlife";
import HealthBadge from "./HealthBadge";


interface Props{

location:WildlifeLocation;

}


export default function LocationPopup(
{
location
}:Props
){


return (

<div className="space-y-2">


<h2 className="font-bold text-lg">
{location.name}
</h2>


<p>
State :
{location.state}
</p>


<p>
Population :
{location.population}
</p>


<p>
Species :
{location.speciesCount}
</p>


<p>
Health Score :
{location.healthScore}
</p>


<HealthBadge 
score={location.healthScore}
/>


<p>
Threat :
{location.threatLevel}
</p>


<p className="text-sm">
{location.recommendation}
</p>


</div>

)

}