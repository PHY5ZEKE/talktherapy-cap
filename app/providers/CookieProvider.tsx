import type { JwtPayload } from "jsonwebtoken";
import { createContext, type PropsWithChildren, useContext } from "react";

import { useToken } from "./useToken";

interface CookieContextType {
  token: JwtPayload | null;
  isLoading: boolean;
}

const CookieContext = createContext<CookieContextType>({
  token: null,
  isLoading: false,
});

export const useCookie = () => {
  return useContext(CookieContext);
};

export default function CookieProvider({ children }: PropsWithChildren) {
  const { token, isLoading } = useToken();

  return (
    <CookieContext.Provider
      value={{
        token,
        isLoading,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}
