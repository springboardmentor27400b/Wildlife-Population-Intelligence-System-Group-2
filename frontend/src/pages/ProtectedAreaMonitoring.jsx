import React, { useEffect, useState } from "react";
import {
  FaTree,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../api/api";

function ProtectedAreaMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProtectedAreas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/protected-areas/summary");

      setData(response.data);
    } catch (err) {
      console.error(
        "Error loading protected areas:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load protected area data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtectedAreas();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="text-muted mt-3">
            Loading protected area data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f7faf8",
        minHeight: "100vh",
      }}
    >
      <div className="container">

        {/* HEADER */}

        <div className="mb-4">
          <h2 className="fw-bold text-success">
            <FaTree className="me-2" />
            Protected Area Monitoring
          </h2>

          <p className="text-muted">
            Monitor protected forest areas, their status
            and potential threats.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="alert alert-danger">
            {error}

            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchProtectedAreas}
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="row g-4 mb-5">

          {/* TOTAL */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <FaTree
                  size={35}
                  className="text-success mb-3"
                />

                <h3 className="fw-bold">
                  {data?.total_areas || 0}
                </h3>

                <p className="text-muted mb-0">
                  Protected Areas
                </p>

              </div>
            </div>
          </div>

          {/* MONITORED */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <FaMapMarkedAlt
                  size={35}
                  className="text-primary mb-3"
                />

                <h3 className="fw-bold">
                  {data?.monitored_areas || 0}
                </h3>

                <p className="text-muted mb-0">
                  Areas Monitored
                </p>

              </div>
            </div>
          </div>

          {/* SAFE */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <FaShieldAlt
                  size={35}
                  className="text-success mb-3"
                />

                <h3 className="fw-bold">
                  {data?.safe_areas || 0}
                </h3>

                <p className="text-muted mb-0">
                  Safe Areas
                </p>

              </div>
            </div>
          </div>

          {/* ALERT */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <FaExclamationTriangle
                  size={35}
                  className="text-danger mb-3"
                />

                <h3 className="fw-bold text-danger">
                  {data?.alert_areas || 0}
                </h3>

                <p className="text-muted mb-0">
                  Areas With Alerts
                </p>

              </div>
            </div>
          </div>

        </div>

        {/* AREA LIST */}

        <div className="card border-0 shadow-lg">
          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>
                <h4 className="fw-bold text-success">
                  Protected Area Status
                </h4>

                <p className="text-muted mb-0">
                  Current monitoring status of protected areas.
                </p>
              </div>

              <button
                className="btn btn-outline-success"
                onClick={fetchProtectedAreas}
              >
                Refresh
              </button>

            </div>

            {!data?.areas ||
            data.areas.length === 0 ? (
              <div className="text-center py-5">

                <FaTree
                  size={55}
                  className="text-success opacity-50 mb-3"
                />

                <h5>
                  No protected area data available
                </h5>

                <p className="text-muted">
                  Protected area records will appear
                  once survey data is available.
                </p>

              </div>
            ) : (
              <div className="row g-3">

                {data.areas.map((area) => (
                  <div
                    className="col-md-6 col-lg-4"
                    key={area.name}
                  >
                    <div className="card border shadow-sm h-100">

                      <div className="card-body">

                        <div className="d-flex justify-content-between align-items-start">

                          <h5 className="fw-bold">
                            {area.name}
                          </h5>

                          <span
                            className={`badge ${
                              area.status === "Safe"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {area.status}
                          </span>

                        </div>

                        <p className="text-muted mb-0">
                          Surveys: {area.surveys}
                        </p>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProtectedAreaMonitoring;