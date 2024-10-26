import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialAuthState = {
    accessToken: localStorage.getItem('accessToken'),
    userRole: localStorage.getItem('userRole'),
    userId: localStorage.getItem('userId'),
  };

  const [authState, setAuthState] = useState(initialAuthState);

  const setAuthInfo = (accessToken, userRole) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userRole', userRole);
    setAuthState({ ...authState, accessToken, userRole });
  };

  const setUserId = (userId) => {
    localStorage.setItem('userId', userId);
    setAuthState({ ...authState, userId });
  };

  const clearOnLogOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setAuthState({ accessToken: null, userRole: null, userId: null });  };

  useEffect(() => {
    const storedAuthState = {
      accessToken: localStorage.getItem('accessToken'),
      userRole: localStorage.getItem('userRole'),
      userId: localStorage.getItem('userId'),
    };
    setAuthState(storedAuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthInfo, setUserId, clearOnLogOut }}>
      {children}
    </AuthContext.Provider>
  );
};
