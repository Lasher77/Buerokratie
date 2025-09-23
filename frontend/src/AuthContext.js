import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children, initialUser = null }) => {
  const [user, setUser] = useState(initialUser);
  const logoutTimeoutRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  const logout = () => {
    clearLogoutTimer();
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const scheduleLogout = (exp) => {
    clearLogoutTimer();
    if (!exp) {
      return;
    }
    const expiresInMs = exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      logout();
      return;
    }
    logoutTimeoutRef.current = setTimeout(logout, expiresInMs);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
          logout();
        } else {
          setUser({ role: decoded.role });
          scheduleLogout(decoded.exp);
        }
      } catch {
        logout();
      }
    }
    return () => clearLogoutTimer();
  }, []);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      logout();
      return;
    }
    setUser({ role: decoded.role });
    scheduleLogout(decoded.exp);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
