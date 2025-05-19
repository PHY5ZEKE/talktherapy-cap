export type DATA = {
  [key: string]: any;
};

export type TABLE_LIST_RESPONSE = {
  data: DATA[];
  total_rows: number;
  page: number;
  limit: number;
};
