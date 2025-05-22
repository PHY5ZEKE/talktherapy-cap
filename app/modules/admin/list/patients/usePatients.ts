import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { getAllPatients } from "api/hooks/admin";

import type { TABLE_LIST_RESPONSE } from "types/response";

export default function useAppointments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<TABLE_LIST_RESPONSE>({
    data: [],
    total_rows: 0,
    page: 1,
    limit: 10,
  });

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<string[]>([]);

  const getAppointments = async (
    page: number = 1,
    limit: number = 10,
    filters: string[] = []
  ) => {
    setIsLoading(true);
    try {
      const { data } = await getAllPatients(page, limit, filters);
      setPatients(data as TABLE_LIST_RESPONSE);
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
    await getAppointments(newPage + 1, newLimit, newFilters);
  };

  useEffect(() => {
    handleQuery(0, limit, filters);
  }, []);

  return {
    isLoading,
    error,
    patients,
    page,
    limit,
    filters,
    handleQuery,
    getAppointments,
  };
}
