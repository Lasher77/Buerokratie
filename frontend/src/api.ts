import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

/**
 * API-Basiskonfiguration
 *
 * Die API_BASE URL wird über die Umgebungsvariable REACT_APP_API_BASE_URL gesetzt.
 * Wenn nicht gesetzt (z.B. in Produktion bei Same-Origin), bleibt sie leer.
 *
 * Beispiele für .env:
 * - Entwicklung: REACT_APP_API_BASE_URL=http://localhost:5000
 * - Produktion (Same-Origin): REACT_APP_API_BASE_URL= (leer lassen)
 * - Produktion (Cross-Origin): REACT_APP_API_BASE_URL=https://api.example.com
 */
export const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

// Session-ID für anonyme Abstimmungen
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Axios-Instanz mit Standardkonfiguration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Token und Session-ID hinzufügen
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth Token hinzufügen wenn vorhanden
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Session-ID für Abstimmungen
    if (config.headers) {
      config.headers['x-session-id'] = getSessionId();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Fehlerbehandlung
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Token abgelaufen - automatisch ausloggen
    if (error.response?.status === 401) {
      const message = error.response.data?.message;
      if (message === 'Token abgelaufen' || message === 'Ungültiger Token') {
        localStorage.removeItem('authToken');
        // Event für AuthContext auslösen
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    // CORS-Fehler erkennen
    if (!error.response && error.message === 'Network Error') {
      console.error('Netzwerkfehler - möglicherweise CORS-Problem. Prüfen Sie ALLOWED_ORIGINS im Backend.');
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper für Error-Messages
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.message || axiosError.message || 'Ein Fehler ist aufgetreten';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten';
};
