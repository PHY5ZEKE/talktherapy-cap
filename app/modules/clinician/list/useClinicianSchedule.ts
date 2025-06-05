import { useState, useEffect } from "react";

import { AxiosError } from "axios";
import { getClinicianScheduleById } from "api/hooks/clinician";
import type { TABLE_LIST_RESPONSE } from "types/response";

export const useClinicianSchedule = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<TABLE_LIST_RESPONSE>({
    data: [],
    total_rows: 0,
    page: 1,
    limit: 10,
  });

  const fetchSchedules = async (
    page: number = 1,
    limit: number = 10,
    selectedDate: string | null = null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getClinicianScheduleById(
        page,
        limit,
        selectedDate
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
    newSelectedDate: string | null
  ) => {
    setPage(newPage);
    setLimit(newLimit);
    setSelectedDate(newSelectedDate);
    await fetchSchedules(newPage + 1, newLimit, newSelectedDate);
  };

  useEffect(() => {
    handleQuery(0, limit, selectedDate);
  }, [selectedDate]);

  return {
    schedules,
    isLoading,
    error,
    page,
    limit,
    selectedDate,
    handleQuery,
    fetchSchedules,
  };
};
