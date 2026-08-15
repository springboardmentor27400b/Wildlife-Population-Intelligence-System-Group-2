import { ArrowUpRight } from "lucide-react";

interface BiodiversityCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function BiodiversityCard({
  title,
  value,
  icon,
  color,
}: BiodiversityCardProps) {
  return (
    <div
      className="
      relative
      overflow-hidden
      bg-white
      rounded-3xl
      border
      shadow-sm
      hover:shadow-xl
      transition-all
      duration-300
      hover:-translate-y-1
      p-6
      "
    >
      {/* Gradient Strip */}
      <div
        className={`
        absolute
        left-0
        top-0
        h-2
        w-full
        ${color}
        `}
      />

      <div className="flex justify-between items-start">

        <div>

          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3 text-gray-800">
            {value}
          </h2>

          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <ArrowUpRight size={14} />
            Live Analytics
          </div>

        </div>

        <div
          className={`
          h-16
          w-16
          rounded-2xl
          flex
          items-center
          justify-center
          text-white
          shadow-lg
          ${color}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}