import { useEffect, useState } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Filler
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Filler
);
function BiodiversityAnalytics() {
    const [dashboard, setDashboard] = useState({
        total_species: 0,
        total_observations: 0,
        total_surveys: 0,
        total_predictions: 0
    });

    const [observations, setObservations] = useState([]);
    
    const [predictions, setPredictions] = useState({
        images: [],
        audios: [],
        species: []
    });

   useEffect(() => {
        loadDashboard();
        loadObservations();
        loadPredictionHistory();
    }, []);
    const loadDashboard = async () => {
        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/biodiversity/dashboard`
            );

            setDashboard(res.data);

        } catch (err) {
            console.log(err);
        }
    };
    
    const loadObservations = async () => {

        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/biodiversity/observation-history`
            );

            setObservations(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    const loadPredictionHistory = async () => {

        try {

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/biodiversity/prediction-history`
            );

            setPredictions(res.data);

        } catch (err) {

            console.log(err);

        }

    };
    
    {/* Species Distribution Pie Chart */}

    const speciesChartData = {

        labels: predictions.species.map(item => item.common_name),

        datasets: [

            {

                label: "Species",

                data: predictions.species.map(() => 1),

                backgroundColor: [

                    "#336935",
                    "#2c5576",
                    "#7f903d",
                    "#913c58",
                    "#bb6bc9",
                    "#65afa8",
                    "#e09579",
                    "#7a3f92d3"

                ]

            }

        ]

    };

    {/* Bar Chart Data */}

   const predictionChartData = {

        labels: predictions.species.map(item => item.common_name),

        datasets: [

            {

                label: "Prediction Confidence",

                data: predictions.species.map(item => item.confidence),

                backgroundColor: [

                    "#4CAF50",
                    "#2196F3",
                    "#FF9800",
                    "#9C27B0",
                    "#F44336",
                    "#00BCD4",
                    "#8BC34A",
                    "#FFC107",
                    "#795548",
                    "#3F51B5"

                ],

                borderRadius: 8

            }

        ]

    };

    return (

        <div className="container mt-4">

            <h2 className="mb-4">Biodiversity Analytics Dashboard</h2>

            <div className="mb-4">

                <button
                    className="btn btn-success me-3"
                    onClick={()=>{
                    window.open(
                    `${import.meta.env.VITE_API_URL}/export/observations/excel`
                    );
                    }}
                    >
                    Export Observation Excel
                </button>

                <button
                    className="btn btn-primary"
                    onClick={()=>{
                    window.open(
                    `${import.meta.env.VITE_API_URL}/export/predictions/excel`
                    );
                    }}
                    >
                    Export Prediction Excel
                </button>

            </div>

            {/* Dashboard Cards */}

            <div className="row">

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h6>Total Species</h6>
                            <h2>{dashboard.total_species}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h6>Total Observations</h6>
                            <h2>{dashboard.total_observations}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h6>Total Surveys</h6>
                            <h2>{dashboard.total_surveys}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <h6>Total Predictions</h6>
                            <h2>{dashboard.total_predictions}</h2>
                        </div>
                    </div>
                </div>

            </div>

            <hr className="my-5" />

            {/* Observation History */}

            <h3>Observation History</h3>

            <table className="table table-bordered table-hover mt-3">

                <thead className="table-success">

                    <tr>

                        <th>ID</th>

                        <th>Species</th>

                        <th>Location</th>

                        <th>Population</th>

                        <th>Date</th>

                        <th>Observer</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        observations.length > 0 ?

                            observations.map((obs) => (

                                <tr key={obs.id}>

                                    <td>{obs.id}</td>

                                    <td>{obs.species}</td>

                                    <td>{obs.location}</td>

                                    <td>{obs.population}</td>

                                    <td>{obs.date}</td>

                                    <td>{obs.observer}</td>

                                </tr>

                            ))

                            :

                            <tr>

                                <td colSpan="6" className="text-center">

                                    No Observation Found

                                </td>

                            </tr>

                    }

                </tbody>

            </table>


            <hr className="my-5" />

            {/* ImagePrediction History */}

            <h3>Image Prediction History</h3>

            <table className="table table-bordered table-striped">

                <thead className="table-primary">

                    <tr>

                        <th>ID</th>

                        <th>Image</th>

                        <th>Species</th>

                        <th>Confidence</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        predictions.images.map((img) => (

                            <tr key={img.id}>

                                <td>{img.id}</td>

                                <td>{img.image_name}</td>

                                <td>{img.species_detected}</td>

                                <td>{img.confidence}%</td>

                                <td>{img.processing_status}</td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>

            <hr className="my-5" />

            {/* AudioPrediction History */}

            <h3>Audio Prediction History</h3>

            <table className="table table-bordered table-striped">

                <thead className="table-warning">

                    <tr>

                        <th>ID</th>

                        <th>Audio</th>

                        <th>Species</th>

                        <th>Confidence</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        predictions.audios.map((audio) => (

                            <tr key={audio.id}>

                                <td>{audio.id}</td>

                                <td>{audio.audio_name}</td>

                                <td>{audio.species_detected}</td>

                                <td>{audio.confidence}%</td>

                                <td>{audio.processing_status}</td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>

            <hr className="my-5" />

            {/* Species Classification History */}

            <h3>Species Classification History</h3>

            <table className="table table-bordered table-striped">

                <thead className="table-success">

                    <tr>

                        <th>ID</th>

                        <th>Image</th>

                        <th>Species</th>

                        <th>Scientific Name</th>

                        <th>Confidence</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        predictions.species.map((item) => (

                            <tr key={item.id}>

                                <td>{item.id}</td>

                                <td>{item.image_name}</td>

                                <td>{item.common_name}</td>

                                <td>{item.scientific_name}</td>

                                <td>{item.confidence}%</td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>


            <hr className="my-5" />

                {/* Charts */}
                
            <h3>Biodiversity Analytics</h3>

            <div className="row mt-4">

                <div className="col-md-6">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Species Distribution</h5>

                            <Pie data={speciesChartData} />

                        </div>

                    </div>

                </div>

                <div className="col-md-6">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Prediction Summary</h5>

                            <Bar data={predictionChartData} />

                        </div>

                    </div>

                </div>

            </div>
                    </div>

                );

}

export default BiodiversityAnalytics;