import { createContext, useState, useEffect } from "react";
import { encrypt, decrypt } from './aesUtilities';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialAuthState = {
    accessToken: localStorage.getItem('accessToken') ? decrypt(localStorage.getItem('accessToken')) : null,
    userRole: localStorage.getItem('userRole') ? decrypt(localStorage.getItem('userRole')) : null,
    userId: localStorage.getItem('userId') ? decrypt(localStorage.getItem('userId')) : null,
  };

  const [authState, setAuthState] = useState(initialAuthState);

  const setAuthInfo = (accessToken, userRole) => {
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedUserRole = encrypt(userRole);
    localStorage.setItem('accessToken', encryptedAccessToken);
    localStorage.setItem('userRole', encryptedUserRole);
    setAuthState({ ...authState, accessToken, userRole });
  };

  const setUserId = (userId) => {
    const encryptedUserId = encrypt(userId);
    localStorage.setItem('userId', encryptedUserId);
    setAuthState({ ...authState, userId });
  };

  const clearOnLogOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setAuthState({ accessToken: null, userRole: null, userId: null });
  };

  useEffect(() => {
    const storedAuthState = {
      accessToken: localStorage.getItem('accessToken') ? decrypt(localStorage.getItem('accessToken')) : null,
      userRole: localStorage.getItem('userRole') ? decrypt(localStorage.getItem('userRole')) : null,
      userId: localStorage.getItem('userId') ? decrypt(localStorage.getItem('userId')) : null,
    };
    setAuthState(storedAuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthInfo, setUserId, clearOnLogOut }}>
      {children}
    </AuthContext.Provider>
  );
};