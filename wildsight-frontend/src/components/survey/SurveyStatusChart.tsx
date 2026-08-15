import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";


interface Props{

    active:number;

    completed:number;

    pending:number;

}


const colors = [

    "#22c55e",
    "#3b82f6",
    "#f59e0b"

];


export default function SurveyStatusChart({

    active,

    completed,

    pending

}:Props){


    const data=[

        {
            name:"Active",
            value:active
        },

        {
            name:"Completed",
            value:completed
        },

        {
            name:"Pending",
            value:pending
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

                Survey Status Analysis 📊

            </h2>



            <ResponsiveContainer
            width="100%"
            height={300}
            >

                <PieChart>

                    <Pie

                    data={data}

                    dataKey="value"

                    nameKey="name"

                    cx="50%"

                    cy="50%"

                    outerRadius={100}

                    label

                    >


                        {
                            data.map((_,index)=>(

                                <Cell

                                key={index}

                                fill={
                                    colors[index]
                                }

                                />

                            ))
                        }


                    </Pie>


                    <Tooltip/>


                </PieChart>


            </ResponsiveContainer>


        </div>

    );

}