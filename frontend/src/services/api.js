import axios from 'axios';

// Dynamic API base URL using Vite environment variables with production fallback
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api')
).replace(/\/+$/, '');

export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

export const getMediaUrl = (pathOrFilename) => {
  if (!pathOrFilename) return '';
  if (pathOrFilename.startsWith('http://') || pathOrFilename.startsWith('https://')) {
    return pathOrFilename;
  }
  if (pathOrFilename.startsWith('/api/')) {
    return `${BACKEND_URL}${pathOrFilename}`;
  }
  if (pathOrFilename.startsWith('/')) {
    return `${API_BASE_URL}${pathOrFilename}`;
  }
  return `${API_BASE_URL}/observations/media/${pathOrFilename}`;
};

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically inject JWT token from LocalStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        if (!config.headers) config.headers = {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically normalize error responses so error.response.data.detail is always a string
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        const msgs = detail.map((d) => {
          if (typeof d === 'string') return d;
          const field = Array.isArray(d.loc) ? d.loc.filter(x => x !== 'body').join('.') : '';
          return field ? `${field}: ${d.msg}` : (d.msg || JSON.stringify(d));
        });
        error.response.data.detail = `Validation error: ${msgs.join(', ')}`;
      } else if (typeof detail === 'object' && detail !== null) {
        error.response.data.detail = detail.msg || detail.message || JSON.stringify(detail);
      }
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await client.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data; // returns { access_token, token_type }
  },
  register: async (email, password, fullName, role) => {
    const response = await client.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    return response.data;
  },
};

export const profileAPI = {
  get: async () => {
    const response = await client.get('/profile/');
    return response.data;
  },
  update: async (data) => {
    const response = await client.put('/profile/', data);
    return response.data;
  },
};

export const sitesAPI = {
  list: async () => {
    const response = await client.get('/sites/');
    return response.data;
  },
  create: async (siteData) => {
    const response = await client.post('/sites/', siteData);
    return response.data;
  },
  get: async (id) => {
    const response = await client.get(`/sites/${id}`);
    return response.data;
  },
  update: async (id, siteData) => {
    const response = await client.put(`/sites/${id}`, siteData);
    return response.data;
  },
  delete: async (id) => {
    const response = await client.delete(`/sites/${id}`);
    return response.data;
  },
};

export const surveysAPI = {
  list: async () => {
    const response = await client.get('/surveys/');
    return response.data;
  },
  create: async (surveyData) => {
    const response = await client.post('/surveys/', surveyData);
    return response.data;
  },
  get: async (id) => {
    const response = await client.get(`/surveys/${id}`);
    return response.data;
  },
  update: async (id, surveyData) => {
    const response = await client.put(`/surveys/${id}`, surveyData);
    return response.data;
  },
  delete: async (id) => {
    const response = await client.delete(`/surveys/${id}`);
    return response.data;
  },
};

export const devicesAPI = {
  list: async () => {
    const response = await client.get('/devices/');
    return response.data;
  },
  create: async (deviceData) => {
    const response = await client.post('/devices/', deviceData);
    return response.data;
  },
  get: async (id) => {
    const response = await client.get(`/devices/${id}`);
    return response.data;
  },
  update: async (id, deviceData) => {
    const response = await client.put(`/devices/${id}`, deviceData);
    return response.data;
  },
  delete: async (id) => {
    const response = await client.delete(`/devices/${id}`);
    return response.data;
  },
};

