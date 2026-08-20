import { useEffect, useState } from "react";
import axios from "axios";

function BiodiversityIntelligence() {

const [dashboard, setDashboard] = useState({
    biodiversity_index: 0,
    species_diversity: 0,
    habitat_health: 0,
    endangered_species: 0,
    vulnerable_species: 0,
    conservation_priority: "",
    total_observations: 0
});

const [loading, setLoading] = useState(true);

useEffect(() => {
    loadDashboard();
}, []);

const loadDashboard = async () => {

    try {

        const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/biodiversity-intelligence/dashboard`
        );

        console.log("Biodiversity API Response:", res.data);

        setDashboard(res.data);

    } catch (err) {

        console.error(
            "Error loading biodiversity dashboard:",
            err
        );

    } finally {

        setLoading(false);

    }
};

if (loading) {
    return (
        <div className="container mt-4">
            <h2>Biodiversity Intelligence Dashboard</h2>
            <p>Loading biodiversity data...</p>
        </div>
    );
}

return (

    <div className="container mt-4">

        <h2 className="mb-4">
            Biodiversity Intelligence Dashboard
        </h2>

        <div className="row">

            {/* Biodiversity Index */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Biodiversity Index</h5>

                        <h2>
                            {dashboard.biodiversity_index}
                        </h2>

                    </div>

                </div>

            </div>


            {/* Species Diversity */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Species Diversity</h5>

                        <h2>
                            {dashboard.species_diversity}
                        </h2>

                    </div>

                </div>

            </div>


            {/* Habitat Health */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Habitat Health</h5>

                        <h2>
                            {dashboard.habitat_health}%
                        </h2>

                    </div>

                </div>

            </div>


            {/* Endangered Species */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Endangered Species</h5>

                        <h2>
                            {dashboard.endangered_species}
                        </h2>

                    </div>

                </div>

            </div>


            {/* Vulnerable Species */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Vulnerable Species</h5>

                        <h2>
                            {dashboard.vulnerable_species}
                        </h2>

                    </div>

                </div>

            </div>


            {/* Conservation Priority */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Conservation Priority</h5>

                        <h3>
                            {dashboard.conservation_priority}
                        </h3>

                    </div>

                </div>

            </div>


            {/* Total Observations */}
            <div className="col-md-4 mb-3">

                <div className="card shadow text-center">

                    <div className="card-body">

                        <h5>Total Observations</h5>

                        <h2>
                            {dashboard.total_observations}
                        </h2>

                    </div>

                </div>

            </div>

        </div>

    </div>

);


}

export default BiodiversityIntelligence;
