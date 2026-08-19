import { useEffect, useMemo, useState } from "react";
import {
  FaFileAlt,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaMapMarkedAlt,
  FaPaw,
  FaLeaf,
  FaShieldAlt,
} from "react-icons/fa";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import API from "../services/api";
import "./Reports.css";

const REPORTS = [
  {
    id: 1,
    title: "Wildlife Survey Report",
    type: "Survey",
    description:
      "Detailed wildlife survey and monitoring information from registered detection records.",
    icon: FaMapMarkedAlt,
  },
  {
    id: 2,
    title: "Species Population Report",
    type: "Population",
    description:
      "Species-wise population, animal counts, detections and population distribution.",
    icon: FaPaw,
  },
  {
    id: 3,
    title: "Biodiversity Report",
    type: "Biodiversity",
    description:
      "Biodiversity analysis including species diversity, habitats and conservation status.",
    icon: FaLeaf,
  },
  {
    id: 4,
    title: "Habitat Assessment Report",
    type: "Habitat",
    description:
      "Habitat-wise species observations, animal population and detection distribution.",
    icon: FaChartBar,
  },
  {
    id: 5,
    title: "Conservation Report",
    type: "Conservation",
    description:
      "Endangered species, conservation priorities, alerts and protection recommendations.",
    icon: FaShieldAlt,
  },
];

