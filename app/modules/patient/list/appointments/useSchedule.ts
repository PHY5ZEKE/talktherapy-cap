import { useState, useEffect } from "react";

import { AxiosError } from "axios";
import { getClinicianSchedules } from "api/hooks/patient";
import type { TABLE_LIST_RESPONSE } from "types/response";

export const useSchedule = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<TABLE_LIST_RESPONSE>({
    data: [],
    total_rows: 0,
    page: 1,
    limit: 10,
  });

  const fetchSchedules = async (
    page: number = 1,
    limit: number = 10,
    selectedDate: string | null = null,
    filters: string[] | null = null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getClinicianSchedules(
        page,
        limit,
        selectedDate,
        filters
      );
      setSchedules(data as TABLE_LIST_RESPONSE);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || "Failed to fetch schedules");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleQuery = async (
    newPage: number,
    newLimit: number,
    newSelectedDate: string | null,
    newFilters: string[]
  ) => {
    setPage(newPage);
    setLimit(newLimit);
    setSelectedDate(newSelectedDate);
    setFilters(newFilters);
    await fetchSchedules(newPage + 1, newLimit, newSelectedDate, newFilters);
  };

  useEffect(() => {
    handleQuery(0, limit, selectedDate, filters);
  }, [selectedDate, filters]);

  return {
    schedules,
    isLoading,
    error,
    page,
    limit,
    selectedDate,
    filters,
    handleQuery,
    fetchSchedules,
  };
};
