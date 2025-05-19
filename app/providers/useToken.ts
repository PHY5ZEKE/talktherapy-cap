import { useEffect, useState } from "react";

import type { JwtPayload } from "jsonwebtoken";
import { http } from "utils/http";
import { useCookie } from "./CookieProvider";

interface TokenResponse {
  valid: boolean;
  token: JwtPayload;
}

export const useToken = () => {
  const { isLoggedIn, setIsLoggedIn } = useCookie();
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useState<JwtPayload | null>(null);

  // get cookie and validate
  // for session purpose lang
  const validateToken = async () => {
    try {
      const { data } = await http<TokenResponse>("GET", "/api/auth/get-cookie");

      if (data.valid && data.token) {
        setToken(data.token);
        setIsLoggedIn(true);
        return true;
      }

      // If token is invalid or missing, clear the state
      setToken(null);
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error("Error validating token:", error);
      setToken(null);
      setIsLoggedIn(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    setToken(null);
    setIsLoggedIn(false);
  };

  // Validate token on mount and when isLoggedIn changes
  useEffect(() => {
    validateToken();
  }, [isLoggedIn]); // Add isLoggedIn to dependencies

  return {
    token,
    validateToken,
    clearToken,
    isLoading,
  };
};
