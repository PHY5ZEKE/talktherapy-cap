import { useState } from "react";

import { logout } from "api/hooks/auth";
import { AxiosError } from "axios";
import { useToast } from "providers/ToastProvider";
import type { DATA } from "types/response";
export const useLogout = () => {
  const { showSnackbar } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = (await logout()) as DATA;
      showSnackbar(data.message, "success");
      window.location.href = data.redirect;
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || "Logout failed");
      } else if (error instanceof Error) {
        setError(error.message);
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
    logout: postLogout,
  };
};
