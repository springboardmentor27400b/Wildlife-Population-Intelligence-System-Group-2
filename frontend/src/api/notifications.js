import apiClient from './axios';

export const getNotifications = async (params = {}) => {
  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data;
};
