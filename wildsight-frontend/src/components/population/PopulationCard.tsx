import { ReactNode } from "react";

interface PopulationCardProps {

    title: string;

    value: number | string;

    icon: ReactNode;

    color: string;

}

export default function PopulationCard({

    title,
    value,
    icon,
    color

}: PopulationCardProps) {

    return (

        <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            hover:shadow-lg
            transition
            p-6
            flex
            justify-between
            items-center
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
                    text-3xl
                    font-bold
                    mt-2
                    text-gray-800
                    "
                >

                    {value}

                </h2>

            </div>

            <div
                className={`
                ${color}
                h-14
                w-14
                rounded-xl
                flex
                items-center
                justify-center
                text-white
                shadow-lg
                `}
            >

                {icon}

            </div>

        </div>

    );

}