export const observationsAPI = {
  list: async (skip = 0, limit = 50) => {
    const response = await client.get(`/observations/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  create: async (observationData) => {
    const response = await client.post('/observations/', observationData);
    return response.data;
  },
  get: async (id) => {
    const response = await client.get(`/observations/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await client.delete(`/observations/${id}`);
    return response.data;
  },
  uploadMedia: async (filesOrFormData, surveyId = null, siteId = null, deviceId = null, onUploadProgress = null) => {
    let payload;
    let progressCallback = null;

    if (filesOrFormData instanceof FormData) {
      payload = filesOrFormData;
      if (typeof surveyId === 'function') {
        progressCallback = surveyId;
      }
    } else {
      payload = new FormData();
      const filesList = Array.isArray(filesOrFormData) ? filesOrFormData : [filesOrFormData];
      filesList.forEach((file) => {
        if (file) {
          payload.append('files', file);
        }
      });
      if (surveyId !== null && surveyId !== undefined && typeof surveyId !== 'function') {
        payload.append('survey_id', String(surveyId));
      }
      if (siteId !== null && siteId !== undefined) {
        payload.append('site_id', String(siteId));
      }
      if (deviceId !== null && deviceId !== undefined) {
        payload.append('device_id', String(deviceId));
      }
      if (typeof onUploadProgress === 'function') {
        progressCallback = onUploadProgress;
      }
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (typeof progressCallback === 'function') {
      config.onUploadProgress = progressCallback;
    }

    const response = await client.post('/observations/upload', payload, config);
    return response.data;
  },
  listMedia: async (skip = 0, limit = 12, fileType = '') => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (fileType) {
      params.append('file_type', fileType);
    }
    const response = await client.get(`/observations/media?${params.toString()}`);
    return response.data;
  },
  getUploadedMedia: async (skip = 0, limit = 50) => {
    const response = await client.get(`/observations/media?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  getMediaBlob: async (filename) => {
    const response = await client.get(`/observations/media/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  deleteMedia: async (filename) => {
    const response = await client.delete(`/observations/media/${filename}`);
    return response.data;
  }
};

export const newsAPI = {
  getLatest: async () => {
    const response = await client.get('/news/latest');
    return response.data;
  },
};

export const aiAPI = {
  analyzeImage: async (mediaId) => {
    const response = await client.post('/ai/image/analyze', { media_id: mediaId });
    return response.data;
  },
  analyzeAudio: async (mediaId, analysisType = 'bird') => {
    const response = await client.post('/ai/audio/analyze', {
      media_id: mediaId,
      analysis_type: analysisType,
    });
    return response.data;
  },
  getResults: async (resultId) => {
    const response = await client.get(`/ai/results/${resultId}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getPopulationCount: async () => {
    const response = await client.get('/analytics/population/count');
    return response.data;
  },
  getPopulationDensity: async () => {
    const response = await client.get('/analytics/population/density');
    return response.data;
  },
  getPopulationTrends: async (interval = 'daily') => {
    const response = await client.get(`/analytics/population/trends?interval=${interval}`);
    return response.data;
  },
  getBiodiversity: async () => {
    const response = await client.get('/analytics/biodiversity');
    return response.data;
  },
  getShannonIndex: async () => {
    const response = await client.get('/analytics/biodiversity/shannon');
    return response.data;
  },
  getGisHabitat: async () => {
    const response = await client.get('/analytics/gis/habitat');
    return response.data;
  },
  getSentinelNdvi: async () => {
    const response = await client.get('/analytics/gis/sentinel-ndvi');
    return response.data;
  },
  getConservationRecommendations: async () => {
    const response = await client.get('/analytics/conservation-recommendations');
    return response.data;
  }
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await client.get('/dashboard/stats');
    return response.data;
  }
};

export const ecosystemHealthAPI = {
  getHealthScore: async () => {
    const response = await client.get('/ecosystem-health/score');
    return response.data;
  }
};

export const reportsAPI = {
  exportPDF: async (payload) => {
    const response = await client.post('/reports/export-pdf', payload, {
      responseType: 'blob'
    });
    return response.data;
  },
  exportExcel: async (payload) => {
    const response = await client.post('/reports/export-excel', payload, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const adminAPI = {
  getDashboard: async (search = '', page = 1, limit = 10) => 
    (await client.get(`/admin/dashboard?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)).data,
  getKPIs: async () => (await client.get('/admin/kpis')).data,
  getUserActivity: async (search = '', page = 1, limit = 10) => 
    (await client.get(`/admin/users/activity?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)).data,
  getFlaggedUsers: async () => (await client.get('/admin/users/flagged')).data,
  getAIAnalytics: async () => (await client.get('/admin/ai-analytics')).data,
  getSystemHealth: async () => (await client.get('/admin/system-health')).data,
  getLeaderboard: async () => (await client.get('/admin/leaderboard')).data,
  getEvents: async () => (await client.get('/admin/events')).data,
  getDataQuality: async () => (await client.get('/admin/data-quality')).data,
  getAlerts: async () => (await client.get('/admin/alerts')).data,
  updateUserStatus: async (userId, status, reason = '') => 
    (await client.post(`/admin/users/${userId}/status`, { status, reason })).data,
  updateUserRole: async (userId, role) => 
    (await client.post(`/admin/users/${userId}/role`, { role })).data,
  resetUserPassword: async (userId, newPassword) => 
    (await client.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword })).data
};

export const alertsAPI = {
  getAlerts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.alert_type) query.append('alert_type', params.alert_type);
    if (params.severity) query.append('severity', params.severity);
    if (params.is_read !== undefined && params.is_read !== null) query.append('is_read', params.is_read);
    const response = await client.get(`/alerts?${query.toString()}`);
    return response.data;
  },
  getSummary: async () => {
    const response = await client.get('/alerts/summary');
    return response.data;
  },
  markAsRead: async (alertId) => {
    const response = await client.patch(`/alerts/${alertId}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await client.post('/alerts/mark-all-read');
    return response.data;
  },
  refreshAlerts: async () => {
    const response = await client.post('/alerts/refresh');
    return response.data;
  }
};

export default client;
