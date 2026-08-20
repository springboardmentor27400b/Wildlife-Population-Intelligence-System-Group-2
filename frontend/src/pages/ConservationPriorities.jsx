import { useEffect, useState } from "react";
import {
  FaShieldAlt,
  FaPaw,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../api/api";

function ConservationPriorities() {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    try {
      const response = await api.get("/conservation/priority");
      setPriorities(response.data || []);
    } catch (error) {
      console.error("Error fetching conservation priorities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === "Critical") return "bg-danger";
    if (priority === "High") return "bg-danger";
    if (priority === "Moderate") return "bg-warning text-dark";
    return "bg-success";
  };

  const criticalCount = priorities.filter(
    (item) => item.priority === "Critical"
  ).length;

  const highCount = priorities.filter(
    (item) => item.priority === "High"
  ).length;

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-success">
          <FaShieldAlt className="me-2" />
          Conservation Priorities
        </h2>

        <p className="text-muted">
          Identify species requiring immediate conservation attention
          based on their conservation status.
        </p>
      </div>

      {/* Summary */}
      <div className="row g-4 mb-5">

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center p-4">
              <FaPaw
                size={40}
                className="text-primary mb-3"
              />

              <h2 className="fw-bold">
                {priorities.length}
              </h2>

              <p className="text-muted mb-0">
                Species Evaluated
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center p-4">
              <FaExclamationTriangle
                size={40}
                className="text-danger mb-3"
              />

              <h2 className="fw-bold text-danger">
                {criticalCount}
              </h2>

              <p className="text-muted mb-0">
                Critical Species
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center p-4">

              <FaShieldAlt
                size={40}
                className="text-warning mb-3"
              />

              <h2 className="fw-bold">
                {highCount}
              </h2>

              <p className="text-muted mb-0">
                High Priority Species
              </p>

            </div>
          </div>
        </div>

      </div>

      {/* Priority Table */}
      <div className="card border-0 shadow-lg">

        <div className="card-body p-4">

          <h4 className="fw-bold text-success">
            Species Conservation Priority
          </h4>

          <p className="text-muted">
            Species are ranked according to their conservation status.
          </p>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" />
              <p className="mt-3 text-muted">
                Loading conservation priorities...
              </p>
            </div>
          ) : priorities.length === 0 ? (
            <p className="text-center text-muted py-5">
              No conservation priority data available.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Species</th>
                    <th>Conservation Status</th>
                    <th>Observed Population</th>
                    <th>Priority Score</th>
                    <th>Priority</th>
                  </tr>
                </thead>

                <tbody>

                  {priorities.map((item) => (
                    <tr key={item.species_id}>

                      <td className="fw-semibold">
                        🐾 {item.species}
                      </td>

                      <td>
                        {item.conservation_status}
                      </td>

                      <td>
                        {item.observed_population}
                      </td>

                      <td>
                        <strong>
                          {item.priority_score}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${getPriorityClass(
                            item.priority
                          )}`}
                        >
                          {item.priority}
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

export default ConservationPriorities;