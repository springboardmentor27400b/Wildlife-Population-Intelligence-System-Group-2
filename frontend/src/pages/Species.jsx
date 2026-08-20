import { useState, useEffect } from "react";
import api from "../api/api";
import speciesBg from "../assets/species-bg.jpg";

function Species() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    species_name: "",
    scientific_name: "",
    category: "",
    population: "",
    conservation_status: "",
    habitat: "",
  });

  const [speciesList, setSpeciesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Species
  const fetchSpecies = async () => {
    try {
      const response = await api.get("/species");
      setSpeciesList(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load species.");
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, []);

  // Search Filter
  const filteredSpecies = speciesList.filter((species) =>
    species.species_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Handle Form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add / Update Species
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId === null) {
        await api.post("/species", formData);
        alert("Species Added Successfully!");
      } else {
        await api.put(`/species/${editingId}`, formData);
        alert("Species Updated Successfully!");
        setEditingId(null);
      }

      setFormData({
        species_name: "",
        scientific_name: "",
        category: "",
        population: "",
        conservation_status: "",
        habitat: "",
      });

      fetchSpecies();

    } catch (error) {
      console.error(error);
      alert("Operation Failed");
    }
  };

  // Edit
  const handleEdit = (species) => {
    setEditingId(species.id);

    setFormData({
      species_name: species.species_name,
      scientific_name: species.scientific_name,
      category: species.category,
      population: species.population,
      conservation_status: species.conservation_status,
      habitat: species.habitat,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this species?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/species/${id}`);

      alert("Species Deleted Successfully!");

      fetchSpecies();

    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  return (
   <div
  className="container-fluid py-5"
  style={{
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.65)), url(${speciesBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }}
>
      <div className="container">
        <h2 className="fw-bold text-center text-white mb-5 display-5">
          🐅 Wildlife Species Management
        </h2>

      </div>

      
      {/* Form */}
      
      {user?.role === "Administrator" && (
     <div
  className="card border-0 shadow-lg mb-5"
  style={{
    background: "rgba(255,255,255,.12)",
    backdropFilter: "blur(18px)",
    borderRadius: "25px",
    color: "white",
  }}
>

<div className="card-body p-5">

<h4 className="mb-4">

          {editingId
            ? "✏️ Update Species"
            : "➕ Add New Species"}

        </h4>

        <form onSubmit={handleSubmit}>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Species Name
              </label>

              <input
                type="text"
                className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                name="species_name"
                value={formData.species_name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Scientific Name
              </label>

              <input
                type="text"
                  className="form-control bg-transparent text-white"
                  style={{
                  background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.3)"
                  }}
                name="scientific_name"
                value={formData.scientific_name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Category
              </label>

              <select
                className="form-select bg-transparent text-white"
              style={{
              background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.3)"
              }}
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option>Mammal</option>
                <option>Bird</option>
                <option>Reptile</option>
                <option>Amphibian</option>
                <option>Fish</option>
              </select>

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Population
              </label>

              <input
                type="number"
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="population"
                value={formData.population}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Conservation Status
              </label>

              <select
                className="form-select bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="conservation_status"
                value={formData.conservation_status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option>Least Concern</option>
                <option>Vulnerable</option>
                <option>Endangered</option>
                <option>Critically Endangered</option>
              </select>

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Habitat
              </label>

              <input
                type="text"
                className="form-control bg-transparent text-white"
                style={{
                background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.3)"
                }}
                name="habitat"
                value={formData.habitat}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className={`btn ${
              editingId ? "btn-warning" : "btn-success"
            }`}
          >
            {editingId ? "Update Species" : "Add Species"}
          </button>

        </form>

      </div>
      </div>
      )}

      {/* Table */}

      <div
        className="shadow-lg p-4"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,.2)",
          borderRadius: "25px",
        }}
      >

        <div
          className="card-header border-0"
          style={{
            background: "rgba(255,255,255,.12)",
            backdropFilter: "blur(20px)",
            color: "white",
          }}
        >

          <h4 className="mb-0">
            Species List
          </h4>

        </div>

        <div>

          {/* Search */}

          <div className="mb-4">

           <input
            type="text"
              className="form-control text-white"
              style={{
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.3)",
                color: "white",
              }}
            placeholder="🔍 Search Species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          </div>

          <table
            className="table table-hover table-borderless text-white"
            style={{
              background: "transparent",
            }}
          >

           <thead
              style={{
                background: "rgba(255,255,255,.12)",
                backdropFilter: "blur(12px)",
                color: "white",
              }}
            >

              <tr>

                <th>ID</th>
                <th>Species</th>
                <th>Image</th>
                <th>Scientific Name</th>
                <th>Category</th>
                <th>Population</th>
                <th>Status</th>
                <th>Habitat</th>
                <th>Actions</th>

              </tr>

            </thead>

            <tbody
              style={{
                background: "rgba(255,255,255,.05)",
                backdropFilter: "blur(10px)",
              }}
            >

              {filteredSpecies.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="text-center"
                  >
                    No Species Found
                  </td>

                </tr>

              ) : (

                filteredSpecies.map((species) => (

                 <tr
                    key={species.id}
                    style={{
                      background: "rgba(255,255,255,.04)",
                    }}
                  >

                    <td style={{ color: "white" }}>{species.id}</td>

                    <td style={{ color: "white" }}>{species.species_name}</td>
                    <td style={{ color: "white" }}>
                      {species.image ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${species.image}`}
                          alt={species.species_name}
                          width="80"
                          height="60"
                          style={{
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>

                    <td style={{ color: "white" }}>{species.scientific_name}</td>

                    <td style={{ color: "white" }}>{species.category}</td>

                    <td style={{ color: "white" }}>{species.population}</td>

                    <td style={{ color: "white" }}>

                      <span
                        className={`badge ${
                          species.conservation_status === "Endangered"
                            ? "bg-danger"
                            : species.conservation_status === "Vulnerable"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {species.conservation_status}
                      </span>

                    </td>

                    <td style={{ color: "white" }}>{species.habitat}</td>

                    <td style={{ color: "white" }}>

                      {user?.role === "Administrator" ? (

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEdit(species)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(species.id)}
                          >
                            🗑 Delete
                          </button>

                        </div>

                      ) : (

                        <span className="text-muted">View Only</span>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Species;