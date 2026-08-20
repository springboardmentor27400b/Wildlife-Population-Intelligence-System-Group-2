import { useEffect, useState } from "react";
import axios from "axios";

function WildlifeHealth() {

    const [health, setHealth] = useState({
        biodiversity: 0,
        population: 0,
        habitat: 0,
        conservation: 0,
        environmental_conditions: 0,
        overall: 0,
        status: "Loading..."
    });

    useEffect(() => {
        loadHealth();
    }, []);

    const loadHealth = async () => {

        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/health/`
            );

            console.log("HEALTH API RESPONSE:", res.data);

            setHealth(res.data);

        } catch (error) {

            console.error(
                "ERROR LOADING HEALTH:",
                error
            );

        }

    };

    return (

        <div className="container mt-4">

            <h2>
                Wildlife Health Scoring Engine
            </h2>


            {/* ============================= */}
            {/* SCORE CARDS */}
            {/* ============================= */}

            <div className="row mt-4">


                {/* Biodiversity */}

                <div className="col-md-3 mb-3">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>
                                Biodiversity
                            </h5>

                            <h2>
                                {health.biodiversity}%
                            </h2>

                        </div>

                    </div>

                </div>


                {/* Population */}

                <div className="col-md-3 mb-3">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>
                                Population Stability
                            </h5>

                            <h2>
                                {health.population}%
                            </h2>

                        </div>

                    </div>

                </div>


                {/* Habitat */}

                <div className="col-md-3 mb-3">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>
                                Habitat Quality
                            </h5>

                            <h2>
                                {health.habitat}%
                            </h2>

                        </div>

                    </div>

                </div>


                {/* Conservation */}

                <div className="col-md-3 mb-3">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>
                                Species Conservation
                            </h5>

                            <h2>
                                {health.conservation}%
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* ============================= */}
            {/* ENVIRONMENTAL SCORE */}
            {/* ============================= */}

            <div className="row">

                <div className="col-md-4 mb-3">

                    <div className="card shadow text-center">

                        <div className="card-body">

                            <h5>
                                Environmental Conditions
                            </h5>

                            <h2>
                                {health.environmental_conditions}%
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* ============================= */}
            {/* OVERALL HEALTH */}
            {/* ============================= */}

            <div className="card shadow mt-5">

                <div className="card-body text-center">

                    <h3>
                        Overall Ecosystem Health
                    </h3>

                    <h1 className="display-3">

                        {health.overall}%

                    </h1>


                    {/* STATUS */}

                    <span
                        className={
                            health.status === "Excellent"
                                ? "badge bg-success fs-3"

                                : health.status === "Healthy"
                                    ? "badge bg-primary fs-3"

                                    : health.status === "Moderate Concern"
                                        ? "badge bg-warning text-dark fs-3"

                                        : health.status === "Vulnerable"
                                            ? "badge bg-warning text-dark fs-3"

                                            : "badge bg-danger fs-3"
                        }
                    >

                        {health.status}

                    </span>

                </div>

            </div>


            {/* ============================= */}
            {/* DATA SUMMARY */}
            {/* ============================= */}

            <div className="card shadow mt-4">

                <div className="card-body">

                    <h4>
                        Health Analysis Data
                    </h4>

                    <p>
                        Total Species:
                        <strong>
                            {" "}{health.total_species ?? 0}
                        </strong>
                    </p>

                    <p>
                        Total Observations:
                        <strong>
                            {" "}{health.total_observations ?? 0}
                        </strong>
                    </p>

                    <p>
                        Endangered Species:
                        <strong>
                            {" "}{health.endangered_species ?? 0}
                        </strong>
                    </p>

                    <p>
                        Vulnerable Species:
                        <strong>
                            {" "}{health.vulnerable_species ?? 0}
                        </strong>
                    </p>

                    <p>
                        Critical Species:
                        <strong>
                            {" "}{health.critical_species ?? 0}
                        </strong>
                    </p>

                    <p>
                        Monitored Habitat Types:
                        <strong>
                            {" "}{health.habitat_count ?? 0}
                        </strong>
                    </p>

                </div>

            </div>

        </div>

    );

}

export default WildlifeHealth;