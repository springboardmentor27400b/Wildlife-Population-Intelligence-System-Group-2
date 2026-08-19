import apiClient from './axios';

export const getProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/users/me', profileData);
  return response.data;
};

export const listUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await apiClient.put(`/users/${userId}`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};
