import { useEffect, useState, useCallback } from "react";

import type { JwtPayload } from "jsonwebtoken";
import { http } from "utils/http";

interface TokenResponse {
  valid: boolean;
  token: JwtPayload;
}

export const useToken = () => {
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState<JwtPayload | null>(null);

  const validateToken = async () => {
    setLoading(true);
    try {
      const { data } = await http<TokenResponse>(
        "GET",
        "/api/auth/validate-token"
      );

      if (data.valid && data.token) {
        setToken(data.token);
        return true;
      }
      if (token !== null) {
        setToken(null);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      if (token !== null) {
        setToken(null);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    setToken(null);
  };

  useEffect(() => {
    validateToken();
  }, []); // Run once on mount

  return {
    token,
    validateToken,
    clearToken,
    isLoading,
  };
};
