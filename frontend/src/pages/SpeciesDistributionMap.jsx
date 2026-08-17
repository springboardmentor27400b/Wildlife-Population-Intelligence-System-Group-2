import { useEffect, useState } from "react";
import api from "../api";

import {

MapContainer,

TileLayer,

Marker,

Popup

} from "react-leaflet";

function SpeciesDistributionMap(){

const [locations,setLocations]=useState([]);

const loadLocations=async()=>{

try{

const res=await api.get("/dashboard/species-map");

setLocations(res.data);

}

catch(err){

console.log(err);

}

}

useEffect(()=>{

loadLocations();

},[]);

return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-5">

Species Distribution Map

</h1>

<MapContainer

center={[16.5,80.6]}

zoom={7}

style={{

height:"600px",

width:"100%"

}}

>

<TileLayer

url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>

{

locations.map((item,index)=>(

<Marker

key={index}

position={[

item.latitude,

item.longitude

]}

>

<Popup>

<h3>{item.species}</h3>

<p>

Count : {item.count}

</p>

<p>

Location :

{item.location}

</p>

</Popup>

</Marker>

))

}

</MapContainer>

</div>

);

}

export default SpeciesDistributionMap;