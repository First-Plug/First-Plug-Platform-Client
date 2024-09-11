import axios from "axios";

export const BASE_URL: string = process.env.NEXT_PUBLIC_API;
export const axiosInstance = axios.create({ baseURL: BASE_URL });

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
    return await axiosInstance.get(url);
  }

  static async post<T>(url: string, payload: T) {
    return await axiosInstance.post(url, payload);
  }

  static async put<T>(url: string, payload: T) {
    return await axiosInstance.put(url, payload);
  }
  static async delete(url: string, config?: any) {
    return await axiosInstance.delete(url, config);
  }
  static async patch<T>(url: string, payload: T) {
    return await axiosInstance.patch(url, payload);
  }
}
