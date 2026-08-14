import apiClient from './axios';

export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};
