import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { getCookie } from "./cookie";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // handle unauthorized redirect or modal
      console.error("Unauthorized access");
    } else if (error.response?.status === 403) {
      // handle forbidden
      console.error("Access forbidden");
    }
    return Promise.reject(error);
  }
);

export type HttpResponse<T> = {
  data: T;
  status: number;
};

export const http = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: unknown
): Promise<HttpResponse<T>> => {
  try {
    const response = await instance.request<T, AxiosResponse<T>>({
      method,
      url,
      data,
    });
    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError) {
      // add specific error handling here
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
};
