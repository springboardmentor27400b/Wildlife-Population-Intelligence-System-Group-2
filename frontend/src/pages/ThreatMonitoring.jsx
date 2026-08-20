import { useEffect, useState } from "react";
import { FaBell, FaMapMarkedAlt, FaExclamationTriangle } from "react-icons/fa";
import api from "../api/api";

function ThreatMonitoring() {
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await api.get("/conservation/monitoring");
      setMonitoringData(response.data || []);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "bg-danger";
    }

    if (priority === "Medium") {
      return "bg-warning text-dark";
    }

    return "bg-success";
  };

  const highPriorityCount = monitoringData.filter(
    (item) => item.monitoring_priority === "High"
  ).length;

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-danger">
          <FaBell className="me-2" />
          Threat Monitoring
        </h2>

        <p className="text-muted">
          Monitor wildlife observation coverage and identify areas
          requiring increased monitoring.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-5">

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body text-center p-4">
              <FaMapMarkedAlt
                size={40}
                className="text-primary mb-3"
              />

              <h2 className="fw-bold">
                {monitoringData.length}
              </h2>

              <p className="text-muted mb-0">
                Monitored Locations
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body text-center p-4">
              <FaExclamationTriangle
                size={40}
                className="text-danger mb-3"
              />

              <h2 className="fw-bold text-danger">
                {highPriorityCount}
              </h2>

              <p className="text-muted mb-0">
                High Priority Locations
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body text-center p-4">
              <FaBell
                size={40}
                className="text-warning mb-3"
              />

              <h2 className="fw-bold">
                {monitoringData.filter(
                  (item) =>
                    item.monitoring_priority === "Medium"
                ).length}
              </h2>

              <p className="text-muted mb-0">
                Medium Priority Locations
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Monitoring Table */}
      <div className="card border-0 shadow-lg">
        <div className="card-body p-4">

          <h4 className="fw-bold text-danger mb-1">
            Monitoring Priority
          </h4>

          <p className="text-muted">
            Locations are prioritized according to observation coverage.
          </p>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" />
              <p className="mt-3 text-muted">
                Loading monitoring data...
              </p>
            </div>
          ) : monitoringData.length === 0 ? (
            <div className="text-center py-5">
              <FaMapMarkedAlt
                size={45}
                className="text-muted mb-3"
              />

              <p className="text-muted">
                No monitoring data available.
              </p>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Location</th>
                    <th>Observation Count</th>
                    <th>Monitoring Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {monitoringData.map((item, index) => (
                    <tr key={index}>

                      <td className="fw-semibold">
                        <FaMapMarkedAlt className="me-2 text-primary" />
                        {item.location || "Unknown"}
                      </td>

                      <td>
                        {item.observation_count}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${getPriorityClass(
                            item.monitoring_priority
                          )}`}
                        >
                          {item.monitoring_priority}
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

export default ThreatMonitoring;