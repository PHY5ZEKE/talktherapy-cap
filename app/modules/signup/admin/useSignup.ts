import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { ADMIN } from "types/account";
import { useToast } from "providers/ToastProvider";
import { signupAdmin } from "api/hooks/admin";

export const useSignup = () => {
  const { showSnackbar } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, unknown> | null>(
    null
  );

  const signup = async (data: ADMIN) => {
    setLoading(true);
    try {
      const response = await signupAdmin(data);
      setResponse(response);
      showSnackbar("Admin registered successfully", "success");
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
      // redirect to login page
      navigate("/login");
    }
  };

  return { loading, error, response, signup };
};
