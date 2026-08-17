import "./Species.css";
import {
  FaSearch,
  FaPlus,
  FaLeaf,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../services/api";

function Species() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    habitat: "",
    status: "Protected",
  });

const fetchSpecies = async () => {
  try {
    const res = await API.get("/species");
    setSpecies(res.data.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let cancelled = false;

  const loadSpecies = async () => {
    try {
      const res = await API.get("/species");

      if (!cancelled) {
        setSpecies(res.data?.data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadSpecies();

  return () => {
    cancelled = true;
  };
}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      category: "",
      habitat: "",
      status: "Protected",
    });
  };

  const saveSpecies = async () => {
    try {
      if (
        !form.name ||
        !form.category ||
        !form.habitat
      ) {
        alert("Please Fill All Fields");
        return;
      }

      if (editingId) {
        await API.put(`/species/${editingId}`, form);
        alert("Updated Successfully");
      } else {
        await API.post("/species", form);
        alert("Species Added Successfully");
      }

      clearForm();
      fetchSpecies();
    } catch (err) {
      console.log(err);
    }
  };

  const editSpecies = (item) => {
    setEditingId(item._id);

    setForm({
      name: item.name,
      category: item.category,
      habitat: item.habitat,
      status: item.status,
    });
  };

  const deleteSpecies = async (id) => {
    if (!window.confirm("Delete this species?")) return;

    try {
      await API.delete(`/species/${id}`);
      fetchSpecies();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredData = species.filter((item) =>
    item.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="species">

      <div className="species-header">

        <h1>Wildlife Species Management</h1>

        <div className="header-actions">

          <div className="search-box">

            <FaSearch />

            <input
              type="text"
              placeholder="Search Species..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <button
            className="add-btn"
            onClick={saveSpecies}
          >
            <FaPlus />
            {editingId ? "Update" : "Add Species"}
          </button>

        </div>

      </div>

      <div className="form-section">

        <input
          type="text"
          name="name"
          placeholder="Species Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <input
          type="text"
          name="habitat"
          placeholder="Habitat"
          value={form.habitat}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Protected</option>
          <option>Endangered</option>
          <option>Critical</option>
        </select>

      </div>
            <div className="species-cards">

        <div className="species-card">
          <FaLeaf />
          <h2>{species.length}</h2>
          <p>Total Species</p>
        </div>

        <div className="species-card">
          <FaLeaf />
          <h2>
            {
              species.filter(
                (item) => item.status === "Protected"
              ).length
            }
          </h2>
          <p>Protected</p>
        </div>

        <div className="species-card">
          <FaLeaf />
          <h2>
            {
              species.filter(
                (item) => item.status === "Endangered"
              ).length
            }
          </h2>
          <p>Endangered</p>
        </div>

        <div className="species-card">
          <FaLeaf />
          <h2>
            {
              species.filter(
                (item) => item.status === "Critical"
              ).length
            }
          </h2>
          <p>Critical</p>
        </div>

      </div>

      <div className="table-section">

        <table>

          <thead>

            <tr>
              <th>No.</th>
              <th>Species</th>
              <th>Category</th>
              <th>Habitat</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan="6">Loading...</td>
              </tr>

            ) : filteredData.length === 0 ? (

              <tr>
                <td colSpan="6">No Species Found</td>
              </tr>

            ) : (

              filteredData.map((item, index) => (

                <tr key={item._id}>

                  <td>{index + 1}</td>

                  <td>{item.name}</td>

                  <td>{item.category}</td>

                  <td>{item.habitat}</td>

                  <td>

                    <span
                      className={
                        item.status === "Protected"
                          ? "stable"
                          : item.status === "Endangered"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {item.status}
                    </span>

                  </td>

                  <td>

                    <button
                      className="edit-btn"
                      onClick={() => editSpecies(item)}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteSpecies(item._id)
                      }
                    >
                      <FaTrash />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Species;