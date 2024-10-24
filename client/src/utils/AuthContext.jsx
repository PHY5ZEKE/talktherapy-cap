import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: null,
    userRole: null,
    userId: null,
  });

  const [userState, setUserState] = useState({
    id: null,
  });

  const setAuthInfo = (accessToken, userRole) => {
    setAuthState({ accessToken, userRole });
  };

  const clearOnLogOut = () => {
    setAuthState({ accessToken: null, userRole: null, userId: null });
    setUserState({ id: null });
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthInfo, userState, setUserState, clearOnLogOut }}>
      {children}
    </AuthContext.Provider>
  );
};
