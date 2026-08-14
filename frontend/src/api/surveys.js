import apiClient from './axios';

export const getSurveys = async (params = {}) => {
  const response = await apiClient.get('/surveys', { params });
  return response.data;
};

export const getSurvey = async (id) => {
  const response = await apiClient.get(`/surveys/${id}`);
  return response.data;
};

export const createSurvey = async (surveyData) => {
  const response = await apiClient.post('/surveys', surveyData);
  return response.data;
};

export const updateSurvey = async (id, surveyData) => {
  const response = await apiClient.put(`/surveys/${id}`, surveyData);
  return response.data;
};

export const deleteSurvey = async (id) => {
  const response = await apiClient.delete(`/surveys/${id}`);
  return response.data;
};
