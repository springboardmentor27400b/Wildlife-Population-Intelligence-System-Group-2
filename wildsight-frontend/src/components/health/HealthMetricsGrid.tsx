interface Props{

    data:any;

}


export default function HealthMetricsGrid({
    data
}:Props){


    const metrics=[

        {
            title:"Species Diversity",
            value:data.speciesDiversityScore
        },

        {
            title:"Population Stability",
            value:data.populationStabilityScore
        },

        {
            title:"Habitat Quality",
            value:data.habitatQualityScore
        },

        {
            title:"Endangered Species",
            value:data.endangeredSpeciesScore
        },

        {
            title:"Environment",
            value:data.environmentalScore
        }

    ];


    return(

        <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-5
        gap-5
        "
        >

        {
            metrics.map((item)=>(

                <div
                key={item.title}
                className="
                bg-white
                rounded-3xl
                border
                p-5
                shadow-sm
                "
                >

                    <p
                    className="
                    text-gray-500
                    "
                    >

                    {item.title}

                    </p>


                    <h2
                    className="
                    text-3xl
                    font-bold
                    mt-3
                    "
                    >

                    {item.value}%

                    </h2>


                </div>

            ))
        }

        </div>

    );

}