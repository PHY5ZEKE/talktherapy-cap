import axios, { AxiosError } from "axios";

import type { AxiosResponse } from "axios";
import type { ParsedQs } from "qs";
import type { QueryParams, HttpResponse } from "types/response";

import { getCookie } from "./cookie";

type HttpOptions = {
  data?: unknown;
  params?: Record<string, any>;
};

const instance = axios.create({
  baseURL: import.meta.env?.VITE_SERVER_URL || process.env?.VITE_SERVER_URL,
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

export const http = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options: HttpOptions = {}
): Promise<HttpResponse<T>> => {
  const { data, params } = options;
  try {
    const response = await instance.request<T, AxiosResponse<T>>({
      method,
      url,
      data,
      params,
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

// helper for file upload
export const uploader = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  formData: FormData
): Promise<HttpResponse<T>> => {
  try {
    const response = await instance.request<T>({
      method,
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error("An unexpected error occurred during file upload");
  }
};

export const parseQueryParams = (query: ParsedQs): QueryParams => {
  const page = Math.max(1, parseInt(String(query.page || "1")));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(query.limit || "10")))
  );
  const filters = Array.isArray(query.filters)
    ? query.filters.map((item) => String(item))
    : String(query.filters || "")
        .split(",")
        .filter(Boolean);

  const parsed: QueryParams = {
    page,
    limit,
    offset: (page - 1) * limit,
    filters,
  };

  for (const key in query) {
    if (!["page", "limit", "filters"].includes(key)) {
      parsed[key] = Array.isArray(query[key])
        ? query[key]
        : String(query[key] || "")
            .split(",")
            .filter(Boolean);
    }
  }

  return parsed;
};

export const buildFilterQuery = (
  base: Record<string, any>,
  filters: Record<string, string | string[] | undefined>
): Record<string, any> => {
  const query = { ...base };

  for (const [field, value] of Object.entries(filters)) {
    if (!value || (Array.isArray(value) && value.length === 0)) continue;
    query[field] = Array.isArray(value) ? { $in: value } : value;
  }

  return query;
};
