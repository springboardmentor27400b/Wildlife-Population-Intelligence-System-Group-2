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

export const markNotificationAsUnread = async (id) => {
  const response = await apiClient.put(`/notifications/${id}/unread`);
  return response.data;
};

export const resolveNotification = async (id) => {
  const response = await apiClient.put(`/notifications/${id}/resolve`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await apiClient.delete(`/notifications/${id}`);
  return response.data;
};
