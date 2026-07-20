import api from './api';

const deviceService = {
  getDevices: async () => {
    try {
      const response = await api.get('/devices/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDevice: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createDevice: async (deviceData) => {
    try {
      const response = await api.post('/devices/', deviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put(`/devices/${deviceId}`, deviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default deviceService;
