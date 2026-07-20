import api from './api';

const uploadService = {
  getUploads: async () => {
    try {
      const response = await api.get('/uploads/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUpload: async (uploadId) => {
    try {
      const response = await api.get(`/uploads/${uploadId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUpload: async (formData) => {
    try {
      const response = await api.post('/uploads/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUpload: async (uploadId, data) => {
    try {
      // data could be FormData or simple JSON object
      const isFormData = data instanceof FormData;
      const response = await api.put(`/uploads/${uploadId}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUpload: async (uploadId) => {
    try {
      const response = await api.delete(`/uploads/${uploadId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default uploadService;