function Reports() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportTypes = [
    "All",
    "Survey",
    "Population",
    "Biodiversity",
    "Habitat",
    "Conservation",
  ];

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await API.get("/detection");

        const data =
          response.data?.data ||
          response.data?.detections ||
          [];

        setDetections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load report data:", error);
        setDetections([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase().trim();

    return REPORTS.filter((report) => {
      const matchesSearch =
        !query ||
        report.title.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query);

      const matchesType =
        selectedType === "All" || report.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  const totalAnimals = detections.reduce(
    (sum, item) => sum + Number(item.animalCount || 0),
    0
  );

  const uniqueSpecies = new Set(
    detections
      .map((item) => item.speciesName)
      .filter(Boolean)
      .map((name) => name.toLowerCase())
  ).size;

  const endangeredCount = detections.filter(
    (item) => item.endangeredStatus === "Endangered"
  ).length;

  const vulnerableCount = detections.filter(
    (item) => item.endangeredStatus === "Vulnerable"
  ).length;

  const getSpeciesData = () => {
    const map = {};

    detections.forEach((item) => {
      const species = item.speciesName || "Unknown";

      if (!map[species]) {
        map[species] = {
          species,
          detections: 0,
          animals: 0,
          confidenceTotal: 0,
          confidenceCount: 0,
          endangeredStatus: item.endangeredStatus || "Least Concern",
        };
      }

      map[species].detections += 1;
      map[species].animals += Number(item.animalCount || 0);

      if (item.confidence !== undefined && item.confidence !== null) {
        map[species].confidenceTotal += Number(item.confidence);
        map[species].confidenceCount += 1;
      }

      if (item.endangeredStatus === "Endangered") {
        map[species].endangeredStatus = "Endangered";
      } else if (
        item.endangeredStatus === "Vulnerable" &&
        map[species].endangeredStatus !== "Endangered"
      ) {
        map[species].endangeredStatus = "Vulnerable";
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      averageConfidence:
        item.confidenceCount > 0
          ? (
              item.confidenceTotal / item.confidenceCount
            ).toFixed(2)
          : "0.00",
    }));
  };

  const getLocationData = () => {
    const map = {};

    detections.forEach((item) => {
      const location = item.location || "Unknown";

      if (!map[location]) {
        map[location] = {
          location,
          detections: 0,
          animals: 0,
          species: new Set(),
        };
      }

      map[location].detections += 1;
      map[location].animals += Number(item.animalCount || 0);

      if (item.speciesName) {
        map[location].species.add(item.speciesName);
      }
    });

    return Object.values(map).map((item) => ({
      location: item.location,
      detections: item.detections,
      animals: item.animals,
      species: item.species.size,
    }));
  };

  const getHabitatData = () => {
    const map = {};

    detections.forEach((item) => {
      const habitat = item.habitat || "Unknown";

      if (!map[habitat]) {
        map[habitat] = {
          habitat,
          detections: 0,
          animals: 0,
          species: new Set(),
        };
      }

      map[habitat].detections += 1;
      map[habitat].animals += Number(item.animalCount || 0);

      if (item.speciesName) {
        map[habitat].species.add(item.speciesName);
      }
    });

    return Object.values(map).map((item) => ({
      habitat: item.habitat,
      detections: item.detections,
      animals: item.animals,
      species: item.species.size,
    }));
  };

  const getConservationData = () => {
    return detections
      .filter(
        (item) =>
          item.endangeredStatus === "Endangered" ||
          item.endangeredStatus === "Vulnerable"
      )
      .map((item) => ({
        species: item.speciesName || "Unknown",
        status: item.endangeredStatus || "Unknown",
        level: item.conservationLevel || "Not Specified",
        location: item.location || "Unknown",
        animals: Number(item.animalCount || 0),
        confidence: Number(item.confidence || 0).toFixed(2),
        alert:
          item.alertMessage ||
          "Conservation monitoring recommended.",
      }));
  };

  const getSurveyData = () => {
    return detections.map((item, index) => ({
      no: index + 1,
      species: item.speciesName || "Unknown",
      scientificName: item.scientificName || "-",
      animalCount: Number(item.animalCount || 0),
      confidence: Number(item.confidence || 0).toFixed(2),
      location: item.location || "Unknown",
      habitat: item.habitat || "-",
      camera: item.cameraId || "-",
      status: item.endangeredStatus || "Least Concern",
      detectionTime: item.detectionTime
        ? new Date(item.detectionTime).toLocaleString()
        : "-",
    }));
  };

  const getReportData = (type) => {
    switch (type) {
      case "Survey":
        return getSurveyData();

      case "Population":
        return getSpeciesData();

      case "Biodiversity":
        return getSpeciesData();

      case "Habitat":
        return getHabitatData();

      case "Conservation":
        return getConservationData();

      default:
        return [];
    }
  };

  const getPdfContent = (report) => {
    const doc = new jsPDF();

    const generatedDate = new Date().toLocaleString();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("WILDLIFE MONITORING SYSTEM", 14, 18);

    doc.setFontSize(16);
    doc.text(report.title, 14, 29);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${generatedDate}`, 14, 37);

    doc.line(14, 41, 196, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const summary = [
      ["Total Detection Records", detections.length],
      ["Total Animals Observed", totalAnimals],
      ["Unique Species", uniqueSpecies],
      ["Endangered Records", endangeredCount],
      ["Vulnerable Records", vulnerableCount],
    ];

    autoTable(doc, {
      startY: 55,
      head: [["Metric", "Value"]],
      body: summary,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fontStyle: "bold",
      },
    });

    let startY = doc.lastAutoTable.finalY + 12;

    if (report.type === "Survey") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SURVEY OBSERVATION DETAILS", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [[
          "No",
          "Species",
          "Animals",
          "Confidence",
          "Location",
          "Habitat",
          "Status",
        ]],
        body: getSurveyData().map((item) => [
          item.no,
          item.species,
          item.animalCount,
          `${item.confidence}%`,
          item.location,
          item.habitat,
          item.status,
        ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
      });
    }

    if (report.type === "Population") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SPECIES-WISE POPULATION ANALYSIS", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [[
          "Species",
          "Detections",
          "Animals",
          "Avg Confidence",
          "Status",
        ]],
        body: getSpeciesData().map((item) => [
          item.species,
          item.detections,
          item.animals,
          `${item.averageConfidence}%`,
          item.endangeredStatus,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      });

      startY = doc.lastAutoTable.finalY + 12;

      doc.setFont("helvetica", "bold");
      doc.text("LOCATION-WISE POPULATION", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Location", "Detections", "Animals", "Species"]],
        body: getLocationData().map((item) => [
          item.location,
          item.detections,
          item.animals,
          item.species,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      });
    }

    if (report.type === "Biodiversity") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BIODIVERSITY ANALYSIS", 14, startY);

      const leastConcern = detections.filter(
        (item) => item.endangeredStatus === "Least Concern"
      ).length;

      autoTable(doc, {
        startY: startY + 5,
        head: [["Biodiversity Indicator", "Value"]],
        body: [
          ["Total Species", uniqueSpecies],
          ["Total Detection Records", detections.length],
          ["Total Animals", totalAnimals],
          ["Endangered Records", endangeredCount],
          ["Vulnerable Records", vulnerableCount],
          ["Least Concern Records", leastConcern],
          ["Different Habitats", getHabitatData().length],
          ["Different Locations", getLocationData().length],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
      });

      startY = doc.lastAutoTable.finalY + 12;

      doc.text("SPECIES DIVERSITY DETAILS", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [[
          "Species",
          "Detections",
          "Animals",
          "Conservation Status",
        ]],
        body: getSpeciesData().map((item) => [
          item.species,
          item.detections,
          item.animals,
          item.endangeredStatus,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      });
    }

    if (report.type === "Habitat") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HABITAT ASSESSMENT", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Habitat", "Detections", "Animals", "Species"]],
        body: getHabitatData().map((item) => [
          item.habitat,
          item.detections,
          item.animals,
          item.species,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      });
    }

    if (report.type === "Conservation") {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONSERVATION PRIORITIES", 14, startY);

      const conservation = getConservationData();

      autoTable(doc, {
        startY: startY + 5,
        head: [[
          "Species",
          "Status",
          "Level",
          "Location",
          "Animals",
          "Confidence",
        ]],
        body: conservation.map((item) => [
          item.species,
          item.status,
          item.level,
          item.location,
          item.animals,
          `${item.confidence}%`,
        ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
      });

      startY = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONSERVATION ALERTS", 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Species", "Alert / Recommendation"]],
        body:
          conservation.length > 0
            ? conservation.map((item) => [
                item.species,
                item.alert,
              ])
            : [
                [
                  "No High-Risk Species",
                  "Continue regular wildlife monitoring and conservation surveillance.",
                ],
              ],
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      });
    }

    const finalY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 15
      : 100;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This report is generated from wildlife detection records available in the Wildlife Monitoring System.",
      14,
      Math.min(finalY, 275)
    );

    return doc;
  };

  const handlePdfExport = (report) => {
    const doc = getPdfContent(report);

    const filename = `${report.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.pdf`;

    doc.save(filename);
  };

  const handleExcelExport = (report) => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["WILDLIFE MONITORING SYSTEM"],
      [report.title],
      [],
      ["SUMMARY", "VALUE"],
      ["Total Detection Records", detections.length],
      ["Total Animals Observed", totalAnimals],
      ["Unique Species", uniqueSpecies],
      ["Endangered Records", endangeredCount],
      ["Vulnerable Records", vulnerableCount],
      ["Generated Date", new Date().toLocaleString()],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );

    let detailData = [];

    if (report.type === "Survey") {
      detailData = getSurveyData().map((item) => ({
        No: item.no,
        Species: item.species,
        "Scientific Name": item.scientificName,
        "Animal Count": item.animalCount,
        "Confidence (%)": item.confidence,
        Location: item.location,
        Habitat: item.habitat,
        Camera: item.camera,
        "Conservation Status": item.status,
        "Detection Time": item.detectionTime,
      }));
    }

    if (
      report.type === "Population" ||
      report.type === "Biodiversity"
    ) {
      detailData = getSpeciesData().map((item) => ({
        Species: item.species,
        Detections: item.detections,
        "Animal Count": item.animals,
        "Average Confidence (%)": item.averageConfidence,
        "Conservation Status": item.endangeredStatus,
      }));
    }

    if (report.type === "Habitat") {
      detailData = getHabitatData().map((item) => ({
        Habitat: item.habitat,
        Detections: item.detections,
        "Animal Count": item.animals,
        "Species Count": item.species,
      }));
    }

    if (report.type === "Conservation") {
      detailData = getConservationData().map((item) => ({
        Species: item.species,
        Status: item.status,
        "Conservation Level": item.level,
        Location: item.location,
        "Animal Count": item.animals,
        "Confidence (%)": item.confidence,
        Alert: item.alert,
      }));
    }

    const detailSheet =
      XLSX.utils.json_to_sheet(detailData);

    XLSX.utils.book_append_sheet(
      workbook,
      detailSheet,
      "Detailed Data"
    );

    const filename = `${report.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="reports-title">
          <div className="reports-title-icon">
            <FaFileAlt />
          </div>

          <div>
            <h1>Wildlife Reports</h1>
            <p>
              Generate detailed wildlife monitoring,
              population, biodiversity and conservation reports.
            </p>
          </div>
        </div>

        <div className="reports-count">
          <FaFileAlt />
          {filteredReports.length} Reports
        </div>
      </div>

      <div className="reports-toolbar">
        <div className="reports-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="reports-filters">
          {reportTypes.map((type) => (
            <button
              key={type}
              className={
                selectedType === type ? "active" : ""
              }
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-summary">
        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaFileAlt />
          </div>

          <div>
            <span>Total Reports</span>
            <h2>{REPORTS.length}</h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaPaw />
          </div>

          <div>
            <span>Total Animals</span>
            <h2>{totalAnimals}</h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaLeaf />
          </div>

          <div>
            <span>Unique Species</span>
            <h2>{uniqueSpecies}</h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaShieldAlt />
          </div>

          <div>
            <span>Endangered Records</span>
            <h2>{endangeredCount}</h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Available Reports</h2>
            <p>
              Export detailed PDF or Excel reports using
              current wildlife detection data.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="reports-empty">
            <FaFileAlt />
            <h3>Loading report data...</h3>
            <p>Please wait while detection data is loaded.</p>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="reports-grid">
            {filteredReports.map((report) => {
              const Icon = report.icon;

              return (
                <div
                  className="report-card"
                  key={report.id}
                >
                  <div className="report-card-top">
                    <div className="report-card-icon">
                      <Icon />
                    </div>

                    <span className="report-status">
                      Ready
                    </span>
                  </div>

                  <div className="report-card-content">
                    <span className="report-type">
                      {report.type}
                    </span>

                    <h3>{report.title}</h3>

                    <p>{report.description}</p>
                  </div>

                  <div className="report-card-footer">
                    <span>
                      {detections.length} data records
                    </span>

                    <div className="report-actions">
                      <button
                        onClick={() =>
                          handlePdfExport(report)
                        }
                        title="Export detailed PDF"
                      >
                        <FaFilePdf />
                        PDF
                      </button>

                      <button
                        onClick={() =>
                          handleExcelExport(report)
                        }
                        title="Export detailed Excel"
                      >
                        <FaFileExcel />
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="reports-empty">
            <FaSearch />
            <h3>No reports found</h3>
            <p>
              Try searching for another report or select
              a different type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;