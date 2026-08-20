import { useEffect, useState } from "react";
import axios from "axios";

function HabitatIntelligence() {

    const [habitat, setHabitat] = useState({
        habitat_type: "",
        total_observations: 0,
        vegetation_score: 0,
        degradation_score: 0,
        environmental_condition: "",
        habitat_suitability: 0,
        habitat_health: ""
    });

    useEffect(() => {
        loadHabitat();
    }, []);

    const loadHabitat = async () => {

        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/habitat/`
            );

            console.log("Habitat Data:", res.data);

            setHabitat(res.data);

        } catch (err) {

            console.log("Error loading habitat:", err);

        }

    };

    return (

        <div className="container mt-4">

            <h2 className="mb-4">
                Habitat Intelligence Engine
            </h2>

            <div className="row">

                {/* Habitat Type */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Habitat Type</h5>

                            <h3>{habitat.habitat_type}</h3>

                        </div>

                    </div>

                </div>


                {/* Total Observations */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Total Observations</h5>

                            <h2>{habitat.total_observations}</h2>

                        </div>

                    </div>

                </div>


                {/* Vegetation */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Vegetation Score</h5>

                            <h2>{habitat.vegetation_score}%</h2>

                        </div>

                    </div>

                </div>


                {/* Degradation */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Habitat Degradation</h5>

                            <h2>{habitat.degradation_score}%</h2>

                        </div>

                    </div>

                </div>


                {/* Environmental Condition */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Environmental Condition</h5>

                            <h2>{habitat.environmental_condition}</h2>

                        </div>

                    </div>

                </div>


                {/* Habitat Suitability */}
                <div className="col-md-4 mb-4">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>Habitat Suitability</h5>

                            <h2>{habitat.habitat_suitability}%</h2>

                        </div>

                    </div>

                </div>

            </div>


            <hr className="my-4" />


            {/* Habitat Health */}
            <div className="card shadow">

                <div className="card-body text-center">

                    <h3>Habitat Health Status</h3>

                    <br />

                    <span
                        className={
                            habitat.habitat_health === "Excellent"
                                ? "badge bg-success fs-4 p-3"

                                : habitat.habitat_health === "Healthy"
                                    ? "badge bg-primary fs-4 p-3"

                                    : habitat.habitat_health === "Moderate"
                                        ? "badge bg-warning text-dark fs-4 p-3"

                                        : "badge bg-danger fs-4 p-3"
                        }
                    >

                        {habitat.habitat_health}

                    </span>

                </div>

            </div>

        </div>
    );
}

export default HabitatIntelligence;