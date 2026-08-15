import { api } from "@/services/api";
import type { Detection, ImageAIResult } from "@/components/ai/AIResult";


/* ================= IMAGE ================= */


interface RawDetection {

  species: string;

  confidence: number;

  boundingBox?: number[];

  animalId?: string;

  existingAnimal?: boolean;

  similarity?: number;


  behavior?: string;

  possibleBehaviors?: string[];


  endangered?: boolean;

  speciesStatus?: string;

  category?: string;

  protectionLevel?: string;


  scientificName?: string;

  kingdom?: string;

  phylum?: string;

  className?: string;

  order?: string;

  family?: string;

  genus?: string;

}



function normalizeDetections(
  data: RawDetection[]
): Detection[] {


  return data.map((item)=>({


    species:item.species,


    confidence:item.confidence,


    bbox:item.boundingBox as
    [
      number,
      number,
      number,
      number
    ],


    animalId:item.animalId,


    existingAnimal:item.existingAnimal,


    similarity:item.similarity,


    behavior:item.behavior,


    possibleBehaviors:item.possibleBehaviors,


    endangered:item.endangered,


    speciesStatus:item.speciesStatus,


    category:item.category,


    protectionLevel:item.protectionLevel,


    scientificName:item.scientificName,


    kingdom:item.kingdom,


    phylum:item.phylum,


    className:item.className,


    order:item.order,


    family:item.family,


    genus:item.genus


  }));

}




export async function analyzeImage(

file:File,

originalUrl:string

):Promise<ImageAIResult>{


const formData=new FormData();


formData.append(
"file",
file
);


formData.append(
"observationId",
"1"
);



const storedUser =
localStorage.getItem(
"wildsight_user"
);



let uploadedBy="1";



if(storedUser){

const user=JSON.parse(
storedUser
);


uploadedBy =
String(
user.userId ??
user.id ??
1
);

}



formData.append(
"uploadedBy",
uploadedBy
);



formData.append(
"capturedAt",
new Date().toISOString()
);



formData.append(
"imageQuality",
"90"
);



const start =
performance.now();



const {data}=await api.post(

"/api/uploaded-images/upload",

formData,

{

headers:{

"Content-Type":
"multipart/form-data"

}

}

);



return {


originalUrl,


annotatedUrl:
data.annotatedImage,


detections:
normalizeDetections(
data.detections || []
),


processingTimeMs:

Math.round(
performance.now()-start
),


model:

data.model ||
"YOLO + MobileNetV2"

};


}




/* ================= AUDIO ================= */



export interface AudioAIResult {


audioUrl:string;


species:string;


speciesCode?:string;


scientificName?:string;


confidence:number;


category?:string;


soundType?:string;


conservationStatus?:string;


environmentNoise?:string;


noiseFiltered?:boolean;


detectedAt:string;


status:
"recognized" |
"no_match";


model:string;

kingdom?: string;

phylum?: string;

className?: string;

order?: string;

family?: string;

genus?: string;


}



export async function analyzeAudio(

  file: File,

  audioUrl: string

): Promise<AudioAIResult> {


  const formData = new FormData();


  // audio file
  formData.append(
    "file",
    file
  );



  // observation id
  formData.append(
    "observationId",
    "1"
  );



  // get logged-in user
  const storedUser =
    localStorage.getItem(
      "wildsight_user"
    );



  let uploadedBy = "1";



  if (storedUser) {


    try {

      const user =
        JSON.parse(storedUser);


      uploadedBy =
        String(
          user.userId ??
          user.id ??
          1
        );


    } catch {

      uploadedBy = "1";

    }

  }



  formData.append(
    "uploadedBy",
    uploadedBy
  );



  formData.append(
    "capturedAt",
    new Date().toISOString()
  );



  formData.append(
    "durationSeconds",
    "10"
  );



  try {


    const { data } = await api.post(

      "/api/uploaded-audio/upload",

      formData,

      {

        headers: {

          "Content-Type":
          "multipart/form-data"

        }

      }

    );



    return {

 audioUrl,


 species:
 data.species ||
 data.predictedSpecies ||
 data.commonName ||
 "Unknown",


 speciesCode:
 data.speciesCode ||
 data.code ||
 undefined,


 scientificName:
 data.scientificName ||
 undefined,

kingdom:
data.kingdom,

phylum:
data.phylum,

className:
data.className,

order:
data.order,

family:
data.family,

genus:
data.genus,

 confidence:
 Number(
 data.confidence ??
 data.score ??
 0
 ),


 category:
 data.category ||
 "Bird",


 soundType:
 data.soundType ||
 "Bird Call",


 conservationStatus:
 data.conservationStatus ||
 "Unknown",


 environmentNoise:
 data.environmentNoise ||
 "Unknown",


 noiseFiltered:
 data.noiseFiltered ??
 false,


 detectedAt:
 new Date().toISOString(),


 status:
 data.status === "FAILED"
 ? "no_match"
 : "recognized",


 model:
 data.model ||
 "BirdNET Analyzer"

};

  } catch (error) {

    console.error(
      "Error analyzing audio:",
      error
    );

    throw error;

  }

}