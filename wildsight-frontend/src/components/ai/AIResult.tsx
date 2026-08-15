import { motion } from "framer-motion";
import { CheckCircle2, Cpu, Timer, ImageIcon } from "lucide-react";

export interface Detection {
  id?: string | number;
  species: string;
  
  confidence: number;
  bbox?: [number, number, number, number];
  thumbnail?: string;
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
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
}

export interface ImageAIResult {
  originalUrl: string;
  annotatedUrl?: string;
  detections: Detection[];
  processingTimeMs?: number;
  model?: string;
}



function ConfidenceBar({ value }: { value: number }) {
  const pct = value > 1 ? Math.round(value) : Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-primary"/>
      </div>
      <span className="text-xs font-semibold">{pct}%</span>
    </div>
  );
}

export function AIResult({ result }: { result: ImageAIResult }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="glass rounded-3xl p-5">
        <CheckCircle2 className="inline text-success"/> <b>Detection Complete</b>
        <span className="ml-4"><Cpu className="inline h-4 w-4"/> {result.model}</span>
        <span className="ml-4"><Timer className="inline h-4 w-4"/> {result.processingTimeMs} ms</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <img src={result.originalUrl} className="w-full max-h-96 object-contain" />
        {result.annotatedUrl ?
          <img src={result.annotatedUrl} className="w-full max-h-96 object-contain"/> :
          <div className="glass rounded-xl flex items-center justify-center">No annotated image</div>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.detections.map((d,i)=>(
          <div key={i} className="glass rounded-xl p-4">
            <ImageIcon className="mb-2"/>
            <h3 className="font-bold text-lg">{d.species}</h3>
            <p><b>Animal ID:</b> {d.animalId ?? "Not Identified"}</p>
            <p><b>Status:</b> {d.existingAnimal ? "Existing Animal" : "New Animal"}</p>
            <p><b>Similarity:</b> {d.similarity ?? 0}%</p>
            <hr className="my-2"/>
            <p><b>Behavior:</b> {d.behavior ?? "-"}</p>
            <p><b>Possible:</b> {d.possibleBehaviors?.join(", ") ?? "-"}</p>
            <p><b>Category:</b> {d.category ?? "-"}</p>
            <p><b>Species Status:</b> {d.speciesStatus ?? "-"}</p>
            <p><b>Protection:</b> {d.protectionLevel ?? "-"}</p>
            <p><b>Endangered:</b> {d.endangered ? "🔴 Yes" : "🟢 No"}</p>
            <hr className="my-2"/>

<h4 className="font-bold text-primary">
🧬 Taxonomical Classification
</h4>

<p><b>Scientific Name:</b> {d.scientificName}</p>

<p><b>Kingdom:</b> {d.kingdom}</p>

<p><b>Phylum:</b> {d.phylum}</p>

<p><b>Class:</b> {d.class}</p>

<p><b>Order:</b> {d.order}</p>

<p><b>Family:</b> {d.family}</p>

<p><b>Genus:</b> {d.genus}</p>
            <div className="mt-3"><ConfidenceBar value={d.confidence}/></div>
            <p className="text-xs mt-2">BBox: {d.bbox ? `[${d.bbox.join(", ")}]` : "-"}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead>
<tr>

<th>#</th>

<th>Species</th>

<th>Scientific Name</th>

<th>Animal ID</th>

<th>Behavior</th>

<th>Status</th>

<th>Family</th>

<th>Genus</th>

<th>Confidence</th>

</tr>
</thead>
          <tbody>
            {result.detections.map((d,i)=>(
             <tr key={i}>

<td>{i+1}</td>

<td>{d.species}</td>

<td>{d.scientificName}</td>

<td>{d.animalId}</td>

<td>{d.behavior}</td>

<td>{d.speciesStatus}</td>

<td>{d.family}</td>

<td>{d.genus}</td>

<td>
<ConfidenceBar value={d.confidence}/>
</td>

</tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
