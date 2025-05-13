import type { JwtPayload } from "jsonwebtoken";
import { createContext, type PropsWithChildren, useContext } from "react";

import { useToken } from "./useToken";

interface CookieContextType {
  token: JwtPayload | null;
}

const CookieContext = createContext<CookieContextType>({
  token: null,
});

export const useCookie = () => {
  return useContext(CookieContext);
};

export default function CookieProvider({ children }: PropsWithChildren) {
  const { token } = useToken();
  return (
    <CookieContext.Provider
      value={{
        token,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}
