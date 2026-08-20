
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  FaArrowLeft,
  FaClipboardList,
  FaUsers,
  FaPaw,
  FaTree,
  FaShieldAlt,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaImage,
  FaTimes,
  FaDownload,
} from "react-icons/fa";

function Reports() {
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState(null);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [expandedSurvey, setExpandedSurvey] = useState(null);
  const [expandedObservations, setExpandedObservations] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);

  const [expandedSpecies, setExpandedSpecies] = useState(null);
  const [speciesReportData, setSpeciesReportData] = useState(null);

  const [biodiversityReportData, setBiodiversityReportData] = useState(null);
  const [expandedBiodiversitySpecies, setExpandedBiodiversitySpecies] = useState(null);

  const [habitatReportData, setHabitatReportData] = useState(null);
  const [expandedHabitat, setExpandedHabitat] = useState(null);

  const [expandedConservation, setExpandedConservation] = useState(null);
  const [conservationReportData, setConservationReportData] = useState(null);

  // =====================================================
  // FETCH WILDLIFE SURVEY REPORT
  // =====================================================

  const fetchWildlifeSurveyReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports/wildlife-survey");

      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching wildlife survey report:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated. Please login again.");
      } else {
        setError("Unable to load wildlife survey report.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH SPECIES POPULATION REPORT
  // =====================================================

  const fetchSpeciesPopulationReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/species-population"
      );

      console.log(
        "Species population report:",
        response.data
      );

      setSpeciesReportData(response.data);

    } catch (err) {
      console.error(
        "Error fetching species population report:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "You are not authenticated. Please login again."
        );
      } else {
        setError(
          "Unable to load species population report."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH BIODIVERSITY REPORT
  // =====================================================

  const fetchBiodiversityReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/biodiversity"
      );

      console.log(
        "Biodiversity report:",
        response.data
      );

      setBiodiversityReportData(response.data);

    } catch (err) {

      console.error(
        "Error fetching biodiversity report:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "You are not authenticated. Please login again."
        );
      } else {
        setError(
          "Unable to load biodiversity report."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH HABITAT ASSESSMENT REPORT
  // =====================================================

  const fetchHabitatReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/habitat"
      );

      console.log(
        "Habitat assessment report:",
        response.data
      );

      setHabitatReportData(
        response.data
      );

    } catch (err) {

      console.error(
        "Error fetching habitat report:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "You are not authenticated. Please login again."
        );
      } else {
        setError(
          "Unable to load habitat assessment report."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FETCH CONSERVATION REPORT
  // =====================================================

  const fetchConservationReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/conservation"
      );

      console.log(
        "Conservation report:",
        response.data
      );

      setConservationReportData(
        response.data
      );

    } catch (err) {
      console.error(
        "Error fetching conservation report:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "You are not authenticated. Please login again."
        );
      } else {
        setError(
          "Unable to load conservation report."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN / CLOSE REPORT
  // =====================================================

  const handleReportClick = (reportType) => {
    if (selectedReport === reportType) {
      setSelectedReport(null);
      return;
    }

    setSelectedReport(reportType);

    if (reportType === "survey") {
      fetchWildlifeSurveyReport();
    }

    if (reportType === "population") {
      fetchSpeciesPopulationReport();
    }

    if (reportType === "biodiversity") {
      fetchBiodiversityReport();
    }

    if (reportType === "habitat") {
      fetchHabitatReport();
    }

    if (reportType === "conservation") {
      fetchConservationReport();
    }
  };

  // =====================================================
  // SURVEY DETAILS
  // =====================================================

  const toggleSurveyDetails = (surveyId) => {
    setExpandedSurvey((previous) =>
      previous === surveyId ? null : surveyId
    );
  };

  // =====================================================
  // SPECIES DETAILS TOGGLE
  // =====================================================

  const toggleSpeciesDetails = (speciesId) => {
    setExpandedSpecies((previous) =>
      previous === speciesId ? null : speciesId
    );
  };
  
  // ====================================================
  // BIODIVERSITY SPECIES DETAILS TOGGLE
  // ====================================================
    const toggleBiodiversitySpeciesDetails = (speciesId) => {
      setExpandedBiodiversitySpecies((previous) =>
        previous === speciesId ? null : speciesId
      );
    };

  // =====================================================
  // HABITAT DETAILS TOGGLE
  // =====================================================

    const toggleHabitatDetails = (habitatName) => {
      setExpandedHabitat((previous) =>
        previous === habitatName
          ? null
          : habitatName
      );
    };

  // =====================================================
  // CONSERVATION DETAILS TOGGLE
  // =====================================================

  const toggleConservationDetails = (
    conservationStatus
  ) => {
    setExpandedConservation((previous) =>
      previous === conservationStatus
        ? null
        : conservationStatus
    );
  };

  // =====================================================
  // OBSERVATIONS
  // =====================================================

  const toggleObservations = (surveyId) => {
    setExpandedObservations((previous) => ({
      ...previous,
      [surveyId]: !previous[surveyId],
    }));
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${import.meta.env.VITE_API_URL}/${path.replace(/^\/+/, "")}`;
  };

  // =====================================================
  // DOWNLOAD FILE
  // =====================================================

const downloadFile = async (url, filename) => {
  try {
    console.log("Export URL:", url);

    const response = await api.get(url, {
      responseType: "blob",
    });

    console.log("Export response:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);

    const blob = new Blob(
      [response.data],
      {
        type:
          response.headers["content-type"] ||
          "application/octet-stream",
      }
    );

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {

    console.error("========== EXPORT ERROR ==========");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Headers:", err.response?.headers);
    console.error("Message:", err.message);
    console.error("URL:", url);
    console.error("=================================");

    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
    } else if (err.response?.status === 404) {
      alert("Export endpoint not found.");
    } else if (err.response?.status === 500) {
      alert("Server error while generating report.");
    } else {
      alert("Unable to export report.");
    }
  }
};

  // =====================================================
  // REPORT CARD
  // =====================================================

  const ReportCard = ({
    icon,
    title,
    description,
    background,
    reportType,
  }) => {
    const isSelected = selectedReport === reportType;

    return (
      <div className="col-lg-4 col-md-6">
        <div
          className="card border-0 shadow-lg h-100"
          style={{
            borderRadius: "20px",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onClick={() => handleReportClick(reportType)}
        >
          <div className="card-body p-4 text-center">

            <div
              className="mx-auto mb-4"
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                background,
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </div>

            <h4 className="fw-bold">
              {title}
            </h4>

            <p className="text-muted mb-4">
              {description}
            </p>

            <button
              className={`btn ${
                isSelected
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                handleReportClick(reportType);
              }}
            >
              {isSelected ? "Hide Report" : "View Report"}
            </button>

          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // SUMMARY CARD
  // =====================================================

  const SummaryCard = ({
    icon,
    value,
    title,
    iconClass = "text-success",
  }) => {
    return (
      <div className="col-md-3">
        <div
          className="p-4 rounded-4 bg-light text-center h-100"
          style={{
            border: "1px solid #e8e8e8",
          }}
        >
          {icon}

          <h3 className="fw-bold mb-1">
            {value ?? 0}
          </h3>

          <p className="text-muted mb-0">
            {title}
          </p>
        </div>
      </div>
    );
  };

  // =====================================================
  // OBSERVATION DETAIL
  // =====================================================

  const ObservationDetails = ({ observation }) => {
    const imageUrl = getImageUrl(observation.image_path);

    return (
      <div
        className="card border-0 shadow-sm mb-3"
        style={{
          borderRadius: "15px",
          background: "#f8f9fa",
        }}
      >
        <div className="card-body">

          <div className="row g-4">

            {/* IMAGE */}

            <div className="col-md-4">

              {imageUrl ? (
                <div>
                  <img
                    src={imageUrl}
                    alt="Wildlife Observation"
                    className="img-fluid rounded-4 shadow-sm"
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setSelectedImage(imageUrl)
                    }
                  />

                  <div className="text-center mt-2">
                    <small className="text-muted">
                      <FaImage className="me-1" />
                      Click image to enlarge
                    </small>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center rounded-4"
                  style={{
                    height: "220px",
                    background: "#e9ecef",
                    color: "#6c757d",
                  }}
                >
                  <div className="text-center">
                    <FaImage size={40} />
                    <p className="mt-2 mb-0">
                      No Image
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* INFORMATION */}

            <div className="col-md-8">

              <h5 className="fw-bold text-success mb-3">
                Observation Details
              </h5>

              <div className="row g-3">

                <div className="col-md-6">
                  <strong>
                    <FaPaw className="me-2 text-success" />
                    Species
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.species_name ||
                      observation.species_id ||
                      "Not available"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    Location
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.location ||
                      "Not available"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>
                    <FaCalendarAlt className="me-2 text-primary" />
                    Observation Date
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.observation_date ||
                      "Not available"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>
                    <FaUser className="me-2 text-success" />
                    Observer
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.observer_name ||
                      "Not available"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>
                    <FaPaw className="me-2 text-success" />
                    Population Count
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.population_count ?? 0}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>
                    GPS Coordinates
                  </strong>

                  <p className="text-muted mb-0">
                    {observation.latitude ?? "N/A"},
                    {" "}
                    {observation.longitude ?? "N/A"}
                  </p>
                </div>

                <div className="col-12">

                  <strong>
                    Notes
                  </strong>

                  <div
                    className="mt-2 p-3 rounded-3"
                    style={{
                      background: "white",
                      border: "1px solid #dee2e6",
                      minHeight: "60px",
                    }}
                  >
                    {observation.notes ||
                      "No notes added."}
                  </div>

                </div>

                {observation.audio_path && (
                  <div className="col-12">

                    <strong>
                      Audio Recording
                    </strong>

                    <audio
                      controls
                      className="w-100 mt-2"
                      src={getImageUrl(
                        observation.audio_path
                      )}
                    />

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  };

  // =====================================================
  // SURVEY BLOCK
  // =====================================================

  const SurveyBlock = ({ surveyData }) => {
    const survey =
      surveyData.survey || surveyData;

    const summary =
      surveyData.summary || {
        total_observations:
          surveyData.observation_count || 0,
        species_recorded:
          surveyData.species_count || 0,
        locations: 0,
      };

    const observations =
      surveyData.observations || [];

    const surveyKey =
      survey.id || survey.survey_id;

    const isExpanded =
      expandedSurvey === surveyKey;

    const showObservations =
      expandedObservations[surveyKey];

    return (
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >

        {/* SURVEY HEADER */}

        <div
          className="card-body p-4"
          style={{
            background:
              "linear-gradient(135deg, #f8fff9, #ffffff)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <small className="text-muted">
                Survey
              </small>

              <h5 className="fw-bold text-success mb-1">
                {survey.title ||
                  survey.survey_id ||
                  "Unnamed Survey"}
              </h5>

              <small className="text-muted">
                {survey.survey_id || ""}
              </small>

            </div>

            <button
              className="btn btn-outline-success"
              onClick={() =>
                toggleSurveyDetails(surveyKey)
              }
            >
              {isExpanded ? (
                <>
                  <FaChevronUp className="me-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <FaEye className="me-2" />
                  View Details
                </>
              )}
            </button>

          </div>

        </div>


        {/* SURVEY DETAILS */}

        {isExpanded && (
          <div className="card-body border-top">

            <h5 className="fw-bold text-success mb-4">
              Survey Information
            </h5>

            <div className="row g-4">

              <div className="col-md-4">
                <strong>Survey ID</strong>
                <p className="text-muted">
                  {survey.survey_id || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Survey Name</strong>
                <p className="text-muted">
                  {survey.title || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Survey Date</strong>
                <p className="text-muted">
                  {survey.survey_date || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Protected Area</strong>
                <p className="text-muted">
                  {survey.protected_area || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Habitat Type</strong>
                <p className="text-muted">
                  {survey.habitat_type || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Monitoring Location</strong>
                <p className="text-muted">
                  {survey.monitoring_location || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>GPS Latitude</strong>
                <p className="text-muted">
                  {survey.gps_latitude ?? "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>GPS Longitude</strong>
                <p className="text-muted">
                  {survey.gps_longitude ?? "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Monitoring Device</strong>
                <p className="text-muted">
                  {survey.monitoring_device || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Researcher</strong>
                <p className="text-muted">
                  {survey.researcher_name || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <strong>Status</strong>
                <p>
                  <span className="badge bg-success">
                    {survey.status || "N/A"}
                  </span>
                </p>
              </div>

              <div className="col-12">
                <strong>Survey Notes</strong>

                <div
                  className="p-3 mt-2 rounded-3"
                  style={{
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                  }}
                >
                  {survey.notes ||
                    "No notes added."}
                </div>
              </div>

            </div>


            {/* OBSERVATION SUMMARY */}

            <div className="row g-3 mt-4 mb-4">

              <div className="col-md-4">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaUsers
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observations ??
                      observations.length ??
                      0}
                  </h5>

                  <small className="text-muted">
                    Observations
                  </small>

                </div>

              </div>

              <div className="col-md-4">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaPaw
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.species_recorded ??
                      0}
                  </h5>

                  <small className="text-muted">
                    Species Recorded
                  </small>

                </div>

              </div>

              <div className="col-md-4">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaTree
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.locations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Locations
                  </small>

                </div>

              </div>

            </div>


            {/* VIEW OBSERVATIONS BUTTON */}

            <div className="text-center">

              <button
                className="btn btn-success"
                onClick={() =>
                  toggleObservations(surveyKey)
                }
              >
                <FaEye className="me-2" />

                {showObservations
                  ? "Hide Observations"
                  : `View Observations ${
                      observations.length
                        ? `(${observations.length})`
                        : ""
                    }`}
              </button>

            </div>


            {/* OBSERVATIONS */}

            {showObservations && (
              <div className="mt-4">

                <h5 className="fw-bold text-success mb-3">
                  Wildlife Observations
                </h5>

                {observations.length > 0 ? (

                  observations.map(
                    (observation) => (
                      <ObservationDetails
                        key={observation.id}
                        observation={observation}
                      />
                    )
                  )

                ) : (

                  <div
                    className="text-center p-4 rounded-3"
                    style={{
                      background: "#f8f9fa",
                    }}
                  >
                    <FaClipboardList
                      size={35}
                      className="text-muted mb-2"
                    />

                    <p className="text-muted mb-0">
                      No observations available
                      for this survey.
                    </p>
                  </div>

                )}

              </div>
            )}


            {/* SURVEY EXPORT */}

            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
              }}
            >

              <h6 className="fw-bold mb-3">
                Export This Survey
              </h6>

              <div className="d-flex flex-wrap gap-2">

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadFile(
                      `/reports/wildlife-survey/${survey.id}/pdf`,
                      `${survey.survey_id || "survey"}.pdf`
                    )
                  }
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>

                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadFile(
                      `/reports/wildlife-survey/${survey.id}/excel`,
                      `${survey.survey_id || "survey"}.xlsx`
                    )
                  }
                >
                  <FaFileExcel className="me-2" />
                  Excel
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadFile(
                      `/reports/wildlife-survey/${survey.id}/csv`,
                      `${survey.survey_id || "survey"}.csv`
                    )
                  }
                >
                  CSV
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  };

  // =====================================================
  // SPECIES POPULATION BLOCK
  // =====================================================

  const SpeciesBlock = ({ speciesData }) => {
    const species = speciesData.species || {};
    const summary = speciesData.summary || {};
    const observations = speciesData.observations || [];

    const speciesKey = species.id;

    const isExpanded =
      expandedSpecies === speciesKey;

    return (
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >

        {/* SPECIES HEADER */}

        <div
          className="card-body p-4"
          style={{
            background:
              "linear-gradient(135deg, #f5f9ff, #ffffff)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <small className="text-muted">
                Species
              </small>

              <h5 className="fw-bold text-primary mb-1">

                <FaPaw className="me-2" />

                {species.species_name ||
                  "Unnamed Species"}

              </h5>

              <small className="text-muted fst-italic">
                {species.scientific_name || ""}
              </small>

            </div>

            <button
              className="btn btn-outline-primary"
              onClick={() =>
                toggleSpeciesDetails(speciesKey)
              }
            >

              {isExpanded ? (
                <>
                  <FaChevronUp className="me-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <FaEye className="me-2" />
                  View Details
                </>
              )}

            </button>

          </div>

        </div>


        {/* SPECIES DETAILS */}

        {isExpanded && (

          <div className="card-body border-top">

            <h5 className="fw-bold text-primary mb-4">
              Species Information
            </h5>


            {/* SPECIES INFORMATION */}

            <div className="row g-4">

              <div className="col-md-4">

                <strong>
                  <FaPaw className="me-2 text-primary" />
                  Species Name
                </strong>

                <p className="text-muted">
                  {species.species_name || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Scientific Name
                </strong>

                <p className="text-muted fst-italic">
                  {species.scientific_name || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Category
                </strong>

                <p className="text-muted">
                  {species.category || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  <FaUsers className="me-2 text-primary" />
                  Population
                </strong>

                <p className="text-muted">
                  {species.population ?? 0}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Conservation Status
                </strong>

                <p>
                  <span className="badge bg-success">
                    {species.conservation_status || "N/A"}
                  </span>
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Habitat
                </strong>

                <p className="text-muted">
                  {species.habitat || "N/A"}
                </p>

              </div>

            </div>


            {/* POPULATION SUMMARY */}

            <h5 className="fw-bold text-primary mt-4 mb-3">
              Population Summary
            </h5>


            <div className="row g-3 mb-4">

              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaUsers
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.population ?? 0}
                  </h5>

                  <small className="text-muted">
                    Population
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaClipboardList
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observations
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaPaw
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observed_count ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observed Count
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaMapMarkerAlt
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.locations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Locations
                  </small>

                </div>

              </div>

            </div>


            {/* OBSERVATIONS */}

            <div className="mt-4">

              <h5 className="fw-bold text-primary mb-3">
                Observation Details
              </h5>

              {observations.length > 0 ? (

                observations.map((observation) => (

                  <ObservationDetails
                    key={observation.id}
                    observation={{
                      ...observation,
                      species_name:
                        species.species_name,
                    }}
                  />

                ))

              ) : (

                <div
                  className="text-center p-4 rounded-3"
                  style={{
                    background: "#f8f9fa",
                  }}
                >

                  <FaClipboardList
                    size={35}
                    className="text-muted mb-2"
                  />

                  <p className="text-muted mb-0">
                    No observations available
                    for this species.
                  </p>

                </div>

              )}

            </div>


            {/* EXPORT SPECIES */}

            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: "#f5f9ff",
                border: "1px solid #cfe2ff",
              }}
            >

              <h6 className="fw-bold mb-3">
                Export This Species Report
              </h6>

              <div className="d-flex flex-wrap gap-2">

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadFile(
                      `/reports/species-population/${species.id}/pdf`,
                      `${species.species_name || "species"}-population-report.pdf`
                    )
                  }
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>


                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadFile(
                      `/reports/species-population/${species.id}/excel`,
                      `${species.species_name || "species"}-population-report.xlsx`
                    )
                  }
                >
                  <FaFileExcel className="me-2" />
                  Excel
                </button>


                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadFile(
                      `/reports/species-population/${species.id}/csv`,
                      `${species.species_name || "species"}-population-report.csv`
                    )
                  }
                >
                  <FaFileCsv className="me-2" />
                  CSV
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  };

  // =====================================================
  // BIODIVERSITY SPECIES BLOCK
  // =====================================================

  const BiodiversitySpeciesBlock = ({ speciesData }) => {
    const species = speciesData.species || {};
    const summary = speciesData.summary || {};
    const observations = speciesData.observations || [];

    const speciesKey = species.id;

    const isExpanded =
      expandedBiodiversitySpecies === speciesKey;

    return (
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >

        {/* =================================================
            SPECIES HEADER
        ================================================= */}

        <div
          className="card-body p-4"
          style={{
            background:
              "linear-gradient(135deg, #f8f5ff, #ffffff)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <small className="text-muted">
                Biodiversity Species
              </small>

              <h5 className="fw-bold text-purple mb-1">

                <FaPaw className="me-2" />

                {species.species_name ||
                  "Unnamed Species"}

              </h5>

              <small className="text-muted fst-italic">
                {species.scientific_name || ""}
              </small>

            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                toggleBiodiversitySpeciesDetails(
                  speciesKey
                )
              }
            >

              {isExpanded ? (
                <>
                  <FaChevronUp className="me-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <FaEye className="me-2" />
                  View Details
                </>
              )}

            </button>

          </div>

        </div>


        {/* =================================================
            SPECIES DETAILS
        ================================================= */}

        {isExpanded && (

          <div className="card-body border-top">

            <h5 className="fw-bold mb-4">
              Biodiversity Species Information
            </h5>


            {/* =================================================
                SPECIES INFORMATION
            ================================================= */}

            <div className="row g-4">

              <div className="col-md-4">

                <strong>
                  <FaPaw className="me-2 text-primary" />
                  Species Name
                </strong>

                <p className="text-muted">
                  {species.species_name || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Scientific Name
                </strong>

                <p className="text-muted fst-italic">
                  {species.scientific_name || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Category
                </strong>

                <p className="text-muted">
                  {species.category || "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  <FaUsers className="me-2 text-primary" />
                  Population
                </strong>

                <p className="text-muted">
                  {species.population ?? 0}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Conservation Status
                </strong>

                <p>
                  <span className="badge bg-success">
                    {species.conservation_status ||
                      "N/A"}
                  </span>
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Habitat
                </strong>

                <p className="text-muted">
                  {species.habitat || "N/A"}
                </p>

              </div>

            </div>


            {/* =================================================
                BIODIVERSITY SUMMARY
            ================================================= */}

            <h5 className="fw-bold mt-4 mb-3">
              Biodiversity Summary
            </h5>


            <div className="row g-3 mb-4">

              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaUsers
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.population ?? 0}
                  </h5>

                  <small className="text-muted">
                    Population
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaClipboardList
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observations
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaPaw
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observed_count ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observed Count
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaMapMarkerAlt
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.locations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Locations
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                OBSERVATION DETAILS
            ================================================= */}

            <div className="mt-4">

              <h5 className="fw-bold mb-3">
                Observation Details
              </h5>

              {observations.length > 0 ? (

                observations.map((observation) => (

                  <ObservationDetails
                    key={observation.id}
                    observation={{
                      ...observation,
                      species_name:
                        species.species_name,
                    }}
                  />

                ))

              ) : (

                <div
                  className="text-center p-4 rounded-3"
                  style={{
                    background: "#f8f9fa",
                  }}
                >

                  <FaClipboardList
                    size={35}
                    className="text-muted mb-2"
                  />

                  <p className="text-muted mb-0">
                    No observations available
                    for this species.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                SINGLE BIODIVERSITY EXPORT
            ================================================= */}

            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: "#f8f5ff",
                border: "1px solid #ddd0ff",
              }}
            >

              <h6 className="fw-bold mb-3">
                Export This Biodiversity Report
              </h6>

              <div className="d-flex flex-wrap gap-2">

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadFile(
                      `/reports/biodiversity/${species.id}/pdf`,
                      `${species.species_name || "species"}-biodiversity-report.pdf`
                    )
                  }
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>


                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadFile(
                      `/reports/biodiversity/${species.id}/excel`,
                      `${species.species_name || "species"}-biodiversity-report.xlsx`
                    )
                  }
                >
                  <FaFileExcel className="me-2" />
                  Excel
                </button>


                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadFile(
                      `/reports/biodiversity/${species.id}/csv`,
                      `${species.species_name || "species"}-biodiversity-report.csv`
                    )
                  }
                >
                  <FaFileCsv className="me-2" />
                  CSV
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  };

  // =====================================================
  // HABITAT BLOCK
  // =====================================================

  const HabitatBlock = ({ habitatData }) => {

    const habitat =
      habitatData.habitat || {};

    const summary =
      habitatData.summary || {};

    const analysis =
      habitatData.analysis || {};

    const species =
      habitatData.species || [];

    const habitatName =
      habitat.name || "Unknown Habitat";

    const isExpanded =
      expandedHabitat === habitatName;


    return (
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >

        {/* =================================================
            HABITAT HEADER
        ================================================= */}

        <div
          className="card-body p-4"
          style={{
            background:
              "linear-gradient(135deg, #e8fff7, #ffffff)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <small className="text-muted">
                Habitat
              </small>

              <h5 className="fw-bold text-success mb-1">

                <FaTree className="me-2" />

                {habitatName}

              </h5>

              <small className="text-muted">
                Habitat Assessment
              </small>

            </div>


            <button
              className="btn btn-outline-success"
              onClick={() =>
                toggleHabitatDetails(
                  habitatName
                )
              }
            >

              {isExpanded ? (
                <>
                  <FaChevronUp className="me-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <FaEye className="me-2" />
                  View Details
                </>
              )}

            </button>

          </div>

        </div>


        {/* =================================================
            DETAILS
        ================================================= */}

        {isExpanded && (

          <div className="card-body border-top">

            <h5 className="fw-bold text-success mb-4">
              Habitat Information
            </h5>


            <div className="row g-4">

              <div className="col-md-4">

                <strong>
                  <FaTree className="me-2 text-success" />
                  Habitat Name
                </strong>

                <p className="text-muted">
                  {habitatName}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Categories
                </strong>

                <p className="text-muted">
                  {analysis.categories?.length
                    ? analysis.categories.join(", ")
                    : "N/A"}
                </p>

              </div>


              <div className="col-md-4">

                <strong>
                  Locations
                </strong>

                <p className="text-muted">
                  {analysis.locations?.length
                    ? analysis.locations.join(", ")
                    : "N/A"}
                </p>

              </div>

            </div>


            {/* =================================================
                HABITAT SUMMARY
            ================================================= */}

            <h5 className="fw-bold text-success mt-4 mb-3">
              Habitat Assessment Summary
            </h5>


            <div className="row g-3 mb-4">

              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaPaw
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_species ?? 0}
                  </h5>

                  <small className="text-muted">
                    Species
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaUsers
                    className="text-primary mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_population ?? 0}
                  </h5>

                  <small className="text-muted">
                    Population
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaClipboardList
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observations
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaMapMarkerAlt
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.locations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Locations
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                SPECIES
            ================================================= */}

            <h5 className="fw-bold text-success mb-3">
              Species in this Habitat
            </h5>


            {species.length > 0 ? (

              species.map((speciesData) => {

                const species =
                  speciesData.species || {};

                const speciesSummary =
                  speciesData.summary || {};

                return (
                  <div
                    key={species.id}
                    className="card border-0 bg-light mb-3"
                  >

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center">

                        <div>

                          <h6 className="fw-bold mb-1">

                            <FaPaw className="me-2 text-success" />

                            {species.species_name ||
                              "Unnamed Species"}

                          </h6>

                          <small className="text-muted fst-italic">
                            {species.scientific_name || ""}
                          </small>

                        </div>


                        <span className="badge bg-success">

                          Population:{" "}
                          {species.population ?? 0}

                        </span>

                      </div>


                      <div className="row mt-3">

                        <div className="col-md-4">
                          <small className="text-muted">
                            Category
                          </small>

                          <p className="mb-0">
                            {species.category || "N/A"}
                          </p>
                        </div>


                        <div className="col-md-4">
                          <small className="text-muted">
                            Conservation Status
                          </small>

                          <p className="mb-0">
                            {species.conservation_status ||
                              "N/A"}
                          </p>
                        </div>


                        <div className="col-md-4">
                          <small className="text-muted">
                            Observations
                          </small>

                          <p className="mb-0">
                            {speciesSummary.total_observations ??
                              0}
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>
                );

              })

            ) : (

              <div className="alert alert-info">
                No species found in this habitat.
              </div>

            )}


            {/* =================================================
                EXPORT THIS HABITAT
            ================================================= */}

            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background:
                  "#e8fff7",
                border:
                  "1px solid #b8ead9",
              }}
            >

              <h6 className="fw-bold mb-3">
                Export This Habitat Report
              </h6>

              <div className="d-flex flex-wrap gap-2">

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadFile(
                      `/reports/habitat/${encodeURIComponent(
                        habitatName
                      )}/pdf`,
                      `${habitatName}-habitat-assessment-report.pdf`
                    )
                  }
                >

                  <FaFilePdf className="me-2" />

                  PDF

                </button>


                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadFile(
                      `/reports/habitat/${encodeURIComponent(
                        habitatName
                      )}/excel`,
                      `${habitatName}-habitat-assessment-report.xlsx`
                    )
                  }
                >

                  <FaFileExcel className="me-2" />

                  Excel

                </button>


                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadFile(
                      `/reports/habitat/${encodeURIComponent(
                        habitatName
                      )}/csv`,
                      `${habitatName}-habitat-assessment-report.csv`
                    )
                  }
                >

                  <FaFileCsv className="me-2" />

                  CSV

                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  };

  // =====================================================
  // CONSERVATION STATUS BLOCK
  // =====================================================

  const ConservationBlock = ({
    conservationData,
  }) => {

    const conservation =
      conservationData.conservation || {};

    const summary =
      conservationData.summary || {};

    const observations =
      conservationData.observations || [];

    const status =
      conservation.status || "Unknown";

    const isExpanded =
      expandedConservation === status;

    return (
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >

        {/* HEADER */}

        <div
          className="card-body p-4"
          style={{
            background:
              "linear-gradient(135deg, #fff5f5, #ffffff)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <small className="text-muted">
                Conservation Status
              </small>

              <h5 className="fw-bold text-danger mb-1">

                <FaShieldAlt className="me-2" />

                {status}

              </h5>

              <small className="text-muted">
                {summary.total_species ?? 0}
                {" "}
                Species
              </small>

            </div>

            <button
              className="btn btn-outline-danger"
              onClick={() =>
                toggleConservationDetails(status)
              }
            >

              {isExpanded ? (
                <>
                  <FaChevronUp className="me-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <FaEye className="me-2" />
                  View Details
                </>
              )}

            </button>

          </div>

        </div>


        {/* DETAILS */}

        {isExpanded && (

          <div className="card-body border-top">

            <h5 className="fw-bold text-danger mb-4">
              Conservation Information
            </h5>


            {/* STATUS INFORMATION */}

            <div className="row g-4">

              <div className="col-md-4">

                <strong>
                  <FaShieldAlt className="me-2 text-danger" />
                  Conservation Status
                </strong>

                <p>
                  <span className="badge bg-danger">
                    {status}
                  </span>
                </p>

              </div>

              <div className="col-md-4">

                <strong>
                  Species
                </strong>

                <p className="text-muted">
                  {summary.total_species ?? 0}
                </p>

              </div>

              <div className="col-md-4">

                <strong>
                  Total Population
                </strong>

                <p className="text-muted">
                  {summary.total_population ?? 0}
                </p>

              </div>

            </div>


            {/* SUMMARY */}

            <h5 className="fw-bold text-danger mt-4 mb-3">
              Conservation Summary
            </h5>

            <div className="row g-3 mb-4">

              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaPaw
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_species ?? 0}
                  </h5>

                  <small className="text-muted">
                    Species
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaUsers
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_population ?? 0}
                  </h5>

                  <small className="text-muted">
                    Population
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaClipboardList
                    className="text-success mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.total_observations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Observations
                  </small>

                </div>

              </div>


              <div className="col-md-3">

                <div className="p-3 rounded-3 bg-light text-center">

                  <FaMapMarkerAlt
                    className="text-danger mb-2"
                    size={25}
                  />

                  <h5 className="fw-bold">
                    {summary.locations ?? 0}
                  </h5>

                  <small className="text-muted">
                    Locations
                  </small>

                </div>

              </div>

            </div>


            {/* SPECIES */}

            <div className="mt-4">

              <h5 className="fw-bold text-danger mb-3">
                Species Under This Conservation Status
              </h5>

              {conservationData.species?.length > 0 ? (

                conservationData.species.map(
                  (speciesData) => (

                    <SpeciesBlock
                      key={
                        speciesData.species?.id
                      }
                      speciesData={speciesData}
                    />

                  )
                )

              ) : (

                <div
                  className="text-center p-4 rounded-3"
                  style={{
                    background: "#f8f9fa",
                  }}
                >

                  <FaClipboardList
                    size={35}
                    className="text-muted mb-2"
                  />

                  <p className="text-muted mb-0">
                    No species available for
                    this conservation status.
                  </p>

                </div>

              )}

            </div>


            {/* SINGLE EXPORT */}

            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: "#fff5f5",
                border: "1px solid #f5c2c7",
              }}
            >

              <h6 className="fw-bold mb-3">
                Export This Conservation Report
              </h6>

              <div className="d-flex flex-wrap gap-2">

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    downloadFile(
                      `/reports/conservation/${encodeURIComponent(status)}/pdf`,
                      `${status}-conservation-report.pdf`
                    )
                  }
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>


                <button
                  className="btn btn-success"
                  onClick={() =>
                    downloadFile(
                      `/reports/conservation/${encodeURIComponent(status)}/excel`,
                      `${status}-conservation-report.xlsx`
                    )
                  }
                >
                  <FaFileExcel className="me-2" />
                  Excel
                </button>


                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadFile(
                      `/reports/conservation/${encodeURIComponent(status)}/csv`,
                      `${status}-conservation-report.csv`
                    )
                  }
                >
                  <FaFileCsv className="me-2" />
                  CSV
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  };

  // =====================================================
  // HABITAT ASSESSMENT REPORT
  // =====================================================

  const HabitatAssessmentReport = () => {

    if (loading) {

      return (
        <div className="text-center py-5">

          <div
            className="spinner-border text-success"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading habitat assessment report...
          </p>

        </div>
      );
    }


    if (error) {

      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }


    if (!habitatReportData) {
      return null;
    }


    const summary =
      habitatReportData.summary || {};

    const habitats =
      habitatReportData.habitats || [];


    return (
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="card-header p-4"
          style={{
            background:
              "linear-gradient(135deg, #20c997, #087f5b)",
            color: "white",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="fw-bold mb-1">

                <FaTree className="me-2" />

                Habitat Assessment Report

              </h3>

              <p className="mb-0">
                Habitat-wise species, population,
                observations and environmental
                monitoring information
              </p>

            </div>


            <span className="badge bg-light text-success fs-6">

              {summary.total_habitats || 0}
              {" "}
              Habitats

            </span>

          </div>

        </div>


        <div className="card-body p-4 p-md-5">


          {/* =================================================
              SUMMARY
          ================================================= */}

          <h5 className="fw-bold text-success mb-3">
            Report Summary
          </h5>


          <div className="row g-4 mb-5">

            <SummaryCard
              icon={
                <FaTree
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.total_habitats}
              title="Total Habitats"
            />


            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.total_species}
              title="Total Species"
            />


            <SummaryCard
              icon={
                <FaUsers
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.total_population}
              title="Total Population"
            />


            <SummaryCard
              icon={
                <FaMapMarkerAlt
                  size={30}
                  className="text-danger mb-2"
                />
              }
              value={summary.locations}
              title="Locations"
            />

          </div>


          {/* =================================================
              EXPORT ALL
              IMPORTANT: BEFORE HABITAT SINGLE EXPORT
          ================================================= */}

          <div
            className="mb-5 p-4 rounded-4"
            style={{
              background:
                "linear-gradient(135deg, #e8fff7, #ffffff)",
              border:
                "1px solid #b8ead9",
            }}
          >

            <h5 className="fw-bold text-success mb-2">
              Export All Habitat Assessment Reports
            </h5>

            <p className="text-muted">
              Generate one complete report containing
              all habitats, species, population,
              observations and monitoring locations.
            </p>


            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-danger"
                onClick={() =>
                  downloadFile(
                    "/reports/habitat/all/pdf",
                    "all-habitat-assessment-reports.pdf"
                  )
                }
              >

                <FaFilePdf className="me-2" />

                Export All PDF

              </button>


              <button
                className="btn btn-success"
                onClick={() =>
                  downloadFile(
                    "/reports/habitat/all/excel",
                    "all-habitat-assessment-reports.xlsx"
                  )
                }
              >

                <FaFileExcel className="me-2" />

                Export All Excel

              </button>


              <button
                className="btn btn-secondary"
                onClick={() =>
                  downloadFile(
                    "/reports/habitat/all/csv",
                    "all-habitat-assessment-reports.csv"
                  )
                }
              >

                <FaFileCsv className="me-2" />

                Export All CSV

              </button>

            </div>

          </div>


          {/* =================================================
              HABITAT LIST
          ================================================= */}

          <div className="mb-3">

            <h5 className="fw-bold text-success mb-1">
              Habitats
            </h5>

            <p className="text-muted mb-0">
              Select a habitat to view its complete
              assessment details.
            </p>

          </div>


          {habitats.length > 0 ? (

            habitats.map((habitatData) => (

              <HabitatBlock
                key={
                  habitatData.habitat?.name
                }
                habitatData={habitatData}
              />

            ))

          ) : (

            <div className="alert alert-info">
              No habitats found.
            </div>

          )}

        </div>

      </div>
    );
  };

  // =====================================================
  // BIODIVERSITY REPORT
  // =====================================================

  const BiodiversityReport = () => {

    if (loading) {
      return (
        <div className="text-center py-5">

          <div
            className="spinner-border"
            style={{
              color: "#6f42c1",
            }}
            role="status"
          />

          <p className="text-muted mt-3">
            Loading biodiversity report...
          </p>

        </div>
      );
    }


    if (error) {
      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }


    if (!biodiversityReportData) {
      return null;
    }


    const summary =
      biodiversityReportData.summary || {};

    const analysis =
      biodiversityReportData.analysis || {};

    const species =
      biodiversityReportData.species || [];


    return (
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="card-header p-4"
          style={{
            background:
              "linear-gradient(135deg, #6f42c1, #432874)",
            color: "white",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="fw-bold mb-1">

                <FaTree className="me-2" />

                Biodiversity Report

              </h3>

              <p className="mb-0">
                Species diversity, population,
                habitats, conservation status and
                biodiversity observations
              </p>

            </div>


            <span className="badge bg-light text-dark fs-6">

              {summary.total_species || 0}
              {" "}
              Species

            </span>

          </div>

        </div>


        <div className="card-body p-4 p-md-5">


          {/* =================================================
              SUMMARY
          ================================================= */}

          <h5 className="fw-bold mb-3">
            Report Summary
          </h5>


          <div className="row g-4 mb-5">

            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="mb-2"
                  style={{ color: "#6f42c1" }}
                />
              }
              value={summary.total_species}
              title="Total Species"
            />


            <SummaryCard
              icon={
                <FaUsers
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.total_population}
              title="Total Population"
            />


            <SummaryCard
              icon={
                <FaClipboardList
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.total_observations}
              title="Total Observations"
            />


            <SummaryCard
              icon={
                <FaMapMarkerAlt
                  size={30}
                  className="text-danger mb-2"
                />
              }
              value={summary.locations}
              title="Locations"
            />

          </div>


          {/* =================================================
              ANALYSIS
          ================================================= */}

          <h5 className="fw-bold mb-3">
            Biodiversity Analysis
          </h5>


          <div className="row g-4 mb-5">

            <div className="col-md-4">

              <div className="p-4 bg-light rounded-4 h-100">

                <h6 className="fw-bold">
                  Categories
                </h6>

                {analysis.categories?.length > 0 ? (

                  <div className="d-flex flex-wrap gap-2">

                    {analysis.categories.map(
                      (category) => (
                        <span
                          key={category}
                          className="badge"
                          style={{
                            background: "#6f42c1",
                          }}
                        >
                          {category}
                        </span>
                      )
                    )}

                  </div>

                ) : (
                  <p className="text-muted mb-0">
                    No category information.
                  </p>
                )}

              </div>

            </div>


            <div className="col-md-4">

              <div className="p-4 bg-light rounded-4 h-100">

                <h6 className="fw-bold">
                  Conservation Status
                </h6>

                {analysis.conservation_statuses?.length > 0 ? (

                  <div className="d-flex flex-wrap gap-2">

                    {analysis.conservation_statuses.map(
                      (status) => (
                        <span
                          key={status}
                          className="badge bg-success"
                        >
                          {status}
                        </span>
                      )
                    )}

                  </div>

                ) : (
                  <p className="text-muted mb-0">
                    No conservation status information.
                  </p>
                )}

              </div>

            </div>


            <div className="col-md-4">

              <div className="p-4 bg-light rounded-4 h-100">

                <h6 className="fw-bold">
                  Habitats
                </h6>

                {analysis.habitats?.length > 0 ? (

                  <div className="d-flex flex-wrap gap-2">

                    {analysis.habitats.map(
                      (habitat) => (
                        <span
                          key={habitat}
                          className="badge bg-info text-dark"
                        >
                          {habitat}
                        </span>
                      )
                    )}

                  </div>

                ) : (
                  <p className="text-muted mb-0">
                    No habitat information.
                  </p>
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              EXPORT ALL BIODIVERSITY
              IMPORTANT: ALL EXPORT BEFORE SINGLE EXPORT
          ================================================= */}

          <div
            className="mb-5 p-4 rounded-4"
            style={{
              background:
                "linear-gradient(135deg, #f8f5ff, #ffffff)",
              border: "1px solid #ddd0ff",
            }}
          >

            <h5
              className="fw-bold mb-2"
              style={{
                color: "#6f42c1",
              }}
            >
              Export All Biodiversity Reports
            </h5>

            <p className="text-muted">
              Generate one complete report containing
              all species, biodiversity information,
              populations, habitats, conservation
              status and observations.
            </p>


            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-danger"
                onClick={() =>
                  downloadFile(
                    "/reports/biodiversity/all/pdf",
                    "all-biodiversity-reports.pdf"
                  )
                }
              >

                <FaFilePdf className="me-2" />

                Export All PDF

              </button>


              <button
                className="btn btn-success"
                onClick={() =>
                  downloadFile(
                    "/reports/biodiversity/all/excel",
                    "all-biodiversity-reports.xlsx"
                  )
                }
              >

                <FaFileExcel className="me-2" />

                Export All Excel

              </button>


              <button
                className="btn btn-secondary"
                onClick={() =>
                  downloadFile(
                    "/reports/biodiversity/all/csv",
                    "all-biodiversity-reports.csv"
                  )
                }
              >

                <FaFileCsv className="me-2" />

                Export All CSV

              </button>

            </div>

          </div>


          {/* =================================================
              SPECIES LIST
          ================================================= */}

          <div className="mb-3">

            <h5
              className="fw-bold mb-1"
              style={{
                color: "#6f42c1",
              }}
            >
              Biodiversity Species
            </h5>

            <p className="text-muted mb-0">
              Select a species to view complete
              biodiversity details and observations.
            </p>

          </div>


          {species.length > 0 ? (

            species.map((speciesData) => (

              <BiodiversitySpeciesBlock
                key={speciesData.species?.id}
                speciesData={speciesData}
              />

            ))

          ) : (

            <div className="alert alert-info">
              No biodiversity species found.
            </div>

          )}

        </div>

      </div>
    );
  };

  // =====================================================
  // WILDLIFE SURVEY REPORT
  // =====================================================

  const WildlifeSurveyReport = () => {

    if (loading) {
      return (
        <div className="text-center py-5">
          <div
            className="spinner-border text-success"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading wildlife survey report...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }

    if (!reportData) {
      return null;
    }

    const summary =
      reportData.summary || {};

    return (
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
        }}
      >

        <div
          className="card-header p-4"
          style={{
            background:
              "linear-gradient(135deg, #198754, #0f5132)",
            color: "white",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="fw-bold mb-1">
                <FaClipboardList className="me-2" />
                Wildlife Survey Report
              </h3>

              <p className="mb-0">
                Survey activities, observations,
                species and monitoring information
              </p>

            </div>

            <span className="badge bg-light text-success fs-6">
              {reportData.surveys?.length || 0} Surveys
            </span>

          </div>

        </div>


        <div className="card-body p-4 p-md-5">

          {/* SUMMARY */}

          <h5 className="fw-bold text-success mb-3">
            Report Summary
          </h5>

          <div className="row g-4 mb-5">

            <SummaryCard
              icon={
                <FaClipboardList
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.total_surveys}
              title="Total Surveys"
            />

            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.species_recorded}
              title="Species Recorded"
            />

            <SummaryCard
              icon={
                <FaUsers
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.total_observations}
              title="Total Observations"
            />

            <SummaryCard
              icon={
                <FaTree
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.locations}
              title="Monitoring Locations"
            />

          </div>


          {/* SURVEYS */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold text-success mb-1">
                Surveys
              </h5>

              <p className="text-muted mb-0">
                Select a survey to view its complete details.
              </p>

            </div>

          </div>


          {reportData.surveys?.length > 0 ? (

            reportData.surveys.map((survey) => (
              <SurveyBlock
                key={
                  survey.id ||
                  survey.survey_id
                }
                surveyData={survey}
              />
            ))

          ) : (

            <div className="alert alert-info">
              No surveys found.
            </div>

          )}


          {/* ALL SURVEYS EXPORT */}

          <div
            className="mt-5 p-4 rounded-4"
            style={{
              background:
                "linear-gradient(135deg, #f8fff9, #ffffff)",
              border: "1px solid #cdebd8",
            }}
          >

            <h5 className="fw-bold text-success mb-2">
              Export All Surveys
            </h5>

            <p className="text-muted">
              Generate one complete report containing
              all wildlife surveys and their observations.
            </p>

            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-danger"
                onClick={() =>
                  downloadFile(
                    "/reports/wildlife-survey/all/pdf",
                    "all-wildlife-surveys.pdf"
                  )
                }
              >
                <FaFilePdf className="me-2" />
                Export All PDF
              </button>

              <button
                className="btn btn-success"
                onClick={() =>
                  downloadFile(
                    "/reports/wildlife-survey/all/excel",
                    "all-wildlife-surveys.xlsx"
                  )
                }
              >
                <FaFileExcel className="me-2" />
                Export All Excel
              </button>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  downloadFile(
                    "/reports/wildlife-survey/all/csv",
                    "all-wildlife-surveys.csv"
                  )
                }
              >
                CSV
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  // =====================================================
  // SPECIES POPULATION REPORT
  // =====================================================

  const SpeciesPopulationReport = () => {

    if (loading) {
      return (
        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading species population report...
          </p>

        </div>
      );
    }


    if (error) {
      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }


    if (!speciesReportData) {
      return null;
    }


    const summary =
      speciesReportData.summary || {};


    return (
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
        }}
      >

        {/* HEADER */}

        <div
          className="card-header p-4"
          style={{
            background:
              "linear-gradient(135deg, #0d6efd, #084298)",
            color: "white",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="fw-bold mb-1">

                <FaPaw className="me-2" />

                Species Population Report

              </h3>

              <p className="mb-0">
                Species-wise population estimates,
                observations and monitoring information
              </p>

            </div>


            <span className="badge bg-light text-primary fs-6">

              {speciesReportData.species?.length || 0}
              {" "}
              Species

            </span>

          </div>

        </div>


        {/* BODY */}

        <div className="card-body p-4 p-md-5">

          {/* SUMMARY */}

          <h5 className="fw-bold text-primary mb-3">
            Report Summary
          </h5>


          <div className="row g-4 mb-5">

            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.total_species}
              title="Total Species"
            />


            <SummaryCard
              icon={
                <FaUsers
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.total_population}
              title="Total Population"
            />


            <SummaryCard
              icon={
                <FaClipboardList
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={summary.total_observations}
              title="Total Observations"
            />


            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="text-primary mb-2"
                />
              }
              value={summary.species_with_observations}
              title="Species With Observations"
            />

          </div>


          {/* SPECIES LIST */}

          <div className="mb-3">

            <h5 className="fw-bold text-primary mb-1">
              Species
            </h5>

            <p className="text-muted mb-0">
              Select a species to view its population,
              conservation information and observations.
            </p>

          </div>


          {speciesReportData.species?.length > 0 ? (

            speciesReportData.species.map(
              (speciesData) => (

                <SpeciesBlock
                  key={speciesData.species?.id}
                  speciesData={speciesData}
                />

              )
            )

          ) : (

            <div className="alert alert-info">
              No species found.
            </div>

          )}


          {/* EXPORT ALL SPECIES */}

          <div
            className="mt-5 p-4 rounded-4"
            style={{
              background:
                "linear-gradient(135deg, #f5f9ff, #ffffff)",
              border: "1px solid #cfe2ff",
            }}
          >

            <h5 className="fw-bold text-primary mb-2">
              Export All Species
            </h5>

            <p className="text-muted">
              Generate one complete report containing
              all species, population information and
              their observations.
            </p>


            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-danger"
                onClick={() =>
                  downloadFile(
                    "/reports/species-population/all/pdf",
                    "all-species-population-report.pdf"
                  )
                }
              >

                <FaFilePdf className="me-2" />

                Export All PDF

              </button>


              <button
                className="btn btn-success"
                onClick={() =>
                  downloadFile(
                    "/reports/species-population/all/excel",
                    "all-species-population-report.xlsx"
                  )
                }
              >

                <FaFileExcel className="me-2" />

                Export All Excel

              </button>


              <button
                className="btn btn-secondary"
                onClick={() =>
                  downloadFile(
                    "/reports/species-population/all/csv",
                    "all-species-population-report.csv"
                  )
                }
              >

                <FaFileCsv className="me-2" />

                Export All CSV

              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  // =====================================================
  // CONSERVATION REPORT
  // =====================================================

  const ConservationReport = () => {

    if (loading) {
      return (
        <div className="text-center py-5">

          <div
            className="spinner-border text-danger"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading conservation report...
          </p>

        </div>
      );
    }


    if (error) {
      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }


    if (!conservationReportData) {
      return null;
    }


    const summary =
      conservationReportData.summary || {};


    return (
      <div
        className="card border-0 shadow-lg mb-5"
        style={{
          borderRadius: "25px",
          overflow: "hidden",
        }}
      >

        {/* HEADER */}

        <div
          className="card-header p-4"
          style={{
            background:
              "linear-gradient(135deg, #dc3545, #842029)",
            color: "white",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h3 className="fw-bold mb-1">

                <FaShieldAlt className="me-2" />

                Conservation Reports

              </h3>

              <p className="mb-0">
                Conservation status, species,
                population and monitoring information
              </p>

            </div>


            <span className="badge bg-light text-danger fs-6">

              {summary.total_statuses || 0}
              {" "}
              Statuses

            </span>

          </div>

        </div>


        {/* BODY */}

        <div className="card-body p-4 p-md-5">

          {/* SUMMARY */}

          <h5 className="fw-bold text-danger mb-3">
            Report Summary
          </h5>


          <div className="row g-4 mb-5">

            <SummaryCard
              icon={
                <FaShieldAlt
                  size={30}
                  className="text-danger mb-2"
                />
              }
              value={
                summary.total_statuses
              }
              title="Conservation Statuses"
            />


            <SummaryCard
              icon={
                <FaPaw
                  size={30}
                  className="text-danger mb-2"
                />
              }
              value={
                summary.total_species
              }
              title="Total Species"
            />


            <SummaryCard
              icon={
                <FaUsers
                  size={30}
                  className="text-danger mb-2"
                />
              }
              value={
                summary.total_population
              }
              title="Total Population"
            />


            <SummaryCard
              icon={
                <FaClipboardList
                  size={30}
                  className="text-success mb-2"
                />
              }
              value={
                summary.total_observations
              }
              title="Total Observations"
            />

          </div>


          {/* STATUS LIST */}

          <div className="mb-3">

            <h5 className="fw-bold text-danger mb-1">
              Conservation Statuses
            </h5>

            <p className="text-muted mb-0">
              Select a conservation status to view
              its species, population and observations.
            </p>

          </div>


          {conservationReportData
            .conservation_statuses
            ?.length > 0 ? (

            conservationReportData
              .conservation_statuses
              .map(
                (conservationData) => (

                  <ConservationBlock
                    key={
                      conservationData
                        .conservation
                        ?.status
                    }
                    conservationData={
                      conservationData
                    }
                  />

                )
              )

          ) : (

            <div className="alert alert-info">
              No conservation statuses found.
            </div>

          )}


          {/* EXPORT ALL */}

          <div
            className="mt-5 p-4 rounded-4"
            style={{
              background:
                "linear-gradient(135deg, #fff5f5, #ffffff)",
              border:
                "1px solid #f5c2c7",
            }}
          >

            <h5 className="fw-bold text-danger mb-2">
              Export All Conservation Reports
            </h5>

            <p className="text-muted">
              Generate one complete report containing
              all conservation statuses, species,
              population information and observations.
            </p>


            <div className="d-flex flex-wrap gap-2">

              <button
                className="btn btn-danger"
                onClick={() =>
                  downloadFile(
                    "/reports/conservation/all/pdf",
                    "all-conservation-reports.pdf"
                  )
                }
              >

                <FaFilePdf className="me-2" />

                Export All PDF

              </button>


              <button
                className="btn btn-success"
                onClick={() =>
                  downloadFile(
                    "/reports/conservation/all/excel",
                    "all-conservation-reports.xlsx"
                  )
                }
              >

                <FaFileExcel className="me-2" />

                Export All Excel

              </button>


              <button
                className="btn btn-secondary"
                onClick={() =>
                  downloadFile(
                    "/reports/conservation/all/csv",
                    "all-conservation-reports.csv"
                  )
                }
              >

                <FaFileCsv className="me-2" />

                Export All CSV

              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  // =====================================================
  // IMAGE MODAL
  // =====================================================

  const ImageModal = () => {

    if (!selectedImage) {
      return null;
    }

    return (
      <div
        onClick={() => setSelectedImage(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.85)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
        }}
      >

        <button
          className="btn btn-light"
          onClick={() =>
            setSelectedImage(null)
          }
          style={{
            position: "absolute",
            top: "20px",
            right: "25px",
            borderRadius: "50%",
            width: "45px",
            height: "45px",
          }}
        >
          <FaTimes />
        </button>

        <img
          src={selectedImage}
          alt="Wildlife Observation"
          onClick={(event) =>
            event.stopPropagation()
          }
          style={{
            maxWidth: "90%",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: "15px",
            boxShadow:
              "0 10px 50px rgba(0,0,0,.5)",
          }}
        />

      </div>
    );
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <div
        className="container-fluid"
        style={{
          minHeight: "100vh",
          paddingTop: "1.5rem",
          paddingBottom: "3rem",
          background: "var(--bg)",
        }}
      >

        {/* HEADER */}

        <div
          className="card border-0 shadow-lg mb-5"
          style={{
            borderRadius: "25px",
            background:
              "linear-gradient(135deg, #198754, #0f5132)",
            color: "white",
          }}
        >

          <div className="card-body p-4 p-md-5">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

              <div>

                <h1 className="fw-bold mb-3">
                  📑 Reports & Export System
                </h1>

                <p className="fs-5 mb-0">
                  Generate, analyze and export wildlife
                  research reports.
                </p>

              </div>

              <button
                className="btn btn-light"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                <FaArrowLeft className="me-2" />
                Back to Dashboard
              </button>

            </div>

          </div>

        </div>


        {/* REPORT TYPES */}

        <div className="mb-4">

          <h3 className="fw-bold text-success">
            📊 Research Reports
          </h3>

          <p className="text-muted">
            Select a report type to view wildlife
            research information.
          </p>

        </div>


        <div className="row g-4">

          <ReportCard
            icon={
              <FaClipboardList size={34} />
            }
            title="Wildlife Survey Reports"
            description="View wildlife survey records, observations, locations and survey information."
            background="#198754"
            reportType="survey"
          />

          <ReportCard
            icon={
              <FaPaw size={34} />
            }
            title="Species Population Reports"
            description="Analyze species-wise population estimates, population trends and observations."
            background="#0d6efd"
            reportType="population"
          />

          <ReportCard
            icon={
              <FaTree size={34} />
            }
            title="Biodiversity Reports"
            description="Analyze species diversity, categories and conservation status."
            background="#6f42c1"
            reportType="biodiversity"
          />

          <ReportCard
            icon={
              <FaTree size={34} />
            }
            title="Habitat Assessment Reports"
            description="Review habitat information and environmental conditions for recorded wildlife."
            background="#20c997"
            reportType="habitat"
          />

          <ReportCard
            icon={
              <FaShieldAlt size={34} />
            }
            title="Conservation Reports"
            description="Analyze endangered species, conservation priorities and wildlife protection information."
            background="#dc3545"
            reportType="conservation"
          />

        </div>


        {/* WILDLIFE SURVEY REPORT
            Opens immediately BELOW report cards */}

        {selectedReport === "survey" && (
          <div className="mt-5">
            <WildlifeSurveyReport />
          </div>
        )}

        {selectedReport === "population" && (
          <div className="mt-5">
            <SpeciesPopulationReport />
          </div>
        )}

        {selectedReport === "biodiversity" && (
          <div className="mt-5">
            <BiodiversityReport />
          </div>
        )}

        {selectedReport === "habitat" && (
          <div className="mt-5">
            <HabitatAssessmentReport />
          </div>
        )}

        {selectedReport === "conservation" && (
          <div className="mt-5">
            <ConservationReport />
          </div>
        )}

      </div>


      {/* IMAGE MODAL */}

      <ImageModal />

    </>
  );
}

export default Reports;