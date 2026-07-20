import api from './api';

const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  getUnread: async () => {
    const res = await api.get('/notifications/unread');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
  markSelectedRead: async (ids) => {
    const res = await api.put('/notifications/bulk/read', { ids });
    return res.data;
  },
  deleteSelected: async (ids) => {
    const res = await api.delete('/notifications/bulk/delete', { data: { ids } });
    return res.data;
  },
  clearAll: async () => {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  }
};

export default notificationService;
