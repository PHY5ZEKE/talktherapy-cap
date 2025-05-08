import { useState } from "react";
import type { LOGIN_PAYLOAD } from "types/credentials";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LOGIN_PAYLOAD) => {
    setIsLoading(true);
    setError(null);
    try {
      // simulate login
      if (payload.email === "test@test.com" && payload.password === "test") {
        setError(null);
        return;
      }

      setError("Your email or password is incorrect.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
  };
};
