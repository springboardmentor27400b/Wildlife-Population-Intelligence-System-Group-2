import axios from "axios";
import { toast } from "sonner";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080";

export const TOKEN_KEY = "wildsight_token";
export const USER_KEY = "wildsight_user";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }
    return Promise.reject(error);
  },
);

export interface CrudService<T = any> {
  list: (params?: Record<string, any>) => Promise<T[]>;
  get: (id: string | number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  remove: (id: string | number) => Promise<void>;
}

export function createCrudService<T = any>(resource: string): CrudService<T> {
  return {
    list: async (params) => {
      const { data } = await api.get(`/api/${resource}`, { params });
      // handle both {content:[]} paged and array responses
      if (Array.isArray(data)) return data;
      if (data?.content && Array.isArray(data.content)) return data.content;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    get: async (id) => (await api.get(`/api/${resource}/${id}`)).data,
    create: async (data) => (await api.post(`/api/${resource}`, data)).data,
    update: async (id, data) => (await api.put(`/api/${resource}/${id}`, data)).data,
    remove: async (id) => {
      await api.delete(`/api/${resource}/${id}`);
    },
  };
}

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post(`/api/auth/login`, { email, password });
    return data as { token: string; user?: any; role?: string; email?: string; fullName?: string };
  },
  register: async (payload: Record<string, any>) => {
    const { data } = await api.post(`/api/auth/register`, payload);
    return data;
  },
};
