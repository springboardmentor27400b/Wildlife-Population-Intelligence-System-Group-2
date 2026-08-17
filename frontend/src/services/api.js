import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;
const baseURL = backendUrl ? (backendUrl.endsWith('/') ? `${backendUrl}api` : `${backendUrl}/api`) : '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
