import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";


interface Props{

    forest:number;

    grassland:number;

    wetland:number;

}


export default function HabitatCoverageChart({

    forest,

    grassland,

    wetland

}:Props){


    const data=[

        {
            habitat:"Forest",
            surveys:forest
        },

        {
            habitat:"Grassland",
            surveys:grassland
        },

        {
            habitat:"Wetland",
            surveys:wetland
        }

    ];



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


            <h2
            className="
            text-2xl
            font-bold
            mb-5
            "
            >

                Habitat Survey Coverage 🌳

            </h2>



            <ResponsiveContainer
            width="100%"
            height={300}
            >

                <BarChart data={data}>


                    <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    />


                    <XAxis
                    dataKey="habitat"
                    />


                    <YAxis/>


                    <Tooltip/>


                    <Bar

                    dataKey="surveys"

                    fill="#16a34a"

                    radius={[10,10,0,0]}

                    />


                </BarChart>


            </ResponsiveContainer>


        </div>

    );

}