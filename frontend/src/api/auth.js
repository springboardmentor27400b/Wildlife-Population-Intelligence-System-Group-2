import apiClient from './axios';

export const loginUser = async (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  
  const response = await apiClient.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const registerUser = async (email, password, fullName, role) => {
  const response = await apiClient.post('/auth/register', {
    email,
    password,
    full_name: fullName,
    role,
  });
  return response.data;
};
