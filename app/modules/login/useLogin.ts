import { useState } from "react";
import type { LOGIN_PAYLOAD } from "types/credentials";

import { login } from "api/hooks/auth";
import { AxiosError } from "axios";
import { useToast } from "providers/ToastProvider";

export const useLogin = () => {
  const { showSnackbar } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postLogin = async (payload: LOGIN_PAYLOAD) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(payload);

      showSnackbar(response.data.message as string, "success");
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

  return {
    isLoading,
    error,
    login: postLogin,
  };
};
