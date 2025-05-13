import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { PATIENT } from "types/account";
import { signupPatient } from "api/hooks/patient";
import { useToast } from "providers/ToastProvider";

export const useSignup = () => {
  const { showSnackbar } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, unknown> | null>(
    null
  );

  const signup = async (data: PATIENT) => {
    setLoading(true);
    try {
      const response = await signupPatient(data);
      setResponse(response);
      showSnackbar("Patient registered successfully", "success");
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
