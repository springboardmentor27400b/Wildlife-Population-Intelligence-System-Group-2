import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface Props {

    title:string;

    value:string | number;

    icon:ReactNode;

    color:string;

}

export default function HabitatCard({

    title,

    value,

    icon,

    color

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-3xl
        shadow-sm
        border
        p-6
        hover:shadow-xl
        transition-all
        duration-300
        group
        "
        >

            <div
            className="
            flex
            justify-between
            items-start
            "
            >

                <div>

                    <p
                    className="
                    text-gray-500
                    text-sm
                    "
                    >

                        {title}

                    </p>

                    <h2
                    className="
                    text-4xl
                    font-bold
                    mt-3
                    "
                    >

                        {value}

                    </h2>

                </div>

                <div
                className={`
                ${color}
                p-4
                rounded-2xl
                text-white
                shadow-lg
                group-hover:scale-110
                transition
                `}
                >

                    {icon}

                </div>

            </div>

            <div
            className="
            flex
            items-center
            mt-6
            text-green-600
            font-medium
            text-sm
            "
            >

                <ArrowUpRight
                className="mr-2"
                size={18}
                />

                AI Updated

            </div>

        </div>

    );

}