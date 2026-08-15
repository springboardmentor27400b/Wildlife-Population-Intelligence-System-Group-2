import {
    ShieldCheck,
    AlertTriangle
} from "lucide-react";


interface Props{

    score:number;

    status:string;

}


export default function HealthScoreCard({
    score,
    status
}:Props){


    const healthy =
        status==="Healthy"
        ||
        status==="Excellent";


    return(

        <div
        className="
        bg-white
        rounded-3xl
        shadow-sm
        border
        p-6
        "
        >


            <div
            className="
            flex
            items-center
            gap-3
            mb-5
            "
            >

                <div
                className="
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                {
                    healthy ?

                    <ShieldCheck
                    className="text-green-600"
                    />

                    :

                    <AlertTriangle
                    className="text-red-600"
                    />

                }

                </div>


                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                    Ecosystem Health

                    </h2>


                    <p
                    className="
                    text-gray-500
                    "
                    >

                    Overall wildlife health score

                    </p>


                </div>


            </div>



            <div
            className="
            flex
            justify-center
            items-center
            "
            >


                <div
                className="
                w-44
                h-44
                rounded-full
                border-8
                border-green-500
                flex
                items-center
                justify-center
                "
                >

                    <div
                    className="
                    text-center
                    "
                    >

                    <h1
                    className="
                    text-4xl
                    font-bold
                    "
                    >

                    {score}

                    </h1>


                    <p
                    className="
                    text-gray-500
                    "
                    >

                    Score

                    </p>

                    </div>


                </div>


            </div>



            <div
            className="
            mt-6
            text-center
            "
            >

                <span
                className="
                px-5
                py-2
                rounded-full
                bg-green-100
                text-green-700
                font-semibold
                "
                >

                {status}

                </span>


            </div>


        </div>

    );

}