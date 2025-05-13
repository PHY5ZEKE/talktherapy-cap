import { useEffect, useState, useCallback } from "react";

import type { JwtPayload } from "jsonwebtoken";
import { http } from "utils/http";

interface TokenResponse {
  valid: boolean;
  token: JwtPayload;
}

export const useToken = () => {
  const [token, setToken] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async () => {
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
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (isLoading) {
        await validateToken();
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [validateToken, isLoading]);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return {
    token,
    validateToken,
    logout,
    isLoading,
    isAuthenticated: !!token,
  };
};
