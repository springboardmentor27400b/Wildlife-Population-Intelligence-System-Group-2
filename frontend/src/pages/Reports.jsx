import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const reportTypes = [
  {
    id: "wildlife",
    title: "Wildlife Survey Report",
    description: "Generate a report containing wildlife survey information.",
  },
  {
    id: "population",
    title: "Species Population Report",
    description: "Generate population statistics and species trends.",
  },
  {
    id: "biodiversity",
    title: "Biodiversity Report",
    description: "Generate biodiversity and species diversity analysis.",
  },
  {
    id: "habitat",
    title: "Habitat Assessment Report",
    description: "Generate habitat health and restoration information.",
  },
  {
    id: "conservation",
    title: "Conservation Report",
    description: "Generate conservation priorities and recommendations.",
  },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState("population");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/report/generate`,
        {
          report_type: selectedType,
        }
      );

      console.log("Report generated:", response.data);

      setMessage("Report generated successfully.");
    } catch (error) {
      console.error("Report generation error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to generate report."
      );
    } finally {
      setLoading(false);
    }
  };

 
  const downloadPDF = () => {
  window.open(
    `${API_URL}/report/download?report_type=${selectedType}`,
    "_blank"
  );
};

  const downloadExcel = () => {
    window.open(
      `${API_URL}/report/download-excel`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Reports & Export
        </h1>

        <p className="mt-2 text-slate-500">
          Generate wildlife intelligence reports and export
          conservation analytics.
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedType(report.id)}
            className={`cursor-pointer rounded-xl border p-5 transition ${
              selectedType === report.id
                ? "border-green-600 bg-green-50 shadow-md"
                : "border-slate-200 bg-white hover:shadow-md"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-800">
              {report.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {report.description}
            </p>

            {selectedType === report.id && (
              <div className="mt-4 text-sm font-medium text-green-700">
                Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate Section */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">

        <h2 className="text-xl font-semibold text-slate-800">
          Generate Report
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Selected report:{" "}
          <span className="font-semibold text-slate-700">
            {
              reportTypes.find(
                (r) => r.id === selectedType
              )?.title
            }
          </span>
        </p>

        <button
          onClick={generateReport}
          disabled={loading}
          className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-slate-600">
            {message}
          </p>
        )}
      </div>

      {/* Export Section */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* PDF */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              PDF Export
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Download the generated wildlife report as a PDF.
            </p>
          </div>

          <button
            onClick={downloadPDF}
            className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
          >
            Download PDF
          </button>
        </div>

        {/* Excel */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Excel Export
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Download wildlife intelligence data as an Excel
              spreadsheet.
            </p>
          </div>

          <button
            onClick={downloadExcel}
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            Download Excel
          </button>
        </div>

      </div>
    </div>
  );
}