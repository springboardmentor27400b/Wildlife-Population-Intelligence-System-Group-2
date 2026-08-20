import { useEffect, useState } from "react";
import {
  FaTree,
  FaShieldAlt,
  FaClipboardCheck,
} from "react-icons/fa";
import api from "../api/api";

function RestorationRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get("/conservation/");

      setRecommendations(
        response.data?.recommendations || []
      );
    } catch (error) {
      console.error(
        "Error fetching restoration recommendations:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const restorationRecommendations =
    recommendations.filter((item) => {
      const text = item.toLowerCase();

      return (
        text.includes("habitat") ||
        text.includes("restoration") ||
        text.includes("protection") ||
        text.includes("resource")
      );
    });

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">

        <h2 className="fw-bold text-success">
          <FaTree className="me-2" />
          Restoration Recommendations
        </h2>

        <p className="text-muted">
          Recommended habitat restoration and wildlife protection
          actions based on current observation data.
        </p>

      </div>

      {/* Summary */}
      <div className="row g-4 mb-5">

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">

            <div className="card-body text-center p-4">

              <FaTree
                size={42}
                className="text-success mb-3"
              />

              <h2 className="fw-bold">
                {restorationRecommendations.length}
              </h2>

              <p className="text-muted mb-0">
                Recommended Actions
              </p>

            </div>

          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">

            <div className="card-body text-center p-4">

              <FaShieldAlt
                size={42}
                className="text-danger mb-3"
              />

              <h2 className="fw-bold text-danger">
                Wildlife Protection
              </h2>

              <p className="text-muted mb-0">
                Protection measures recommended
              </p>

            </div>

          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-lg h-100">

            <div className="card-body text-center p-4">

              <FaClipboardCheck
                size={42}
                className="text-primary mb-3"
              />

              <h2 className="fw-bold text-primary">
                Data Driven
              </h2>

              <p className="text-muted mb-0">
                Recommendations based on system data
              </p>

            </div>

          </div>
        </div>

      </div>

      {/* Recommendations */}
      <div className="card border-0 shadow-lg">

        <div className="card-body p-4">

          <h4 className="fw-bold text-success mb-1">
            🌳 Recommended Conservation Actions
          </h4>

          <p className="text-muted mb-4">
            Actions generated from the conservation recommendation
            engine.
          </p>

          {loading ? (
            <div className="text-center py-5">

              <div className="spinner-border text-success" />

              <p className="mt-3 text-muted">
                Loading recommendations...
              </p>

            </div>
          ) : restorationRecommendations.length === 0 ? (
            <div className="text-center py-5">

              <FaTree
                size={45}
                className="text-muted mb-3"
              />

              <p className="text-muted">
                No restoration recommendations available.
              </p>

            </div>
          ) : (
            <div className="row g-4">

              {restorationRecommendations.map(
                (recommendation, index) => (

                  <div
                    className="col-lg-6"
                    key={index}
                  >

                    <div
                      className="card border-0 shadow-sm h-100"
                      style={{
                        borderLeft:
                          "5px solid #198754",
                        borderRadius: "15px",
                      }}
                    >

                      <div className="card-body p-4">

                        <div className="d-flex">

                          <FaTree
                            className="text-success me-3 mt-1"
                            size={24}
                          />

                          <p className="mb-0">
                            {recommendation}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default RestorationRecommendations;