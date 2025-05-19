import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useGetAllAppointments } from "api/hooks/patient";

// TODO: Dummy type, needs to be export in types folder
type APPOINTMENT = {
  name: string;
  date: string;
  status: string;
};

export default function useAppointments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<APPOINTMENT[]>();

  const getAppointments = async (
    page?: number,
    limit?: number,
    filters?: string[]
  ) => {
    page = page ?? 1;
    limit = limit ?? 10;
    filters = filters ?? [];

    setIsLoading(true);
    try {
      const { data } = await useGetAllAppointments(page, limit, filters);
      setAppointments(data as APPOINTMENT[]);
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

  useEffect(() => {
    getAppointments();
  }, []);

  return { isLoading, error, appointments, getAppointments };
}
