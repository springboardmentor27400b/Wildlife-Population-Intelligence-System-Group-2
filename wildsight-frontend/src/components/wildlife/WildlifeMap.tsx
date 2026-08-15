import {
MapContainer,
TileLayer,
Marker,
Popup
} from "react-leaflet";

import L from "leaflet";


import "leaflet/dist/leaflet.css";
import "@/config/leaflet";


import type { WildlifeLocation } from "@/types/wildlife";

import LocationPopup from "./LocationPopup";

const greenIcon =
new L.Icon({

iconUrl:
"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

shadowUrl:
"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

iconSize:[25,41],

iconAnchor:[12,41],

popupAnchor:[1,-34]

});


const yellowIcon =
new L.Icon({

iconUrl:
"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",

shadowUrl:
"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

iconSize:[25,41],

iconAnchor:[12,41],

popupAnchor:[1,-34]

});


const redIcon =
new L.Icon({

iconUrl:
"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

shadowUrl:
"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

iconSize:[25,41],

iconAnchor:[12,41],

popupAnchor:[1,-34]

});

interface Props {

    locations: WildlifeLocation[];

}



export default function WildlifeMap(
{
    locations
}:Props
){
const getMarkerIcon=(health:number)=>{


if(health>=75)
return greenIcon;


if(health>=50)
return yellowIcon;


return redIcon;


};

return (

<MapContainer

center={[22.9734,78.6569]}

zoom={5}

style={{
    height:"600px",
    width:"100%"
}}

>


<TileLayer

url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

/>



{
locations.map(
(location)=>(

<Marker

key={location.id}

position={[
location.latitude,
location.longitude
]}

icon={
getMarkerIcon(
location.healthScore
)
}

>


<Popup>

<LocationPopup
location={location}
/>

</Popup>


</Marker>

)

)
}



</MapContainer>


);

}