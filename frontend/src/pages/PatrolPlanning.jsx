import React, { useEffect, useState } from "react";
import {
  FaClipboardCheck,
  FaRoute,
  FaUsers,
  FaCalendarAlt,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function PatrolPlanning() {
  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    patrol_name: "",
    patrol_date: "",
    route: "",
    team_name: "",
    protected_area: "",
    status: "Planned",
    notes: "",
  });

  const token = localStorage.getItem("token");

  const fetchPatrols = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/patrols`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patrols");
      }

      const data = await response.json();
      setPatrols(Array.isArray(data) ? data : data.patrols || []);
    } catch (error) {
      console.error("Patrol fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrols();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createPatrol = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/patrols`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create patrol");
      }

      setFormData({
        patrol_name: "",
        patrol_date: "",
        protected_area: "",
        route: "",
        team_name: "",
        team_members: 0,
        notes: "",
      });

      setShowForm(false);
      fetchPatrols();
    } catch (error) {
      console.error("Create patrol error:", error);
      alert("Unable to create patrol");
    }
  };

  const planned = patrols.filter(
    (p) => String(p.status || "").trim().toLowerCase() === "planned"
  ).length;

  const completed = patrols.filter(
    (p) => String(p.status || "").trim().toLowerCase() === "completed"
  ).length;

  const routes = new Set(
    patrols
      .map((p) => p.route)
      .filter((route) => route && String(route).trim() !== "")
  ).size;

  const teams = new Set(
    patrols
      .map((p) => p.team_name)
      .filter((team) => team && String(team).trim() !== "")
  ).size;

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f7faf8",
        minHeight: "100vh",
      }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-warning">
          <FaClipboardCheck className="me-2" />
          Patrol Planning
        </h2>

        <p className="text-muted">
          Plan, monitor and manage forest patrol activities.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaCalendarAlt
                size={35}
                className="text-primary mb-3"
              />
              <h3 className="fw-bold">{planned}</h3>
              <p className="text-muted mb-0">
                Planned Patrols
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaRoute
                size={35}
                className="text-success mb-3"
              />
              <h3 className="fw-bold">{routes}</h3>
              <p className="text-muted mb-0">
                Patrol Routes
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaUsers
                size={35}
                className="text-info mb-3"
              />
              <h3 className="fw-bold">{teams}</h3>
              <p className="text-muted mb-0">
                Patrol Teams
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaCheckCircle
                size={35}
                className="text-success mb-3"
              />
              <h3 className="fw-bold">{completed}</h3>
              <p className="text-muted mb-0">
                Completed Patrols
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-lg">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold text-warning">
                Patrol Schedule
              </h4>

              <p className="text-muted mb-0">
                Planned forest patrol activities.
              </p>
            </div>

            <button
              className="btn btn-warning"
              onClick={() => setShowForm(!showForm)}
            >
              <FaPlus className="me-2" />
              Create Patrol
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={createPatrol}
              className="card bg-light border-0 p-4 mb-4"
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Patrol Name
                  </label>

                  <input
                    type="text"
                    name="patrol_name"
                    className="form-control"
                    value={formData.patrol_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Patrol Date
                  </label>

                  <input
                    type="date"
                    name="patrol_date"
                    className="form-control"
                    value={formData.patrol_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Route
                  </label>

                  <input
                    type="text"
                    name="route"
                    className="form-control"
                    value={formData.route}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Team
                  </label>

                  <input
                    type="text"
                    name="team_name"
                    className="form-control"
                    value={formData.team_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Protected Area
                  </label>

                  <input
                    type="text"
                    name="protected_area"
                    className="form-control"
                    value={formData.protected_area}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Number of Team Members
                  </label>

                  <input
                    type="number"
                    name="team_members"
                    className="form-control"
                    min="0"
                    value={formData.team_members}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success me-2"
                  >
                    Save Patrol
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" />
              <p className="text-muted mt-3">
                Loading patrols...
              </p>
            </div>
          ) : patrols.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardCheck
                size={60}
                className="text-warning opacity-50 mb-3"
              />

              <h5>No patrols planned</h5>

              <p className="text-muted">
                Create a patrol to start planning forest activities.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Patrol</th>
                    <th>Date</th>
                    <th>Area</th>
                    <th>Route</th>
                    <th>Team</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {patrols.map((patrol) => (
                    <tr key={patrol.id}>
                      <td>{patrol.patrol_name}</td>
                      <td>{patrol.patrol_date}</td>
                      <td>{patrol.protected_area || "-"}</td>
                      <td>{patrol.route || "-"}</td>
                      <td>{patrol.team_name || "-"}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {patrol.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatrolPlanning;