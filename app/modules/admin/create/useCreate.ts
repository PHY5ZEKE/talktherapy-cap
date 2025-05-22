import { AxiosError } from "axios";
import { useState } from "react";

import { useToast } from "providers/ToastProvider";
import { createClinician } from "api/hooks/admin";

import type { CLINICIAN } from "types/account";

export default function useCreate() {
  const { showSnackbar } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const postClinician = async (payload: CLINICIAN) => {
    setIsLoading(true);
    try {
      const { data } = await createClinician(payload);
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
    createClinician: postClinician,
  };
}
