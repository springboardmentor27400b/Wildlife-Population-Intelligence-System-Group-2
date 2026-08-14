import apiClient from './axios';

export const getEcologicalReport = async (siteId = null) => {
  const params = siteId ? { site_id: siteId } : {};
  const response = await apiClient.get('/ecological', { params });
  return response.data;
};
