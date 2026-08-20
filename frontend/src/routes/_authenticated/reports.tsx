import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

import {
  downloadCSV,
  downloadPDF,
  downloadXLSX,
} from "@/services/reportService";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute(
  "/_authenticated/reports",
)({
  head: () => ({
    meta: [
      {
        title: "Reports — WPIS",
      },
    ],
  }),

  component: Reports,
});


const REPORTS = [
  {
    name: "Wildlife Survey Report",
    desc: "Site-level survey summary with observations, effort, and detections.",
    updated: "2026-07-05",
  },
  {
    name: "Population Report",
    desc: "Species counts, densities and trend analysis by protected area.",
    updated: "2026-07-03",
  },
  {
    name: "Biodiversity Report",
    desc: "Richness, Shannon-Wiener, evenness across habitats.",
    updated: "2026-07-02",
  },
  {
    name: "Habitat Report",
    desc: "Vegetation, water, and degradation indicators from GIS layers.",
    updated: "2026-06-30",
  },
  {
    name: "Conservation Report",
    desc: "Recommended actions, priorities, and resource allocation.",
    updated: "2026-06-28",
  },
];


function Reports() {

  const handleDownloadCSV = async () => {
    try {
      await downloadCSV();

      toast.success(
        "CSV report downloaded successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to download CSV",
        error,
      );

      toast.error(
        "Failed to download CSV report.",
      );
    }
  };


  const handleDownloadPDF = async () => {
    try {
      await downloadPDF();

      toast.success(
        "PDF report downloaded successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to download PDF",
        error,
      );

      toast.error(
        "Failed to download PDF report.",
      );
    }
  };


  const handleDownloadXLSX = async () => {
    try {
      await downloadXLSX();

      toast.success(
        "Excel report downloaded successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to download XLSX",
        error,
      );

      toast.error(
        "Failed to download Excel report.",
      );
    }
  };


  return (
    <div>

      <PageHeader
        title="Reports"
        description="Generate and export detailed reports in PDF, Excel or CSV formats."
      />

      <div className="grid gap-4 md:grid-cols-2">

        {REPORTS.map((report) => (

          <div
            key={report.name}
            className="glass rounded-2xl p-5"
          >

            <div className="mb-3 flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 text-forest">

                <FileText className="h-5 w-5" />

              </div>

              <span className="text-xs text-muted-foreground">
                Updated {report.updated}
              </span>

            </div>


            <div className="font-display text-lg font-semibold">
              {report.name}
            </div>


            <div className="mt-1 text-sm text-muted-foreground">
              {report.desc}
            </div>


            <div className="mt-4 flex flex-wrap gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-1 h-3 w-3" />
                PDF
              </Button>


              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
              >
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>


              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadXLSX}
              >
                <Download className="mr-1 h-3 w-3" />
                XLSX
              </Button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}