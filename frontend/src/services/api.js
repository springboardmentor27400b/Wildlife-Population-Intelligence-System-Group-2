import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;
export const baseURL = backendUrl ? (backendUrl.endsWith('/') ? `${backendUrl}api` : `${backendUrl}/api`) : '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function resolveAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    const envBackend = import.meta.env.VITE_API_URL;
    if (envBackend) {
        const cleanBase = envBackend.replace(/\/+$/, '');
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${cleanBase}${cleanPath}`;
    }
    return url;
}
