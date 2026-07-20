import api from './api';

const auditLogService = {
  getAuditLogs: async (params = {}) => {
    // Format dates to ISO strings for backend if they are Date objects
    const formattedParams = { ...params };
    if (formattedParams.start_date && formattedParams.start_date instanceof Date) {
      formattedParams.start_date = formattedParams.start_date.toISOString();
    }
    if (formattedParams.end_date && formattedParams.end_date instanceof Date) {
      formattedParams.end_date = formattedParams.end_date.toISOString();
    }
    const response = await api.get('/audit-logs', { params: formattedParams });
    return response.data;
  },

  getAuditLog: async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  exportExcel: async (params = {}) => {
    const formattedParams = { ...params };
    if (formattedParams.start_date && formattedParams.start_date instanceof Date) {
      formattedParams.start_date = formattedParams.start_date.toISOString();
    }
    if (formattedParams.end_date && formattedParams.end_date instanceof Date) {
      formattedParams.end_date = formattedParams.end_date.toISOString();
    }
    
    const response = await api.get('/audit-logs/export/excel', {
      params: formattedParams,
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportPdf: async (params = {}) => {
    const formattedParams = { ...params };
    if (formattedParams.start_date && formattedParams.start_date instanceof Date) {
      formattedParams.start_date = formattedParams.start_date.toISOString();
    }
    if (formattedParams.end_date && formattedParams.end_date instanceof Date) {
      formattedParams.end_date = formattedParams.end_date.toISOString();
    }
    
    const response = await api.get('/audit-logs/export/pdf', {
      params: formattedParams,
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default auditLogService;
