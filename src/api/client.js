import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

const ACCESS_TOKEN_KEY = 'afripay_pro_access_token';
const REFRESH_TOKEN_KEY = 'afripay_pro_refresh_token';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// Called by AuthContext once mounted, so a hard 401 can force a logout.
let onAuthFailure = null;
export function setOnAuthFailure(handler) {
  onAuthFailure = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('Aucun refreshToken disponible');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;
        await saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

        resolveQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        await clearTokens();
        if (onAuthFailure) onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Normalizes both axios/network errors and API error payloads into a
// friendly French message, so screens can just display err.message.
export function extractErrorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === 'Network Error') {
    return "Impossible de joindre le serveur AfriPay. Vérifiez votre connexion et l'adresse configurée dans src/config/api.js.";
  }
  if (error?.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre. Réessayez.';
  return fallback;
}

export default api;
