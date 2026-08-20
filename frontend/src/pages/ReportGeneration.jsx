import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaFileAlt,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaDownload,
  FaArrowLeft,
  FaEye,
  FaClipboardList,
  FaPaw,
  FaMapMarkerAlt,
  FaTimes,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function ReportGeneration() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [surveys, setSurveys] = useState([]);

  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const [loading, setLoading] = useState(true);

  const [reportLoading, setReportLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD ALL SURVEYS
  // =====================================================

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reports/wildlife-survey`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to load wildlife survey reports."
        );
      }

      const data = await response.json();

      setSurveys(data.surveys || []);
    } catch (error) {
      console.error(
        "Fetch reports error:",
        error
      );

      setError(
        error.message ||
          "Unable to load reports. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    fetchSurveys();
  }, []);

  // =====================================================
  // VIEW SINGLE REPORT
  // =====================================================

  const viewReport = async (surveyId) => {
    try {
      setReportLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reports/wildlife-survey/${surveyId}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to load survey report."
        );
      }

      const data = await response.json();

      setSelectedSurvey(data);
    } catch (error) {
      console.error(
        "View report error:",
        error
      );

      setError(
        error.message ||
          "Unable to load survey report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  // =====================================================
  // CLOSE REPORT
  // =====================================================

  const closeReport = () => {
    setSelectedSurvey(null);
  };

  // =====================================================
  // DOWNLOAD FILE
  // =====================================================

  const downloadReport = async (
    url,
    defaultFileName
  ) => {
    try {
      setError("");

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Unable to generate report."
        );
      }

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download = defaultFileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );
    } catch (error) {
      console.error(
        "Download report error:",
        error
      );

      setError(
        error.message ||
          "Unable to download report."
      );
    }
  };

  // =====================================================
  // DOWNLOAD ALL PDF
  // =====================================================

  const downloadAllPDF = () => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/all/pdf`,
      "all_wildlife_surveys.pdf"
    );
  };

  // =====================================================
  // DOWNLOAD ALL EXCEL
  // =====================================================

  const downloadAllExcel = () => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/all/excel`,
      "all_wildlife_surveys.xlsx"
    );
  };

  // =====================================================
  // DOWNLOAD ALL CSV
  // =====================================================

  const downloadAllCSV = () => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/all/csv`,
      "all_wildlife_surveys.csv"
    );
  };

  // =====================================================
  // SINGLE SURVEY PDF
  // =====================================================

  const downloadSinglePDF = (surveyId) => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/${surveyId}/pdf`,
      `survey_${surveyId}_wildlife_report.pdf`
    );
  };

  // =====================================================
  // SINGLE SURVEY EXCEL
  // =====================================================

  const downloadSingleExcel = (surveyId) => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/${surveyId}/excel`,
      `survey_${surveyId}_wildlife_report.xlsx`
    );
  };

  // =====================================================
  // SINGLE SURVEY CSV
  // =====================================================

  const downloadSingleCSV = (surveyId) => {
    downloadReport(
      `${API_URL}/reports/wildlife-survey/${surveyId}/csv`,
      `survey_${surveyId}_wildlife_report.csv`
    );
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalSurveys = surveys.length;

  const totalObservations = surveys.reduce(
    (total, report) =>
      total +
      Number(
        report.summary?.total_observations || 0
      ),
    0
  );

  const totalSpecies = new Set();

  const totalLocations = new Set();

  surveys.forEach((report) => {
    (report.observations || []).forEach(
      (observation) => {
        if (observation.species_id !== null) {
          totalSpecies.add(
            observation.species_id
          );
        }

        if (observation.location) {
          totalLocations.add(
            observation.location
          );
        }
      }
    );
  });

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
            <FaFileAlt className="me-2" />

            Report Generation
          </h2>

          <p className="text-muted mb-0">
            Generate and download wildlife survey
            reports in PDF, Excel and CSV formats.
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
        <div
          className="alert alert-danger alert-dismissible"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="row g-4 mb-5">

        {/* TOTAL SURVEYS */}

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
                <FaClipboardList size={28} />
              </div>

              <h2 className="fw-bold mb-1">
                {totalSurveys}
              </h2>

              <p className="text-muted mb-0">
                Total Surveys
              </p>
            </div>
          </div>
        </div>

        {/* TOTAL OBSERVATIONS */}

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
                <FaPaw size={28} />
              </div>

              <h2 className="fw-bold mb-1">
                {totalObservations}
              </h2>

              <p className="text-muted mb-0">
                Total Observations
              </p>
            </div>
          </div>
        </div>

        {/* SPECIES */}

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
                <FaPaw size={28} />
              </div>

              <h2 className="fw-bold mb-1">
                {totalSpecies.size}
              </h2>

              <p className="text-muted mb-0">
                Species Recorded
              </p>
            </div>
          </div>
        </div>

        {/* LOCATIONS */}

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
                <FaMapMarkerAlt size={28} />
              </div>

              <h2 className="fw-bold mb-1">
                {totalLocations.size}
              </h2>

              <p className="text-muted mb-0">
                Monitoring Locations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          DOWNLOAD ALL REPORTS
      ================================================= */}

      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>
              <h4 className="fw-bold text-success mb-1">
                Complete Wildlife Survey Report
              </h4>

              <p className="text-muted mb-0">
                Download reports containing all
                registered wildlife surveys.
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-danger"
                onClick={downloadAllPDF}
              >
                <FaFilePdf className="me-2" />

                PDF
              </button>

              <button
                className="btn btn-success"
                onClick={downloadAllExcel}
              >
                <FaFileExcel className="me-2" />

                Excel
              </button>

              <button
                className="btn btn-primary"
                onClick={downloadAllCSV}
              >
                <FaFileCsv className="me-2" />

                CSV
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SURVEY REPORTS
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="fw-bold text-success mb-1">
            Individual Survey Reports
          </h4>

          <p className="text-muted mb-0">
            View or download a report for a specific
            wildlife survey.
          </p>
        </div>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div
          className="card border-0 shadow-lg"
          style={{
            borderRadius: "20px",
          }}
        >
          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-success"
              role="status"
            />

            <p className="text-muted mt-3 mb-0">
              Loading survey reports...
            </p>

          </div>
        </div>

      ) : surveys.length === 0 ? (

        /* =================================================
           NO DATA
        ================================================= */

        <div
          className="card border-0 shadow-lg"
          style={{
            borderRadius: "20px",
          }}
        >
          <div className="card-body text-center py-5">

            <FaFileAlt
              size={45}
              className="text-muted mb-3"
            />

            <h5 className="fw-bold">
              No Survey Reports Found
            </h5>

            <p className="text-muted mb-0">
              Create a wildlife survey first to
              generate reports.
            </p>

          </div>
        </div>

      ) : (

        /* =================================================
           SURVEY TABLE
        ================================================= */

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
                    background: "#198754",
                    color: "white",
                  }}
                >
                  <tr>
                    <th>#</th>
                    <th>Survey ID</th>
                    <th>Survey Name</th>
                    <th>Date</th>
                    <th>Protected Area</th>
                    <th>Observations</th>
                    <th>Status</th>
                    <th className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {surveys.map(
                    (report, index) => {

                      const survey =
                        report.survey;

                      const summary =
                        report.summary;

                      return (
                        <tr
                          key={
                            survey.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td className="fw-semibold">
                            {survey.survey_id ||
                              "-"}
                          </td>

                          <td>
                            {survey.title ||
                              "-"}
                          </td>

                          <td>
                            {survey.survey_date ||
                              "-"}
                          </td>

                          <td>
                            <FaMapMarkerAlt className="text-danger me-2" />

                            {survey.protected_area ||
                              "-"}
                          </td>

                          <td>
                            <span className="badge bg-primary">
                              {
                                summary?.total_observations ||
                                0
                              }
                            </span>
                          </td>

                          <td>

                            <span
                              className={`badge ${
                                survey.status ===
                                "Active"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {survey.status ||
                                "-"}
                            </span>

                          </td>

                          <td className="text-center">

                            {/* VIEW */}

                            <button
                              className="btn btn-outline-success btn-sm me-2"
                              title="View Report"
                              onClick={() =>
                                viewReport(
                                  survey.id
                                )
                              }
                            >
                              <FaEye />
                            </button>

                            {/* PDF */}

                            <button
                              className="btn btn-outline-danger btn-sm me-2"
                              title="Download PDF"
                              onClick={() =>
                                downloadSinglePDF(
                                  survey.id
                                )
                              }
                            >
                              <FaFilePdf />
                            </button>

                            {/* EXCEL */}

                            <button
                              className="btn btn-outline-success btn-sm me-2"
                              title="Download Excel"
                              onClick={() =>
                                downloadSingleExcel(
                                  survey.id
                                )
                              }
                            >
                              <FaFileExcel />
                            </button>

                            {/* CSV */}

                            <button
                              className="btn btn-outline-primary btn-sm"
                              title="Download CSV"
                              onClick={() =>
                                downloadSingleCSV(
                                  survey.id
                                )
                              }
                            >
                              <FaFileCsv />
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          REPORT VIEW MODAL
      ================================================= */}

      {selectedSurvey && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            background:
              "rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
          >
            <div className="modal-content">

              {/* HEADER */}

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold text-success">
                    <FaFileAlt className="me-2" />

                    Wildlife Survey Report
                  </h5>

                  <small className="text-muted">
                    {selectedSurvey.survey
                      ?.survey_id || "-"}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeReport}
                />

              </div>

              {/* BODY */}

              <div className="modal-body">

                {/* SURVEY DETAILS */}

                <h5 className="fw-bold text-success mb-3">
                  Survey Details
                </h5>

                <div className="row g-3 mb-4">

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Survey Name
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey?.title ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Survey Date
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.survey_date ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Protected Area
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.protected_area ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Habitat Type
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.habitat_type ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Monitoring Location
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.monitoring_location ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Monitoring Device
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.monitoring_device ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Researcher
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey
                            ?.researcher_name ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3">
                      <strong>
                        Status
                      </strong>

                      <div>
                        {
                          selectedSurvey
                            .survey?.status ||
                          "-"
                        }
                      </div>
                    </div>
                  </div>

                </div>

                {/* SUMMARY */}

                <h5 className="fw-bold text-success mb-3">
                  Survey Summary
                </h5>

                <div className="row g-3 mb-4">

                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <h3 className="fw-bold">
                          {
                            selectedSurvey
                              .summary
                              ?.total_observations ||
                            0
                          }
                        </h3>

                        <p className="mb-0 text-muted">
                          Observations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <h3 className="fw-bold">
                          {
                            selectedSurvey
                              .summary
                              ?.species_recorded ||
                            0
                          }
                        </h3>

                        <p className="mb-0 text-muted">
                          Species
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body text-center">
                        <h3 className="fw-bold">
                          {
                            selectedSurvey
                              .summary
                              ?.locations ||
                            0
                          }
                        </h3>

                        <p className="mb-0 text-muted">
                          Locations
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* OBSERVATIONS */}

                <h5 className="fw-bold text-success mb-3">
                  Wildlife Observations
                </h5>

                <div className="table-responsive">

                  <table className="table table-bordered table-sm align-middle">

                    <thead className="table-success">

                      <tr>
                        <th>ID</th>
                        <th>Species</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Observer</th>
                        <th>Population</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Notes</th>
                      </tr>

                    </thead>

                    <tbody>

                      {(
                        selectedSurvey.observations ||
                        []
                      ).length === 0 ? (

                        <tr>
                          <td
                            colSpan="9"
                            className="text-center text-muted py-4"
                          >
                            No observations found.
                          </td>
                        </tr>

                      ) : (

                        selectedSurvey.observations.map(
                          (observation) => (

                            <tr
                              key={
                                observation.id
                              }
                            >

                              <td>
                                {
                                  observation.id
                                }
                              </td>

                              <td className="fw-semibold">
                                {
                                  observation.species_name
                                }
                              </td>

                              <td>
                                {
                                  observation.location ||
                                  "-"
                                }
                              </td>

                              <td>
                                {
                                  observation.observation_date ||
                                  "-"
                                }
                              </td>

                              <td>
                                {
                                  observation.observer_name ||
                                  "-"
                                }
                              </td>

                              <td>
                                {
                                  observation.population_count ??
                                  0
                                }
                              </td>

                              <td>
                                {
                                  observation.latitude ??
                                  "-"
                                }
                              </td>

                              <td>
                                {
                                  observation.longitude ??
                                  "-"
                                }
                              </td>

                              <td>
                                {
                                  observation.notes ||
                                  "-"
                                }
                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={closeReport}
                >
                  <FaTimes className="me-2" />

                  Close
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadSinglePDF(
                      selectedSurvey.survey.id
                    )
                  }
                >
                  <FaFilePdf className="me-2" />

                  PDF
                </button>

                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadSingleExcel(
                      selectedSurvey.survey.id
                    )
                  }
                >
                  <FaFileExcel className="me-2" />

                  Excel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    downloadSingleCSV(
                      selectedSurvey.survey.id
                    )
                  }
                >
                  <FaFileCsv className="me-2" />

                  CSV
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =================================================
          REPORT LOADING
      ================================================= */}

      {reportLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "rgba(0,0,0,0.4)",
            zIndex: 2000,
          }}
        >
          <div className="bg-white rounded-4 p-4 text-center shadow">

            <div
              className="spinner-border text-success"
              role="status"
            />

            <p className="mt-3 mb-0">
              Loading report...
            </p>

          </div>
        </div>
      )}

    </div>
  );
}

export default ReportGeneration;