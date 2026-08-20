import React, { useEffect, useState } from "react";
import {
  FaRoute,
  FaPaw,
  FaMapMarkedAlt,
  FaChartLine,
} from "react-icons/fa";
import api from "../api/api";

function WildlifeMovement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMovementData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/wildlife-movement/summary"
      );

      setData(response.data);
    } catch (err) {
      console.error(
        "Error loading wildlife movement:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load wildlife movement data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovementData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />

          <p className="text-muted mt-3">
            Loading wildlife movement data...
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

          <h2 className="fw-bold text-primary">
            <FaRoute className="me-2" />
            Wildlife Movement Analysis
          </h2>

          <p className="text-muted">
            Analyze wildlife movement patterns,
            locations and activity areas.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="alert alert-danger">
            {error}

            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchMovementData}
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="row g-4 mb-5">

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">

              <div className="card-body text-center">

                <FaPaw
                  size={35}
                  className="text-success mb-3"
                />

                <h3 className="fw-bold">
                  {data?.animals_tracked || 0}
                </h3>

                <p className="text-muted mb-0">
                  Animals Tracked
                </p>

              </div>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">

              <div className="card-body text-center">

                <FaRoute
                  size={35}
                  className="text-primary mb-3"
                />

                <h3 className="fw-bold">
                  {data?.movement_records || 0}
                </h3>

                <p className="text-muted mb-0">
                  Movement Records
                </p>

              </div>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">

              <div className="card-body text-center">

                <FaMapMarkedAlt
                  size={35}
                  className="text-warning mb-3"
                />

                <h3 className="fw-bold">
                  {data?.active_zones || 0}
                </h3>

                <p className="text-muted mb-0">
                  Active Zones
                </p>

              </div>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">

              <div className="card-body text-center">

                <FaChartLine
                  size={35}
                  className="text-info mb-3"
                />

                <h3 className="fw-bold">
                  {data?.movement_events || 0}
                </h3>

                <p className="text-muted mb-0">
                  Movement Events
                </p>

              </div>

            </div>
          </div>

        </div>

        {/* MOVEMENT DATA */}

        <div className="card border-0 shadow-lg">

          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>
                <h4 className="fw-bold text-primary">
                  Wildlife Movement Records
                </h4>

                <p className="text-muted mb-0">
                  Recorded wildlife locations and movement events.
                </p>
              </div>

              <button
                className="btn btn-outline-primary"
                onClick={fetchMovementData}
              >
                Refresh
              </button>

            </div>

            {!data?.movements ||
            data.movements.length === 0 ? (
              <div className="text-center py-5">

                <FaMapMarkedAlt
                  size={60}
                  className="text-primary opacity-50 mb-3"
                />

                <h5>
                  No movement data available
                </h5>

                <p className="text-muted">
                  Wildlife observations containing
                  latitude and longitude will appear here.
                </p>

              </div>
            ) : (
              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-light">
                    <tr>
                      <th>Species</th>
                      <th>Location</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Population</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {data.movements.map(
                      (movement) => (
                        <tr key={movement.id}>

                          <td>
                            <strong>
                              {movement.species}
                            </strong>
                          </td>

                          <td>
                            {movement.location ||
                              "Unknown"}
                          </td>

                          <td>
                            {movement.latitude}
                          </td>

                          <td>
                            {movement.longitude}
                          </td>

                          <td>
                            {movement.population_count ??
                              0}
                          </td>

                          <td>
                            {movement.observation_date
                              ? new Date(
                                  movement.observation_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "Unknown"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default WildlifeMovement;