import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { downloadReportExport } from "../../services/reportExportService";

interface Props {
  title: string;
  format: string;
  exportedAt: string;
  exportId: number;
}

export default function ExportCard({
  title,
  format,
  exportedAt,
  exportId,
}: Props) {

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {

    try {

      setDownloading(true);

      const response =
        await downloadReportExport(exportId);

      // ============================================================
      // GET CONTENT TYPE
      // ============================================================

      const contentType = String(
        response.headers?.["content-type"] ||
        "application/pdf"
      );

      // ============================================================
      // CREATE BLOB
      // ============================================================

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      // ============================================================
      // CREATE DOWNLOAD URL
      // ============================================================

      const url =
        window.URL.createObjectURL(blob);

      // ============================================================
      // CREATE TEMPORARY DOWNLOAD LINK
      // ============================================================

      const link =
        document.createElement("a");

      link.href = url;

      // ============================================================
      // FILE NAME
      // ============================================================

      const extension =
        format === "EXCEL"
          ? "xlsx"
          : format === "CSV"
          ? "csv"
          : "pdf";

      link.download =
        `${title.replace(
          /[^a-zA-Z0-9-_ ]/g,
          ""
        )}.${extension}`;

      document.body.appendChild(link);

      link.click();

      // ============================================================
      // CLEANUP
      // ============================================================

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(
        "Report download failed:",
        error
      );

      alert(
        "Unable to download the report. Please login again and try."
      );

    } finally {

      setDownloading(false);

    }
  };


  return (

    <div className="
      bg-white
      rounded-2xl
      shadow
      border
      p-6
      flex
      justify-between
      items-center
    ">

      {/* ========================================================
          REPORT INFORMATION
      ======================================================== */}

      <div>

        <div className="flex items-center gap-3">

          <div className="
            p-3
            rounded-xl
            bg-green-100
            text-green-700
          ">

            <FileText size={22} />

          </div>

          <h2 className="font-bold text-lg">

            {title}

          </h2>

        </div>


        <p className="
          text-gray-500
          mt-2
        ">

          Format : {format}

        </p>


        <p className="
          text-gray-400
          text-sm
          mt-1
        ">

          {new Date(
            exportedAt
          ).toLocaleDateString()}

        </p>

      </div>


      {/* ========================================================
          DOWNLOAD BUTTON
      ======================================================== */}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="
          bg-green-600
          text-white
          rounded-xl
          p-3
          hover:bg-green-700
          disabled:opacity-60
          disabled:cursor-not-allowed
          transition
        "
        title="Download report"
      >

        {downloading ? (

          <Loader2
            size={22}
            className="animate-spin"
          />

        ) : (

          <Download size={22} />

        )}

      </button>

    </div>

  );
}