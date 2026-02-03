import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode
} from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import type { User, JwtPayload, SetupStatus } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsSetup: boolean;
  login: (token: string) => void;
  logout: () => void;
  completeSetup: (token: string) => void;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  needsSetup: false,
  login: () => {},
  logout: () => {},
  completeSetup: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearLogoutTimer();
    localStorage.removeItem('authToken');
    setUser(null);
  }, [clearLogoutTimer]);

  const scheduleLogout = useCallback((exp: number | undefined) => {
    clearLogoutTimer();
    if (!exp) return;

    const expiresInMs = exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      logout();
      return;
    }
    logoutTimeoutRef.current = setTimeout(logout, expiresInMs);
  }, [clearLogoutTimer, logout]);

  const setUserFromToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        logout();
        return false;
      }

      setUser({
        id: decoded.id,
        email: '', // Email nicht im Token, wird bei Bedarf vom Server geladen
        role: decoded.role
      });
      scheduleLogout(decoded.exp);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout, scheduleLogout]);

  const login = useCallback((token: string) => {
    localStorage.setItem('authToken', token);
    setUserFromToken(token);
  }, [setUserFromToken]);

  const completeSetup = useCallback((token: string) => {
    setNeedsSetup(false);
    login(token);
  }, [login]);

  // Initialisierung: Setup-Status und Token prüfen
  useEffect(() => {
    const initialize = async () => {
      try {
        // Prüfen ob Setup nötig ist
        const response = await api.get<SetupStatus>('/api/setup/status');

        if (response.data.needsSetup) {
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Setup nicht nötig - Token prüfen
        const token = localStorage.getItem('authToken');
        if (token) {
          setUserFromToken(token);
        }
      } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        // Bei Fehler annehmen, dass kein Setup nötig ist
        const token = localStorage.getItem('authToken');
        if (token) {
          setUserFromToken(token);
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Event-Listener für automatischen Logout (von API-Interceptor)
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      clearLogoutTimer();
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [clearLogoutTimer, logout, setUserFromToken]);

  return (
    <AuthContext.Provider value={{ user, loading, needsSetup, login, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
