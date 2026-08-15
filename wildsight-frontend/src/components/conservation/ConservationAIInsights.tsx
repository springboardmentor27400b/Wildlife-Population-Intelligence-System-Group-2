import {
  Brain,
  ShieldCheck,
  Trees,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface Props{

    biodiversityScore:number;

    habitatQuality:number;

    protectionLevel:string;

    budgetPriority:string;

}

export default function ConservationAIInsights({

    biodiversityScore,

    habitatQuality,

    protectionLevel,

    budgetPriority

}:Props){

    const biodiversityMessage =

        biodiversityScore >= 85

        ?

        "Biodiversity indicators are excellent across monitored habitats."

        :

        biodiversityScore >= 70

        ?

        "Healthy biodiversity with opportunities for preventive conservation."

        :

        "Biodiversity decline detected. Immediate intervention is recommended.";

    const habitatMessage =

        habitatQuality >= 80

        ?

        "Habitats remain healthy and capable of supporting long-term wildlife populations."

        :

        habitatQuality >= 60

        ?

        "Habitats require periodic restoration and monitoring."

        :

        "Habitat degradation is affecting ecosystem sustainability.";

    const recommendation =

        protectionLevel === "LOW"

        ?

        "Maintain routine monitoring, continue habitat conservation and periodic biodiversity assessments."

        :

        protectionLevel === "MEDIUM"

        ?

        "Increase field monitoring, restore degraded habitats and strengthen wildlife protection."

        :

        "Deploy emergency conservation programs, increase patrol teams and prioritize habitat restoration.";

    return(

        <div
        className="
        bg-white
        rounded-3xl
        border
        shadow-sm
        p-6
        hover:shadow-xl
        transition-all
        "
        >

            {/* Header */}

            <div
            className="
            flex
            items-center
            gap-3
            mb-8
            "
            >

                <div
                className="
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                    <Brain
                    className="
                    text-green-600
                    "
                    />

                </div>

                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        AI Conservation Insights

                    </h2>

                    <p
                    className="
                    text-gray-500
                    "
                    >

                        Intelligent conservation recommendations

                    </p>

                </div>

            </div>

            <div
            className="
            grid
            md:grid-cols-2
            gap-5
            "
            >

                {/* Biodiversity */}

                <InsightCard

                    icon={
                        <Trees className="text-green-600"/>
                    }

                    title="Biodiversity Analysis"

                    value={`${biodiversityScore}%`}

                    message={biodiversityMessage}

                />

                {/* Habitat */}

                <InsightCard

                    icon={
                        <ShieldCheck className="text-blue-600"/>
                    }

                    title="Habitat Quality"

                    value={`${habitatQuality}%`}

                    message={habitatMessage}

                />

                {/* Protection */}

                <div
                className="
                rounded-2xl
                bg-blue-50
                border
                border-blue-100
                p-5
                "
                >

                    <div
                    className="
                    flex
                    items-center
                    gap-2
                    mb-2
                    "
                    >

                        <TrendingUp
                        className="
                        text-blue-600
                        "
                        />

                        <h3
                        className="
                        font-semibold
                        "
                        >

                            Protection Level

                        </h3>

                    </div>

                    <span
                    className="
                    inline-block
                    bg-blue-600
                    text-white
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                    "
                    >

                        {protectionLevel}

                    </span>

                    <p
                    className="
                    mt-4
                    text-gray-700
                    "
                    >

                        Budget Priority:
                        <b> {budgetPriority}</b>

                    </p>

                </div>

                {/* AI Recommendation */}

                <div
                className="
                rounded-2xl
                bg-green-600
                text-white
                p-5
                "
                >

                    <div
                    className="
                    flex
                    items-center
                    gap-2
                    mb-3
                    "
                    >

                        <Sparkles/>

                        <h3
                        className="
                        font-semibold
                        "
                        >

                            AI Recommendation

                        </h3>

                    </div>

                    <p
                    className="
                    leading-7
                    "
                    >

                        {recommendation}

                    </p>

                </div>

            </div>

        </div>

    );

}

interface InsightProps{

    icon:React.ReactNode;

    title:string;

    value:string;

    message:string;

}

function InsightCard({

    icon,

    title,

    value,

    message

}:InsightProps){

    return(

        <div
        className="
        rounded-2xl
        border
        p-5
        "
        >

            <div
            className="
            flex
            items-center
            gap-3
            mb-3
            "
            >

                {icon}

                <h3
                className="
                font-semibold
                "
                >

                    {title}

                </h3>

            </div>

            <h2
            className="
            text-3xl
            font-bold
            mb-3
            "
            >

                {value}

            </h2>

            <p
            className="
            text-gray-700
            leading-relaxed
            "
            >

                {message}

            </p>

        </div>

    );

}