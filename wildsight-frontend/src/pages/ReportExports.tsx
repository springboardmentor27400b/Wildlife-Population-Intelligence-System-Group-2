import { useEffect, useMemo, useState } from "react";

import {
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Search,
} from "lucide-react";

import {
  getAllReportExports,
} from "../services/reportExportService";

import ExportCard from "../components/reportExport/ExportCard";
import AnalyticsCard from "../components/analytics/AnalyticsCard";

import { ReportExport } from "../types/reportExport";


export default function ReportExports() {

  const [exports, setExports] =
    useState<ReportExport[]>([]);

  const [search, setSearch] =
    useState("");

  const [format, setFormat] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);


  // ============================================================
  // LOAD REPORT EXPORTS
  // ============================================================

  const loadExports = async () => {

    try {

      setLoading(true);

      const data =
        await getAllReportExports();

      setExports(data || []);

    } catch (error) {

      console.error(
        "Failed to load report exports:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadExports();

  }, []);


  // ============================================================
  // STATISTICS
  // ============================================================

  const totalExports =
    exports.length;


  const pdfExports =
    exports.filter(
      (e) =>
        e.exportFormat?.toUpperCase() === "PDF"
    ).length;


  const excelExports =
    exports.filter(
      (e) =>
        e.exportFormat?.toUpperCase() === "EXCEL"
    ).length;


  const csvExports =
    exports.filter(
      (e) =>
        e.exportFormat?.toUpperCase() === "CSV"
    ).length;


  // ============================================================
  // SEARCH + FORMAT FILTER
  // ============================================================

  const filteredExports =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();

      return exports.filter((exp) => {

        const title =
          exp.reportTitle?.toLowerCase() || "";

        const searchMatch =
          title.includes(searchValue);

        const formatMatch =
          format === "ALL" ||
          exp.exportFormat?.toUpperCase() === format;

        return (
          searchMatch &&
          formatMatch
        );

      });

    }, [
      exports,
      search,
      format
    ]);


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="
      p-8
      space-y-8
      bg-[#f7faf7]
      min-h-screen
    ">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-4
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            text-gray-900
          ">

            Report Exports 📥

          </h1>


          <p className="
            text-gray-500
            mt-2
          ">

            Download and manage generated
            wildlife intelligence reports.

          </p>

        </div>


        <button

          onClick={loadExports}

          disabled={loading}

          className="
            bg-green-600
            hover:bg-green-700
            disabled:opacity-60
            text-white
            rounded-xl
            px-5
            py-3
            flex
            items-center
            justify-center
            gap-2
            shadow
            transition
          "
        >

          <Download size={18} />

          {loading
            ? "Refreshing..."
            : "Refresh Exports"
          }

        </button>

      </div>


      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">


        <AnalyticsCard

          title="Total Exports"

          value={totalExports}

          icon={
            <Download size={24} />
          }

          color="bg-green-600"

        />


        <AnalyticsCard

          title="PDF Files"

          value={pdfExports}

          icon={
            <FileText size={24} />
          }

          color="bg-red-500"

        />


        <AnalyticsCard

          title="Excel Files"

          value={excelExports}

          icon={
            <FileSpreadsheet size={24} />
          }

          color="bg-green-500"

        />


        <AnalyticsCard

          title="CSV Files"

          value={csvExports}

          icon={
            <FileArchive size={24} />
          }

          color="bg-blue-600"

        />

      </div>


      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-4
        justify-between
      ">


        {/* SEARCH */}

        <div className="
          relative
          w-full
          md:w-96
        ">

          <Search

            size={18}

            className="
              absolute
              left-3
              top-3
              text-gray-400
            "

          />


          <input

            type="text"

            placeholder="Search report..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            className="
              w-full
              rounded-xl
              border
              pl-10
              pr-4
              py-3
              shadow-sm
              outline-none
              focus:ring-2
              focus:ring-green-500
            "

          />

        </div>


        {/* FORMAT */}

        <select

          value={format}

          onChange={(e) =>
            setFormat(e.target.value)
          }

          className="
            rounded-xl
            border
            px-4
            py-3
            shadow-sm
            outline-none
            focus:ring-2
            focus:ring-green-500
          "

        >

          <option value="ALL">
            All Formats
          </option>

          <option value="PDF">
            PDF
          </option>

          <option value="EXCEL">
            EXCEL
          </option>

          <option value="CSV">
            CSV
          </option>

        </select>

      </div>


      {/* ======================================================
          EXPORT LIST
      ====================================================== */}

      <div className="grid gap-5">


        {/* LOADING */}

        {loading ? (

          <div className="
            bg-white
            rounded-2xl
            shadow
            p-12
            text-center
          ">

            <p className="
              text-gray-500
            ">

              Loading report exports...

            </p>

          </div>


        ) : filteredExports.length > 0 ? (


          /* ==================================================
             EXPORT CARDS
             ================================================== */

          filteredExports.map((exp) => (

            <ExportCard

              key={exp.exportId}

              title={
                exp.reportTitle
              }

              format={
                exp.exportFormat
              }

              exportedAt={
                exp.exportedAt
              }

              exportId={
                exp.exportId
              }

            />

          ))


        ) : (


          /* ==================================================
             EMPTY STATE
             ================================================== */

          <div className="
            bg-white
            rounded-2xl
            shadow
            p-12
            text-center
          ">


            <Download

              size={50}

              className="
                mx-auto
                text-gray-400
                mb-4
              "

            />


            <h2 className="
              text-2xl
              font-bold
            ">

              No Report Exports Found

            </h2>


            <p className="
              text-gray-500
              mt-2
            ">

              Try changing your search
              or export filter.

            </p>

          </div>

        )}

      </div>

    </div>

  );

}