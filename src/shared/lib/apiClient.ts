import type { AxiosInstance } from 'axios';
import axios, { AxiosError } from 'axios';
import { tokenStorage } from '@/features/auth/lib/token-storage';
import { queryClient } from './queryClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

apiClient.interceptors.request.use(config => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clearToken();
      queryClient.clear();
    }

    if (import.meta.env.DEV) {
      console.error('[apiClient error]', error);
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: async <T, P extends Record<string, unknown> = Record<string, unknown>>(url: string, params?: P): Promise<T> => {
    const { data } = await apiClient.get<T>(url, { params });
    return data;
  },

  post: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const { data } = await apiClient.post<T>(url, body);
    return data;
  },

  put: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const { data } = await apiClient.put<T>(url, body);
    return data;
  },

  patch: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const { data } = await apiClient.patch<T>(url, body);
    return data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const { data } = await apiClient.delete<T>(url);
    return data;
  },
};
