import { useState } from "react";
import axios from "axios";

function SpeciesClassification() {

    const [image, setImage] = useState(null);

    const [result, setResult] = useState(null);

    const classifySpecies = async () => {

        if (!image) {
            alert("Please select an image");
            return;
        }

        const formData = new FormData();

        formData.append("file", image);

        try {

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/species-classification/`,
                formData
            );

            setResult(res.data);

        } catch (err) {
            console.log(err);
            alert("Classification Failed");
        }

    };

    return (

        <div className="container mt-4">

            <h2 className="mb-4">Species Classification</h2>

            <input
                type="file"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <button
                className="btn btn-success mt-3"
                onClick={classifySpecies}
            >
                Identify Species
            </button>

            {result && (

                <div className="mt-5">

                    {/* Images */}

                    <div className="row">

                        <div className="col-md-6">

                            <div className="card">

                                <div className="card-header">
                                    <b>Uploaded Image</b>
                                </div>

                                <div className="card-body text-center">

                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${result.uploaded_image}`}
                                        alt="Uploaded"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: "350px" }}
                                    />

                                </div>

                            </div>

                        </div>

                        <div className="col-md-6">

                            <div className="card">

                                <div className="card-header">
                                    <b>Detection Result (YOLO)</b>
                                </div>

                                <div className="card-body text-center">

                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${result.annotated_image}`}
                                        alt="Detection"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: "350px" }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Species Details */}

                    <div className="card mt-4">

                        <div className="card-header bg-success text-white">

                            <h4 className="mb-0">
                                {result.common_name}
                            </h4>

                        </div>

                        <div className="card-body">

                            <p><b>Scientific Name:</b> {result.scientific_name}</p>

                            <p><b>Kingdom:</b> {result.kingdom}</p>

                            <p><b>Phylum:</b> {result.phylum}</p>

                            <p><b>Class:</b> {result.class_name}</p>

                            <p><b>Order:</b> {result.order}</p>

                            <p><b>Family:</b> {result.family}</p>

                            <p><b>Genus:</b> {result.genus}</p>

                            <p>
                                <b>Conservation Status:</b>{" "}
                                <span className="badge bg-danger">
                                    {result.conservation_status}
                                </span>
                            </p>

                            <p>
                                <b>Confidence:</b>{" "}
                                {result.confidence}%
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default SpeciesClassification;