import { useState, useEffect } from "react";
import api from "../api/api";
import observationBg from "../assets/observation-bg.jpg";

function Observation() {
  const user = JSON.parse(localStorage.getItem("user"));
    console.log("Observation Page Loaded");

  const [speciesList, setSpeciesList] = useState([]);
  const [surveyList, setSurveyList] = useState([]);
  const [observations, setObservations] = useState([]);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    species_id: "",
    survey_id: "",
    location: "",
    latitude: "",
    longitude: "",
    observation_date: "",
    observer_name: "",
    population_count: "",
    image_path: "",
    audio_path: "",
    notes: "",
  });

  useEffect(() => {
    fetchSpecies();
    fetchSurveys();
    fetchObservations();
  }, []);

  const fetchSpecies = async () => {
    try {
      const response = await api.get("/species");
      setSpeciesList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await api.get("/surveys");
      setSurveyList(response.data);
    } catch (error) {
      console.log("Error fetching surveys:", error);
    }
  };

  const fetchObservations = async () => {
  try {
    const response = await api.get("/observations");
    setObservations(response.data);
  } catch (error) {
    console.log("Error fetching observations:", error);
  }
};
   
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

 const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    let imagePath = "";

    // Upload image first
    if (image) {

      const imageData = new FormData();

      imageData.append("file", image);

      const uploadResponse = await api.post(
        "/upload/image",
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      imagePath = uploadResponse.data.image_path;
    }

    // Save observation
   if (editingId) {

        await api.put(`/observations/${editingId}`, {
          ...formData,
          image_path: imagePath || formData.image_path,
        });

        alert("Observation Updated Successfully!");

      } else {

        await api.post("/observations", {
          ...formData,
          image_path: imagePath,
        });

  alert("Observation Added Successfully!");

}

    

    await fetchObservations();
    setEditingId(null);

    setFormData({
      species_id: "",
      survey_id: "",
      location: "",
      latitude: "",
      longitude: "",
      observation_date: "",
      observer_name: "",
      population_count: "",
      image_path: "",
      audio_path: "",
      notes: "",
    });

    setImage(null);

  } catch (error) {

    console.log(error);

    alert("Error adding observation");

  }

};
const handleEdit = (obs) => {

  setEditingId(obs.id);

  setFormData({
    species_id: obs.species_id,
    survey_id: obs.survey_id,
    location: obs.location,
    latitude: obs.latitude,
    longitude: obs.longitude,
    observation_date: obs.observation_date,
    observer_name: obs.observer_name,
    population_count: obs.population_count,
    image_path: obs.image_path,
    audio_path: obs.audio_path,
    notes: obs.notes,
  });

};

