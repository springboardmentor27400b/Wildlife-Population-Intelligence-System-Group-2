import { ReactNode } from "react";


interface Props{

    title:string;

    value:string | number;

    icon:ReactNode;

    color:string;

}


export default function SurveyCard({

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
        border
        shadow-sm
        p-6
        hover:shadow-xl
        transition-all
        "
        >

            <div
            className="
            flex
            items-center
            justify-between
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
                    mt-3
                    "
                    >

                        {value}

                    </h2>

                </div>



                <div
                className={`
                ${color}
                h-16
                w-16
                rounded-2xl
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


        </div>

    );

}