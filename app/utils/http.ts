import axios, { AxiosError } from "axios";
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
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.log("error", error);
    // handle error codes
    return Promise.reject(error);
  }
);

export const http = async <T = Record<string, unknown>>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: Record<string, unknown>
) => {
  try {
    const response = await instance.request<T>({
      method,
      url,
      data,
    });
    // return data and status
    return { data: response.data, status: response.status };
  } catch (error) {
    // handle error codes

    console.error("HTTP Error:", error);
    throw error;
  }
};
