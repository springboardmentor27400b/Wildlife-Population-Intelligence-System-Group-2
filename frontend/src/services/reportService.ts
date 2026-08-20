import api from "./api";

function downloadBlob(
  data: BlobPart,
  filename: string,
) {
  const blob = new Blob([data]);

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}


export async function downloadCSV() {
  const response = await api.get(
    "/reports/csv",
    {
      responseType: "blob",
    },
  );

  downloadBlob(
    response.data,
    "wildlife_report.csv",
  );
}


export async function downloadPDF() {
  const response = await api.get(
    "/reports/pdf",
    {
      responseType: "blob",
    },
  );

  downloadBlob(
    response.data,
    "wildlife_report.pdf",
  );
}


export async function downloadXLSX() {
  const response = await api.get(
    "/reports/xlsx",
    {
      responseType: "blob",
    },
  );

  downloadBlob(
    response.data,
    "wildlife_report.xlsx",
  );
}