const handleDelete = async (id) => {

  if (!window.confirm("Are you sure you want to delete this observation?")) {
    return;
  }

  try {
    await api.delete(`/observations/${id}`);
    alert("Observation deleted successfully!");
    fetchObservations();
  } catch (error) {
    console.log(error);
    alert("Error deleting observation");
  }

};

  return (
    
    <div
        className="container-fluid py-5"
        style={{
          minHeight: "100vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.65)), url(${observationBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
      <div className="container"></div>
      
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          background: "rgba(255,255,255,.12)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "25px",
          color: "white",
        }}
      >

        <div
          className="card-header"
          style={{
            background: "rgba(25,135,84,.75)",
            color: "white",
            borderRadius: "25px 25px 0 0",
          }}
        >
          Wildlife Observation
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="mb-3">

              <label>Species</label>

             <select
                className="form-select bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="species_id"
                value={formData.species_id}
                onChange={handleChange}
                required
              >

                <option value="">Select Species</option>

                {speciesList.map((species) => (

                  <option
                    key={species.id}
                    value={species.id}
                  >
                    {species.species_name}
                  </option>

                ))}

              </select>

            </div>

            <div className="mb-3">

              <label>Survey</label>

              <select
                className="form-select bg-transparent text-white"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.3)"
                }}
                name="survey_id"
                value={formData.survey_id}
                onChange={handleChange}
                required
              >

                <option value="">Select Survey</option>

                {surveyList.map((survey) => (
                  <option
                    key={survey.id}
                    value={survey.id}
                  >
                    {survey.survey_id} - {survey.title}
                  </option>
                ))}

              </select>

            </div>

            <div className="mb-3">
              <label>Location</label>
              <input
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">

              <div className="col-md-6">

                <label>Latitude</label>

                <input
                  type="number"
                  step="any"
                  className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-6">

                <label>Longitude</label>

                <input
                  type="number"
                  step="any"
                  className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                />

              </div>

            </div>

            <br />

            <div className="row">

              <div className="col-md-6">

                <label>Observation Date</label>

                <input
                  type="date"
                  className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                  name="observation_date"
                  value={formData.observation_date}
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-6">

                <label>Observer Name</label>

                <input
                  className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                  name="observer_name"
                  value={formData.observer_name}
                  onChange={handleChange}
                />

              </div>

            </div>

            <br />

            <div className="mb-3">

              <label>Population Count</label>

              <input
                type="number"
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="population_count"
                value={formData.population_count}
                onChange={handleChange}
              />

            </div>

            <div className="mb-3">

              <label>Wildlife Image</label>

              <input
                type="file"
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />

            </div>

            <div className="mb-3">

              <label>Notes</label>

                <textarea
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                rows="3"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />

            </div>

           <button className="btn btn-success">
              {editingId ? "Update Observation" : "Save Observation"}
            </button>
          </form>

        </div>

      </div>

  
           
     {/* Observation History */}
    
      <div
        className="card border-0 shadow-lg mt-5"
        style={{
        background:"rgba(255,255,255,.12)",
        backdropFilter:"blur(18px)",
        WebkitBackdropFilter:"blur(18px)",
        borderRadius:"25px",
        color:"white"
        }}
        >

        <div
          className="card-header"
          style={{
          background:"rgba(13,110,253,.75)",
          color:"white",
          borderRadius:"25px 25px 0 0"
          }}
          >
          Observation History
        </div>

        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="mb-0">Total Observations</h5>

                <span className="badge bg-success fs-6">
                  {observations.length}
                </span>

              </div>
          <table
            className="table table-borderless table-hover text-white"
            style={{
              background: "transparent",
            }}
          >

            <thead
            style={{
            background:"rgba(255,255,255,.12)",
            color:"white"
            }}
            >
              <tr>
                <th>ID</th>
                <th>Species ID</th>
                <th>Image</th>
                <th>Location</th>
                <th>Date</th>
                <th>Observer</th>
                <th>Population</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody
              style={{
              background:"rgba(255,255,255,.05)"
              }}
              >
              {observations.length > 0 ? (

                observations.map((obs) => (

                  <tr
                  key={obs.id}
                  style={{
                  background:"rgba(255,255,255,.04)"
                  }}
                  >
                    <td style={{color:"white"}}>{obs.id}</td>
                    <td style={{color:"white"}}>
                      {speciesList.find((species) => species.id === obs.species_id)?.species_name ||
                        "Unknown Species"}
                    </td>
                    <td style={{color:"white"}}>
                      {obs.image_path ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${obs.image_path}`}
                          alt="Wildlife"
                          width="80"
                          height="60"
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <span className="text-muted">No Image</span>
                      )}
                    </td>
                    <td style={{color:"white"}}>{obs.location}</td>
                    <td style={{color:"white"}}>{obs.observation_date}</td>
                    <td style={{color:"white"}}>{obs.observer_name}</td>
                    <td style={{color:"white"}}>{obs.population_count}</td>
                    <td>

                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(obs)}
                      >
                        Edit
                      </button>


                      {user?.role === "Administrator" && (

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(obs.id)}
                        >
                          Delete
                        </button>

                      )}

                    </td>
                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="text-center">
                    No observations found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Observation;