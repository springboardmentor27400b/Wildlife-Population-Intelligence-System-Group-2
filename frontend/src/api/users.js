import apiClient from './axios';

export const getProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/users/me', profileData);
  return response.data;
};
