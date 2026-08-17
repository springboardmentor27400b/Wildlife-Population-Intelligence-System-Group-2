import { useMemo, useState } from "react";

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

import "./Reports.css";

const reports = [
  {
    id: 1,
    title: "Wildlife Survey Report",
    type: "Survey",
    description:
      "Wildlife survey and monitoring information from registered locations.",
    icon: FaMapMarkedAlt,
    date: "16 Aug 2026",
    status: "Ready",
  },
  {
    id: 2,
    title: "Species Population Report",
    type: "Population",
    description:
      "Species population records, counts, density and population trends.",
    icon: FaPaw,
    date: "16 Aug 2026",
    status: "Ready",
  },
  {
    id: 3,
    title: "Biodiversity Report",
    type: "Biodiversity",
    description:
      "Species diversity, biodiversity analysis and ecosystem insights.",
    icon: FaLeaf,
    date: "15 Aug 2026",
    status: "Ready",
  },
  {
    id: 4,
    title: "Habitat Assessment Report",
    type: "Habitat",
    description:
      "Habitat condition, vegetation analysis and habitat health assessment.",
    icon: FaChartBar,
    date: "15 Aug 2026",
    status: "Ready",
  },
  {
    id: 5,
    title: "Conservation Report",
    type: "Conservation",
    description:
      "Conservation priorities, protection strategies and monitoring recommendations.",
    icon: FaShieldAlt,
    date: "14 Aug 2026",
    status: "Ready",
  },
];


function Reports() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const reportTypes = [
    "All",
    "Survey",
    "Population",
    "Biodiversity",
    "Habitat",
    "Conservation",
  ];

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase().trim();

    return reports.filter((report) => {
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

  const handlePdfExport = (report) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Wildlife Monitoring Report", 20, 20);

    doc.setFontSize(14);
    doc.text(report.title, 20, 32);

    autoTable(doc, {
      startY: 42,
      head: [["Field", "Details"]],
      body: [
        ["Report ID", report.id],
        ["Report Type", report.type],
        ["Description", report.description],
        ["Date", report.date],
        ["Status", report.status],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fontStyle: "bold",
      },
    });

    doc.save(
      `${report.title.toLowerCase().replace(/\s+/g, "-")}.pdf`
    );
  };

  const handleExcelExport = (report) => {
    const data = [
      {
        "Report ID": report.id,
        "Report Title": report.title,
        "Report Type": report.type,
        Description: report.description,
        Date: report.date,
        Status: report.status,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    XLSX.writeFile(
      workbook,
      `${report.title.toLowerCase().replace(/\s+/g, "-")}.xlsx`
    );
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
              Generate and manage wildlife monitoring and biodiversity reports
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
              className={selectedType === type ? "active" : ""}
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
            <h2>{reports.length}</h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaPaw />
          </div>

          <div>
            <span>Population Reports</span>
            <h2>
              {reports.filter((report) => report.type === "Population").length}
            </h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaLeaf />
          </div>

          <div>
            <span>Biodiversity Reports</span>
            <h2>
              {
                reports.filter(
                  (report) => report.type === "Biodiversity"
                ).length
              }
            </h2>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FaShieldAlt />
          </div>

          <div>
            <span>Conservation Reports</span>
            <h2>
              {
                reports.filter(
                  (report) => report.type === "Conservation"
                ).length
              }
            </h2>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="reports-section-header">
          <div>
            <h2>Available Reports</h2>
            <p>Select a report to export the required information.</p>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="reports-grid">
            {filteredReports.map((report) => {
              const Icon = report.icon;

              return (
                <div className="report-card" key={report.id}>
                  <div className="report-card-top">
                    <div className="report-card-icon">
                      <Icon />
                    </div>

                    <span className="report-status">
                      {report.status}
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
                    <span>{report.date}</span>

                    <div className="report-actions">
                      <button
                        onClick={() => handlePdfExport(report)}
                        title="Export PDF"
                      >
                        <FaFilePdf />
                        PDF
                      </button>

                      <button
                        onClick={() => handleExcelExport(report)}
                        title="Export Excel"
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
              Try searching for another report or select a different type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;