import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { CLINICIAN } from "types/account";
import { signupClinician } from "api/hooks/clinician";
import { useToast } from "providers/ToastProvider";

export const useSignup = () => {
  const { showSnackbar } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, unknown> | null>(
    null
  );

  const signup = async (data: CLINICIAN) => {
    setLoading(true);
    try {
      const response = await signupClinician(data);
      setResponse(response);
      showSnackbar("Clinician registered successfully", "success");
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
