import { useEffect, useState } from "react";
import axios from "axios";

function ConservationRecommendation() {

    const [data, setData] = useState({
        total_species: 0,
        total_observations: 0,
        critical_species: 0,
        endangered_species: 0,
        vulnerable_species: 0,
        recommendation_count: 0,
        recommendations: []
    });

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {

        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/conservation/`
            );

            console.log("Conservation API:", res.data);

            setData(res.data);

        } catch (err) {

            console.log("Error loading conservation recommendations:", err);

        }

    };

    return (

        <div className="container mt-4">

            <h2 className="mb-4">
                Conservation Recommendation Engine
            </h2>

            {/* Summary Cards */}
            <div className="row">

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h5>Total Species</h5>
                            <h2>{data.total_species}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h5>Total Observations</h5>
                            <h2>{data.total_observations}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h5>Endangered Species</h5>
                            <h2 className="text-danger">
                                {data.endangered_species}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h5>Vulnerable Species</h5>
                            <h2 className="text-warning">
                                {data.vulnerable_species}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>


            {/* Recommendations */}
            <div className="card shadow mt-4">

                <div className="card-header bg-success text-white">

                    <div className="d-flex justify-content-between align-items-center">

                        <h4 className="mb-0">
                            Conservation Recommendations
                        </h4>

                        <span className="badge bg-light text-dark fs-6">
                            {data.recommendation_count} Recommendations
                        </span>

                    </div>

                </div>

                <div className="card-body">

                    {data.recommendations.length > 0 ? (

                        <ul className="list-group">

                            {data.recommendations.map((item, index) => (

                                <li
                                    key={index}
                                    className="list-group-item"
                                >

                                    <span className="me-2">
                                        {index + 1}.
                                    </span>

                                    {item}

                                </li>

                            ))}

                        </ul>

                    ) : (

                        <div className="text-center text-muted p-4">

                            No conservation recommendations available.

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

export default ConservationRecommendation;
