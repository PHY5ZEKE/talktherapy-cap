import type { JwtPayload } from "jsonwebtoken";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { useToken } from "./useToken";

interface CookieContextType {
  token: JwtPayload | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const CookieContext = createContext<CookieContextType>({
  token: null,
  isLoading: false,
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const useCookie = () => {
  return useContext(CookieContext);
};

export default function CookieProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { token, isLoading } = useToken();

  return (
    <CookieContext.Provider
      value={{
        token,
        isLoading,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}
