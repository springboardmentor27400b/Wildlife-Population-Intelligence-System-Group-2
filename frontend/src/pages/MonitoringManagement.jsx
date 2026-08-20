import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaClipboardCheck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCamera,
  FaSatelliteDish,
  FaMicrochip,
  FaTimes,
} from "react-icons/fa";


// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = import.meta.env.VITE_API_URL;

const MONITORING_API = `${API_URL}/admin/monitoring`;


// =====================================================
// COMPONENT
// =====================================================

function MonitoringManagement() {

  const navigate = useNavigate();


  // =====================================================
  // STATES
  // =====================================================

  const [systems, setSystems] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    type: "Camera Trap",
    location: "",
    status: "Active",
    lastMonitored: "",
  });


  // =====================================================
  // FETCH MONITORING SYSTEMS
  // GET /admin/monitoring
  // =====================================================

  const fetchSystems = async () => {

    try {

      setLoading(true);
      setError("");

      console.log(
        "Fetching monitoring systems:",
        MONITORING_API
      );

      const response = await fetch(
        MONITORING_API
      );

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Monitoring systems:",
        data
      );

      setSystems(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Fetch monitoring systems error:",
        err
      );

      setError(
        `Unable to load monitoring systems. ${err.message}`
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD DATA WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    fetchSystems();

  }, []);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setFormData({
      name: "",
      type: "Camera Trap",
      location: "",
      status: "Active",
      lastMonitored: "",
    });

    setEditingId(null);

    setShowForm(false);

  };


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleOpenAddForm = () => {

    setEditingId(null);

    setFormData({
      name: "",
      type: "Camera Trap",
      location: "",
      status: "Active",
      lastMonitored: "",
    });

    setShowForm(true);

  };


  // =====================================================
  // ADD / UPDATE SYSTEM
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.lastMonitored
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }


    try {

      setSubmitting(true);

      setError("");


      // =================================================
      // UPDATE
      // =================================================

      if (editingId !== null) {

        const response = await fetch(
          `${MONITORING_API}/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: formData.name,
              type: formData.type,
              location: formData.location,
              status: formData.status,
              last_monitored:
                formData.lastMonitored,
            }),
          }
        );


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            errorData?.detail ||
            "Failed to update monitoring system."
          );
        }


        alert(
          "Monitoring system updated successfully!"
        );

      }


      // =================================================
      // ADD
      // =================================================

      else {

        const response = await fetch(
          MONITORING_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: formData.name,
              type: formData.type,
              location: formData.location,
              status: formData.status,
              last_monitored:
                formData.lastMonitored,
            }),
          }
        );


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            errorData?.detail ||
            "Failed to add monitoring system."
          );
        }


        alert(
          "Monitoring system added successfully!"
        );

      }


      // =================================================
      // REFRESH DATA
      // =================================================

      await fetchSystems();

      resetForm();

    } catch (err) {

      console.error(
        "Add/Update monitoring system error:",
        err
      );

      alert(
        err.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setSubmitting(false);

    }

  };


  // =====================================================
  // EDIT SYSTEM
  // =====================================================

  const handleEdit = (system) => {

    setEditingId(system.id);

    setFormData({
      name: system.name || "",

      type:
        system.type ||
        "Camera Trap",

      location:
        system.location ||
        "",

      status:
        system.status ||
        "Active",

      lastMonitored:
        system.lastMonitored ||
        system.last_monitored ||
        "",
    });

    setShowForm(true);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =====================================================
  // DELETE SYSTEM
  // =====================================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this monitoring system?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      const response = await fetch(
        `${MONITORING_API}/${id}`,
        {
          method: "DELETE",
        }
      );


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
          "Failed to delete monitoring system."
        );
      }


      alert(
        "Monitoring system deleted successfully!"
      );


      await fetchSystems();

    } catch (err) {

      console.error(
        "Delete monitoring system error:",
        err
      );

      alert(
        err.message ||
        "Unable to delete monitoring system."
      );

    }

  };


  // =====================================================
  // TOGGLE STATUS
  // PUT /admin/monitoring/{id}/status
  // =====================================================

  const toggleStatus = async (system) => {

    const newStatus =
      system.status === "Active"
        ? "Inactive"
        : "Active";


    try {

      const response = await fetch(
        `${MONITORING_API}/${system.id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
          "Failed to update system status."
        );
      }


      await fetchSystems();

    } catch (err) {

      console.error(
        "Toggle status error:",
        err
      );

      alert(
        err.message ||
        "Unable to update system status."
      );

    }

  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalSystems =
    systems.length;


  const activeSystems =
    systems.filter(
      (system) =>
        system.status === "Active"
    ).length;


  const inactiveSystems =
    systems.filter(
      (system) =>
        system.status === "Inactive"
    ).length;


  const cameraSystems =
    systems.filter(
      (system) =>
        system.type === "Camera Trap"
    ).length;


  // =====================================================
  // SYSTEM ICON
  // =====================================================

  const getSystemIcon = (type) => {

    if (type === "Camera Trap") {

      return (
        <FaCamera
          className="me-2 text-success"
        />
      );

    }


    if (type === "GPS Tracker") {

      return (
        <FaSatelliteDish
          className="me-2 text-primary"
        />
      );

    }


    return (
      <FaMicrochip
        className="me-2 text-warning"
      />
    );

  };


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div
      className="container-fluid py-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold text-success">

            <FaClipboardCheck className="me-2" />

            Monitoring System Management

          </h2>


          <p className="text-muted mb-0">

            Manage wildlife monitoring systems,
            devices and monitoring status.

          </p>

        </div>


        <button
          className="btn btn-outline-success"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <FaArrowLeft className="me-2" />

          Back to Dashboard

        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="alert alert-danger">

          <strong>
            Error:
          </strong>{" "}

          {error}

          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchSystems}
          >
            Retry
          </button>

        </div>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="row g-4 mb-5">


        {/* TOTAL */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#198754",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <FaClipboardCheck
                  size={28}
                />

              </div>


              <h2 className="fw-bold mb-1">
                {totalSystems}
              </h2>


              <p className="text-muted mb-0">
                Total Systems
              </p>

            </div>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#0d6efd",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <FaSatelliteDish
                  size={28}
                />

              </div>


              <h2 className="fw-bold mb-1">
                {activeSystems}
              </h2>


              <p className="text-muted mb-0">
                Active Systems
              </p>

            </div>

          </div>

        </div>


        {/* INACTIVE */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#dc3545",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <FaMicrochip
                  size={28}
                />

              </div>


              <h2 className="fw-bold mb-1">
                {inactiveSystems}
              </h2>


              <p className="text-muted mb-0">
                Inactive Systems
              </p>

            </div>

          </div>

        </div>


        {/* CAMERA */}

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-lg h-100"
            style={{
              borderRadius: "20px",
            }}
          >

            <div className="card-body text-center p-4">

              <div
                className="mx-auto mb-3"
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#ffc107",
                  color: "#212529",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <FaCamera
                  size={28}
                />

              </div>


              <h2 className="fw-bold mb-1">
                {cameraSystems}
              </h2>


              <p className="text-muted mb-0">
                Camera Traps
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h4 className="fw-bold text-success mb-1">
            Monitoring Systems
          </h4>

          <p className="text-muted mb-0">
            View and manage registered monitoring
            systems.
          </p>

        </div>


        <button
          className="btn btn-success"
          onClick={handleOpenAddForm}
        >

          <FaPlus className="me-2" />

          Add Monitoring System

        </button>

      </div>


      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {showForm && (

        <div
          className="card border-0 shadow-lg mb-5"
          style={{
            borderRadius: "20px",
          }}
        >

          <div className="card-body p-4">


            <div className="d-flex justify-content-between align-items-center mb-4">

              <h4 className="fw-bold text-success mb-0">

                {editingId !== null
                  ? "Edit Monitoring System"
                  : "Add New Monitoring System"}

              </h4>


              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={resetForm}
              >

                <FaTimes />

              </button>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              <div className="row g-4">


                {/* NAME */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    System Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Example: Camera Trap - Zone C"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* TYPE */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Monitoring Type
                  </label>

                  <select
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleChange}
                  >

                    <option value="Camera Trap">
                      Camera Trap
                    </option>

                    <option value="GPS Tracker">
                      GPS Tracker
                    </option>

                    <option value="Environmental Sensor">
                      Environmental Sensor
                    </option>

                    <option value="Manual Survey">
                      Manual Survey
                    </option>

                  </select>

                </div>


                {/* LOCATION */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Protected Area / Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="Example: Tadoba Forest"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* STATUS */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* DATE */}

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Last Monitored
                  </label>

                  <input
                    type="date"
                    name="lastMonitored"
                    className="form-control"
                    value={
                      formData.lastMonitored
                    }
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* BUTTONS */}

                <div className="col-12">

                  <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={submitting}
                  >

                    {submitting ? (
                      "Saving..."
                    ) : (
                      <>
                        {editingId !== null ? (
                          <FaEdit className="me-2" />
                        ) : (
                          <FaPlus className="me-2" />
                        )}

                        {editingId !== null
                          ? "Update System"
                          : "Add System"}
                      </>
                    )}

                  </button>


                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          SYSTEM TABLE
      ================================================= */}

      <div
        className="card border-0 shadow-lg"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <div className="table-responsive">

            <table className="table align-middle">


              <thead
                style={{
                  background: "#2b5a444f",
                  color: "white",
                }}
              >

                <tr>

                  <th>ID</th>

                  <th>
                    System Name
                  </th>

                  <th>
                    Monitoring Type
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Last Monitored
                  </th>

                  <th className="text-center">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>


                {/* LOADING */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-5"
                    >

                      <div
                        className="spinner-border text-success"
                        role="status"
                      />

                      <p className="text-muted mt-3 mb-0">
                        Loading monitoring systems...
                      </p>

                    </td>

                  </tr>

                )


                /* DATA */

                : systems.length > 0 ? (

                  systems.map(
                    (system) => (

                      <tr
                        key={system.id}
                      >

                        <td>
                          {system.id}
                        </td>


                        <td className="fw-semibold">

                          {getSystemIcon(
                            system.type
                          )}

                          {system.name}

                        </td>


                        <td>
                          {system.type}
                        </td>


                        <td>

                          <FaMapMarkerAlt
                            className="text-danger me-2"
                          />

                          {system.location}

                        </td>


                        <td>

                          <button
                            className={`btn btn-sm ${
                              system.status ===
                              "Active"
                                ? "btn-success"
                                : "btn-secondary"
                            }`}
                            onClick={() =>
                              toggleStatus(
                                system
                              )
                            }
                          >

                            {system.status}

                          </button>

                        </td>


                        <td>

                          {system.lastMonitored ||
                            system.last_monitored ||
                            "-"}

                        </td>


                        <td className="text-center">


                          {/* EDIT */}

                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            title="Edit Monitoring System"
                            onClick={() =>
                              handleEdit(
                                system
                              )
                            }
                          >

                            <FaEdit />

                          </button>


                          {/* DELETE */}

                          <button
                            className="btn btn-outline-danger btn-sm"
                            title="Delete Monitoring System"
                            onClick={() =>
                              handleDelete(
                                system.id
                              )
                            }
                          >

                            <FaTrash />

                          </button>

                        </td>

                      </tr>

                    )
                  )

                )


                /* EMPTY */

                : (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-5 text-muted"
                    >

                      <FaClipboardCheck
                        size={35}
                        className="mb-3"
                      />

                      <p className="mb-0">
                        No monitoring systems found.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}


export default MonitoringManagement;