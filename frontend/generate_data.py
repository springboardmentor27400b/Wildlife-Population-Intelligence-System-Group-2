import json
import random
from datetime import datetime, timedelta

forests = [
    ("Tadoba Tiger Reserve",20.214,79.360),
    ("Pench Tiger Reserve",21.690,79.280),
    ("Melghat Tiger Reserve",21.410,77.140),
    ("Nagzira Wildlife Sanctuary",21.280,80.120),
    ("Navegaon National Park",20.930,80.110),
    ("Koyna Wildlife Sanctuary",17.400,73.750),
    ("Bhimashankar Wildlife Sanctuary",19.070,73.550),
    ("Chandoli National Park",17.100,73.850),
    ("Radhanagari Wildlife Sanctuary",16.410,73.980),
    ("Sanjay Gandhi National Park",19.230,72.910)
]

species_data = {
    "Tiger":{"status":"Endangered","min":15,"max":35},
    "Leopard":{"status":"Healthy","min":20,"max":60},
    "Sloth Bear":{"status":"Monitoring","min":15,"max":40},
    "Indian Gaur":{"status":"Healthy","min":30,"max":80},
    "Sambar Deer":{"status":"Healthy","min":60,"max":150},
    "Chital":{"status":"Healthy","min":80,"max":180},
    "Wild Dog":{"status":"Monitoring","min":10,"max":35},
    "Wild Boar":{"status":"Healthy","min":40,"max":120},
    "Langur":{"status":"Healthy","min":50,"max":140},
    "Peacock":{"status":"Healthy","min":70,"max":200}
}

records=[]

camera_id=1

for forest_name,lat,lng in forests:

    animals=random.sample(list(species_data.keys()),10)

    for animal in animals:

        if len(records)==100:
            break

        info=species_data[animal]

        records.append({

            "id":len(records)+1,

            "cameraId":f"CAM-{camera_id:03}",

            "forest":forest_name,

            "species":animal,

            "population":random.randint(info["min"],info["max"]),

            "health":random.randint(70,99),

            "status":info["status"],

            "confidence":round(random.uniform(90,99.8),2),

            "detectionType":random.choice([
                "YOLO Image",
                "AI Audio"
            ]),

            "disease":"No Disease",

            "latitude":round(lat+random.uniform(-0.02,0.02),6),

            "longitude":round(lng+random.uniform(-0.02,0.02),6),

            "date":(
                datetime.now()-
                timedelta(days=random.randint(0,30))
            ).strftime("%Y-%m-%d")

        })

        camera_id+=1

with open(
    "public/data/wildlife_data.json",
    "w"
) as f:

    json.dump(records,f,indent=4)

print("100 AI Wildlife Records Generated Successfully")