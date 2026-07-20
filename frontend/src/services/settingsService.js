import api from './api';

const settingsService = {
  getProfile: async () => {
    const res = await api.get('/settings/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/settings/profile', data);
    return res.data;
  },
  getPreferences: async () => {
    const res = await api.get('/settings/preferences');
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await api.put('/settings/preferences', { preferences });
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.put('/settings/password', data);
    return res.data;
  }
};

export default settingsService;
