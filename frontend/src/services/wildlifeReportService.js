import api from './api';

const handleDownload = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream'
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

const wildlifeReportService = {
  getPreview: async (params = {}) => {
    const response = await api.get('/wildlife-reports/preview', { params });
    return response.data;
  },

  exportPdf: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/wildlife-reports/export/pdf?${queryString}`;
    return handleDownload(url, 'Wildlife_Report.pdf');
  },

  exportExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/wildlife-reports/export/excel?${queryString}`;
    return handleDownload(url, 'Wildlife_Report.xlsx');
  },

  exportJson: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/wildlife-reports/export/json?${queryString}`;
    return handleDownload(url, 'Wildlife_Report.json');
  },

  exportCsv: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/wildlife-reports/export/csv?${queryString}`;
    return handleDownload(url, 'Wildlife_Report.csv');
  },
  
  getHistory: async () => {
    const response = await api.get('/wildlife-reports/history');
    return response.data;
  }
};

export default wildlifeReportService;

