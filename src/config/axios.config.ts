import axios from "axios";
import { cleanupAndSignOut } from "@/shared/services/sessionCleanup";

export const BASE_URL: string = process.env.NEXT_PUBLIC_API;
export const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      await cleanupAndSignOut();
      return;
    }

    return Promise.reject(error);
  }
);

export const setAuthInterceptor = (token: string | null) => {
  return axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export class HTTPRequests {
  static async get(url: string, config?: any) {
    return await axiosInstance.get(url, config);
  }

  static async post<T>(url: string, payload: T) {
    try {
      return await axiosInstance.post(url, payload);
    } catch (error) {
      throw error;
    }
  }

  static async put<T>(url: string, payload: T) {
    try {
      return await axiosInstance.put(url, payload);
    } catch (error) {
      // El interceptor ya maneja el 401
    }
  }

  static async delete(url: string, config?: any) {
    try {
      return await axiosInstance.delete(url, config);
    } catch (error) {
      // El interceptor ya maneja el 401
    }
  }

  static async patch<T = unknown>(url: string, payload?: T) {
    try {
      return await axiosInstance.patch(url, payload ?? undefined);
    } catch (error) {
      throw error;
    }
  }
}
