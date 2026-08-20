import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaPlus,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function IncidentReports() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [summary, setSummary] = useState({
    total_incidents: 0,
    open_incidents: 0,
    under_investigation: 0,
    resolved_incidents: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    incident_type: "",
    description: "",
    protected_area: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "MEDIUM",
    status: "OPEN",
    notes: "",
  });

  const token = localStorage.getItem("token");

  // =========================================================
  // FETCH INCIDENTS
  // =========================================================

  const fetchIncidents = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("GET incidents error:", data);
        throw new Error(
          data.detail || "Failed to fetch incidents"
        );
      }

      setIncidents(
        Array.isArray(data)
          ? data
          : data.incidents || []
      );

    } catch (error) {
      console.error("Incident fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // FETCH SUMMARY
  // =========================================================

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `${API_URL}/incidents/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Summary error:", data);
        return;
      }

      setSummary({
        total_incidents: data.total_incidents || 0,
        open_incidents: data.open_incidents || 0,
        under_investigation:
          data.under_investigation || 0,
        resolved_incidents:
          data.resolved_incidents || 0,
      });

    } catch (error) {
      console.error(
        "Incident summary error:",
        error
      );
    }
  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadIncidentData = async () => {
    await Promise.all([
      fetchIncidents(),
      fetchSummary(),
    ]);
  };


  useEffect(() => {
    loadIncidentData();
  }, []);


  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // =========================================================
  // REPORT INCIDENT
  // =========================================================

  const reportIncident = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        incident_type: formData.incident_type,
        description: formData.description,

        protected_area:
          formData.protected_area,

        location:
          formData.location,

        latitude:
          formData.latitude
            ? Number(formData.latitude)
            : null,

        longitude:
          formData.longitude
            ? Number(formData.longitude)
            : null,

        severity:
          formData.severity,

        status:
          formData.status,

        notes:
          formData.notes,
      };

      console.log(
        "Sending incident:",
        payload
      );

      const response = await fetch(
        `${API_URL}/incidents`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log(
        "Incident response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to report incident"
        );
      }

      alert(
        "Incident reported successfully!"
      );

      // Reset form
      setFormData({
        title: "",
        incident_type: "",
        description: "",
        protected_area: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "MEDIUM",
        status: "OPEN",
        notes: "",
      });

      setShowForm(false);

      // Refresh incidents + summary
      await loadIncidentData();

    } catch (error) {
      console.error(
        "Incident creation error:",
        error
      );

      alert(
        `Unable to report incident: ${error.message}`
      );
    }
  };


  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const openCount =
    summary.open_incidents;

  const investigationCount =
    summary.under_investigation;

  const resolvedCount =
    summary.resolved_incidents;


  // =========================================================
  // JSX
  // =========================================================

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f7faf8",
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}

      <div className="mb-4">
        <h2 className="fw-bold text-danger">
          <FaBell className="me-2" />
          Incident Reports
        </h2>

        <p className="text-muted">
          View and manage reported forest
          and wildlife incidents.
        </p>
      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="row g-4 mb-5">

        {/* TOTAL */}

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">

              <FaBell
                size={35}
                className="text-danger mb-3"
              />

              <h3 className="fw-bold">
                {summary.total_incidents}
              </h3>

              <p className="text-muted mb-0">
                Total Incidents
              </p>

            </div>
          </div>
        </div>


        {/* OPEN */}

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">

              <FaExclamationTriangle
                size={35}
                className="text-warning mb-3"
              />

              <h3 className="fw-bold">
                {openCount}
              </h3>

              <p className="text-muted mb-0">
                Open Incidents
              </p>

            </div>
          </div>
        </div>


        {/* INVESTIGATION */}

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">

              <FaClock
                size={35}
                className="text-primary mb-3"
              />

              <h3 className="fw-bold">
                {investigationCount}
              </h3>

              <p className="text-muted mb-0">
                Under Investigation
              </p>

            </div>
          </div>
        </div>


        {/* RESOLVED */}

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">

              <FaCheckCircle
                size={35}
                className="text-success mb-3"
              />

              <h3 className="fw-bold">
                {resolvedCount}
              </h3>

              <p className="text-muted mb-0">
                Resolved Incidents
              </p>

            </div>
          </div>
        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="card border-0 shadow-lg">

        <div className="card-body p-4">

          {/* TITLE */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h4 className="fw-bold text-danger">
                Reported Incidents
              </h4>

              <p className="text-muted mb-0">
                Forest and wildlife incident
                records.
              </p>

            </div>


            <button
              className="btn btn-danger"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              <FaPlus className="me-2" />
              Report Incident
            </button>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          {showForm && (

            <form
              onSubmit={reportIncident}
              className="card bg-light border-0 p-4 mb-4"
            >

              <div className="row g-3">


                {/* TITLE */}

                <div className="col-md-6">

                  <label className="form-label">
                    Incident Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* TYPE */}

                <div className="col-md-6">

                  <label className="form-label">
                    Incident Type
                  </label>

                  <select
                    name="incident_type"
                    className="form-select"
                    value={
                      formData.incident_type
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Type
                    </option>

                    <option value="POACHING">
                      Poaching
                    </option>

                    <option value="FOREST_FIRE">
                      Forest Fire
                    </option>

                    <option value="ANIMAL_CONFLICT">
                      Animal Conflict
                    </option>

                    <option value="ILLEGAL_ACTIVITY">
                      Illegal Activity
                    </option>

                    <option value="HABITAT_DAMAGE">
                      Habitat Damage
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>


                {/* PROTECTED AREA */}

                <div className="col-md-6">

                  <label className="form-label">
                    Protected Area
                  </label>

                  <input
                    type="text"
                    name="protected_area"
                    className="form-control"
                    value={
                      formData.protected_area
                    }
                    onChange={handleChange}
                    placeholder="e.g. Nashik Forest Division"
                  />

                </div>


                {/* LOCATION */}

                <div className="col-md-6">

                  <label className="form-label">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={
                      formData.location
                    }
                    onChange={handleChange}
                    placeholder="e.g. Near Forest Gate"
                    required
                  />

                </div>


                {/* LATITUDE */}

                <div className="col-md-6">

                  <label className="form-label">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    className="form-control"
                    value={
                      formData.latitude
                    }
                    onChange={handleChange}
                    placeholder="e.g. 20.0059"
                  />

                </div>


                {/* LONGITUDE */}

                <div className="col-md-6">

                  <label className="form-label">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    className="form-control"
                    value={
                      formData.longitude
                    }
                    onChange={handleChange}
                    placeholder="e.g. 73.7898"
                  />

                </div>


                {/* SEVERITY */}

                <div className="col-md-6">

                  <label className="form-label">
                    Severity
                  </label>

                  <select
                    name="severity"
                    className="form-select"
                    value={
                      formData.severity
                    }
                    onChange={handleChange}
                  >

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                  </select>

                </div>


                {/* STATUS */}

                <div className="col-md-6">

                  <label className="form-label">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={
                      formData.status
                    }
                    onChange={handleChange}
                  >

                    <option value="OPEN">
                      Open
                    </option>

                    <option value="UNDER_INVESTIGATION">
                      Under Investigation
                    </option>

                    <option value="RESOLVED">
                      Resolved
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="col-12">

                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Describe the incident..."
                    required
                  />

                </div>


                {/* NOTES */}

                <div className="col-12">

                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={
                      formData.notes
                    }
                    onChange={handleChange}
                    placeholder="Additional notes..."
                  />

                </div>


                {/* BUTTONS */}

                <div className="col-12">

                  <button
                    type="submit"
                    className="btn btn-danger me-2"
                  >
                    Submit Incident
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </form>
          )}


          {/* =================================================
                  INCIDENT TABLE
              ================================================= */}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" />

                  <p className="text-muted mt-3">
                    Loading incidents...
                  </p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-5">
                  <FaBell
                    size={60}
                    className="text-danger opacity-50 mb-3"
                  />

                  <h5>No incident reports available</h5>

                  <p className="text-muted">
                    Reported forest incidents will appear here.
                  </p>
                </div>
              ) : (
                <div
                  className="table-responsive"
                  style={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <table
                    className="table table-hover align-middle mb-0"
                    style={{
                      minWidth: "1100px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "180px" }}>Title</th>

                        <th style={{ minWidth: "160px" }}>
                          Type
                        </th>

                        <th style={{ minWidth: "200px" }}>
                          Protected Area
                        </th>

                        <th style={{ minWidth: "180px" }}>
                          Location
                        </th>

                        <th style={{ minWidth: "120px" }}>
                          Severity
                        </th>

                        <th style={{ minWidth: "180px" }}>
                          Status
                        </th>

                        <th style={{ minWidth: "180px" }}>
                          Reported At
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {incidents.map((incident) => (
                        <tr key={incident.id}>
                          <td>
                            {incident.title || "-"}
                          </td>

                          <td>
                            {incident.incident_type || "-"}
                          </td>

                          <td>
                            {incident.protected_area || "-"}
                          </td>

                          <td>
                            {incident.location || "-"}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                incident.severity === "CRITICAL"
                                  ? "bg-danger"
                                  : incident.severity === "HIGH"
                                  ? "bg-warning text-dark"
                                  : incident.severity === "MEDIUM"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                            >
                              {incident.severity || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                incident.status === "RESOLVED"
                                  ? "bg-success"
                                  : incident.status ===
                                    "UNDER_INVESTIGATION"
                                  ? "bg-primary"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {incident.status === "UNDER_INVESTIGATION"
                                ? "Under Investigation"
                                : incident.status === "RESOLVED"
                                ? "Resolved"
                                : "Open"}
                            </span>
                          </td>

                          <td>
                            {incident.reported_at
                              ? new Date(
                                  incident.reported_at
                                ).toLocaleString()
                              : "-"}
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

export default IncidentReports;