export type HttpResponse<T> = {
  data: T;
  status: number;
};

export type DATA = {
  [key: string]: any;
};

export type TABLE_LIST_RESPONSE = {
  data: DATA[];
  total_rows: number;
  page: number;
  limit: number;
};

export type QueryParams = {
  page: number;
  limit: number;
  offset: number;
  filters: string[];
};

export interface UploadResponse {
  message: string;
  fileUrl: string;
}
