import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { getAllAdmins } from "api/hooks/super";

import type { TABLE_LIST_RESPONSE } from "types/response";

export default function useAdmins() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<TABLE_LIST_RESPONSE>({
    data: [],
    total_rows: 0,
    page: 1,
    limit: 10,
  });

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<string[]>([]);

  const getAdmins = async (
    page: number = 1,
    limit: number = 10,
    filters: string[] = []
  ) => {
    setIsLoading(true);
    try {
      const { data } = await getAllAdmins(page, limit, filters);
      setAdmins(data as TABLE_LIST_RESPONSE);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async (
    newPage: number,
    newLimit: number,
    newFilters: string[]
  ) => {
    setPage(newPage);
    setLimit(newLimit);
    setFilters(newFilters);
    await getAdmins(newPage + 1, newLimit, newFilters);
  };

  useEffect(() => {
    handleQuery(0, limit, filters);
  }, []);

  return {
    isLoading,
    error,
    admins,
    page,
    limit,
    filters,
    handleQuery,
    getAdmins,
  };
}
