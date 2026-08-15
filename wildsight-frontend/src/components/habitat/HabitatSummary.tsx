import {
  Trees,
  Leaf,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface Props {

  totalHabitats:number;

  quality:number;

  suitability:number;

  healthy:number;

}

export default function HabitatSummary({

  totalHabitats,
  quality,
  suitability,
  healthy

}:Props){

  return(

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      <SummaryCard
        title="Habitats"
        value={totalHabitats}
        icon={<Trees className="text-green-600"/>}
      />

      <SummaryCard
        title="Quality"
        value={`${quality.toFixed(1)}%`}
        icon={<Leaf className="text-blue-600"/>}
      />

      <SummaryCard
        title="Suitability"
        value={`${suitability.toFixed(1)}%`}
        icon={<TrendingUp className="text-purple-600"/>}
      />

      <SummaryCard
        title="Healthy"
        value={healthy}
        icon={<ShieldCheck className="text-emerald-600"/>}
      />

    </div>

  );

}

interface CardProps{

  title:string;

  value:number|string;

  icon:React.ReactNode;

}

function SummaryCard({

  title,
  value,
  icon

}:CardProps){

  return(

    <div className="bg-white rounded-3xl shadow-sm border p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500">

            {title}

          </p>

          <h2 className="text-3xl font-bold mt-2">

            {value}

          </h2>

        </div>

        <div className="bg-green-50 p-4 rounded-2xl">

          {icon}

        </div>

      </div>

    </div>

  );

}