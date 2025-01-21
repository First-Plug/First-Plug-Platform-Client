import axios from "axios";
import { signOut } from "next-auth/react";

export const BASE_URL: string = process.env.NEXT_PUBLIC_API;
export const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.status && error.status === 401) {
      signOut({ redirect: true });
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
    try {
      return await axiosInstance.get(url, config);
    } catch (error) {
      throw error;
    }
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

  static async patch<T>(url: string, payload: T) {
    try {
      return await axiosInstance.patch(url, payload);
    } catch (error) {
      throw error;
    }
  }
}
