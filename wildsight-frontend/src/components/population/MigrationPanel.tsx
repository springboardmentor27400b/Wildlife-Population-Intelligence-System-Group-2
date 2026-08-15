import { Migration } from "../../types/population";

interface Props{

    data: Migration[];

}

export default function MigrationPanel({

    data

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        p-6
        ">

            <h2
            className="
            text-2xl
            font-bold
            mb-5
            ">

                🦅 Migration Analysis

            </h2>

            <div
            className="
            space-y-5
            ">

                {

                    data.map((item,index)=>(

                        <div

                        key={index}

                        className="
                        rounded-xl
                        border
                        p-5
                        hover:bg-green-50
                        transition
                        ">

                            <h3
                            className="
                            text-lg
                            font-bold
                            text-green-700
                            ">

                                {item.species}

                            </h3>

                            <div
                            className="
                            mt-3
                            flex
                            items-center
                            justify-between
                            ">

                                <div>

                                    <p className="text-gray-500">

                                        From

                                    </p>

                                    <h4
                                    className="font-semibold">

                                        {item.fromLocation}

                                    </h4>

                                </div>

                                <div
                                className="
                                text-4xl
                                text-green-600
                                ">

                                    →

                                </div>

                                <div>

                                    <p className="text-gray-500">

                                        To

                                    </p>

                                    <h4
                                    className="font-semibold">

                                        {item.toLocation}

                                    </h4>

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}