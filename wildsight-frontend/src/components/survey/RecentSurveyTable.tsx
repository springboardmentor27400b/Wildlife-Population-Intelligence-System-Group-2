import {
    CalendarDays,
    MapPin,
    Leaf
} from "lucide-react";


interface Survey{

    surveyId:number;

    surveyName:string;

    habitatType:string;

    protectedArea:string;

    surveyDate:string;

    status:string;

}


interface Props{

    data:Survey[];

}


export default function RecentSurveyTable({

    data

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


            {/* Header */}

            <div
            className="
            flex
            items-center
            gap-3
            mb-6
            "
            >

                <Leaf
                className="
                text-green-600
                "
                />

                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        Recent Wildlife Surveys

                    </h2>


                    <p
                    className="
                    text-gray-500
                    text-sm
                    "
                    >

                        Latest monitoring activities

                    </p>

                </div>


            </div>



            <div
            className="
            overflow-x-auto
            "
            >

                <table
                className="
                w-full
                "
                >


                    <thead>

                        <tr
                        className="
                        border-b
                        text-left
                        text-gray-500
                        "
                        >

                            <th className="p-3">
                                Survey
                            </th>


                            <th className="p-3">
                                Habitat
                            </th>


                            <th className="p-3">
                                Location
                            </th>


                            <th className="p-3">
                                Date
                            </th>


                            <th className="p-3">
                                Status
                            </th>


                        </tr>


                    </thead>



                    <tbody>


                    {

                        data.map((survey)=>(


                            <tr

                            key={survey.surveyId}

                            className="
                            border-b
                            hover:bg-green-50
                            transition
                            "

                            >


                                <td
                                className="
                                p-3
                                font-semibold
                                "
                                >

                                    {survey.surveyName}

                                </td>



                                <td className="p-3">


                                    <div
                                    className="
                                    flex
                                    items-center
                                    gap-2
                                    "
                                    >

                                        <Leaf
                                        size={16}
                                        className="text-green-600"
                                        />


                                        {survey.habitatType}


                                    </div>


                                </td>



                                <td className="p-3">


                                    <div
                                    className="
                                    flex
                                    items-center
                                    gap-2
                                    "
                                    >

                                        <MapPin
                                        size={16}
                                        className="text-red-500"
                                        />


                                        {survey.protectedArea}


                                    </div>


                                </td>



                                <td className="p-3">


                                    <div
                                    className="
                                    flex
                                    items-center
                                    gap-2
                                    "
                                    >

                                        <CalendarDays
                                        size={16}
                                        />

                                        {survey.surveyDate}

                                    </div>


                                </td>



                                <td className="p-3">


                                    <StatusBadge

                                    status={
                                        survey.status
                                    }

                                    />


                                </td>


                            </tr>


                        ))

                    }


                    </tbody>


                </table>


            </div>


        </div>

    );

}



function StatusBadge({

    status

}:{

    status:string;

}){


    const color =

        status==="COMPLETED"

        ?

        "bg-green-100 text-green-700"

        :

        status==="ACTIVE"

        ?

        "bg-blue-100 text-blue-700"

        :

        "bg-yellow-100 text-yellow-700";



    return(

        <span
        className={`
        px-3
        py-1
        rounded-full
        text-sm
        font-semibold
        ${color}
        `}
        >

            {status}

        </span>

    );

}