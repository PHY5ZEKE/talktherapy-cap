import { AxiosError } from "axios";
import { useState } from "react";

import { useToast } from "providers/ToastProvider";
import { createSchedule } from "api/hooks/clinician";

import type { CLINICIAN_SCHEDULE } from "types/clinician";

export default function useCreateSchedule() {
  const { showSnackbar } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const postSchedule = async (payload: CLINICIAN_SCHEDULE) => {
    setIsLoading(true);
    try {
      const { data } = await createSchedule(payload);
      showSnackbar((data as { message: string }).message, "success");
    } catch (error: string | any) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createSchedule: postSchedule,
  };
}
