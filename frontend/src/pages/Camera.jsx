import "./Camera.css";

import {
  FaSearch,
  FaPlus,
  FaVideo,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../services/api";

function Camera() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    cameraName: "",
    location: "",
    status: "Active",
    zone: "",
  });

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await API.get("/camera");
        setCameras(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const res = await API.get("/camera");
      setCameras(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setEditingId(null);

    setForm({
      cameraName: "",
      location: "",
      zone: "",
      status: "Active",
    });
  };

  const saveCamera = async () => {
    try {
      if (
        !form.cameraName ||
        !form.location ||
        !form.zone
      ) {
        alert("Please Fill All Fields");
        return;
      }

      if (editingId) {
        await API.put(
          `/camera/${editingId}`,
          form
        );

        alert("Camera Updated");
      } else {
        await API.post(
          "/camera",
          form
        );

        alert("Camera Added");
      }

      clearForm();
      await fetchCameras();
    } catch (err) {
      console.log(err);
    }
  };

  const editCamera = (item) => {
    setEditingId(item._id);

    setForm({
      cameraName: item.cameraName,
      location: item.location,
      zone: item.zone,
      status: item.status,
    });
  };

  const deleteCamera = async (id) => {
    if (!window.confirm("Delete Camera?")) {
      return;
    }

    try {
      await API.delete(`/camera/${id}`);
      await fetchCameras();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredData = cameras.filter((item) =>
    item.cameraName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="camera">
      <div className="camera-header">
        <h1>Camera Monitoring</h1>

        <div className="header-actions">
          <div className="search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search Camera..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            className="add-btn"
            onClick={saveCamera}
          >
            <FaPlus />

            {editingId
              ? "Update Camera"
              : "Add Camera"}
          </button>
        </div>
      </div>

      <div className="form-section">
        <input
          type="text"
          name="cameraName"
          placeholder="Camera Name"
          value={form.cameraName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <input
          type="text"
          name="zone"
          placeholder="Zone"
          value={form.zone}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Active</option>
          <option>Offline</option>
          <option>Maintenance</option>
        </select>
      </div>

      <div className="camera-cards">
        <div className="camera-card">
          <FaVideo />
          <h2>{cameras.length}</h2>
          <p>Total Cameras</p>
        </div>

        <div className="camera-card">
          <FaVideo />
          <h2>
            {
              cameras.filter(
                (item) => item.status === "Active"
              ).length
            }
          </h2>
          <p>Active</p>
        </div>

        <div className="camera-card">
          <FaVideo />
          <h2>
            {
              cameras.filter(
                (item) => item.status === "Offline"
              ).length
            }
          </h2>
          <p>Offline</p>
        </div>

        <div className="camera-card">
          <FaVideo />
          <h2>
            {
              cameras.filter(
                (item) =>
                  item.status === "Maintenance"
              ).length
            }
          </h2>
          <p>Maintenance</p>
        </div>
      </div>

      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Camera</th>
              <th>Location</th>
              <th>Zone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6">
                  No Camera Found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>

                  <td>{item.cameraName}</td>

                  <td>{item.location}</td>

                  <td>{item.zone}</td>

                  <td>
                    <span
                      className={
                        item.status === "Active"
                          ? "stable"
                          : item.status === "Offline"
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
                      onClick={() =>
                        editCamera(item)
                      }
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteCamera(item._id)
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

export default Camera;