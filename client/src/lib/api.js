import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
export const AUTH_STORAGE_KEY = 'cropwise_auth';

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { accessToken: '', refreshToken: '' };
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return { accessToken: parsed, refreshToken: '' };
    }
    return {
      accessToken: parsed?.accessToken || '',
      refreshToken: parsed?.refreshToken || ''
    };
  } catch (_error) {
    return { accessToken: '', refreshToken: '' };
  }
};

export const setStoredAuth = ({ accessToken = '', refreshToken = '' }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredAuth();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (error?.response?.status !== 401 || originalRequest._retry) {
      throw error;
    }

    if (String(originalRequest.url || '').includes('/auth/login') || String(originalRequest.url || '').includes('/auth/register') || String(originalRequest.url || '').includes('/auth/refresh')) {
      throw error;
    }

    const { refreshToken } = getStoredAuth();
    if (!refreshToken) {
      clearStoredAuth();
      throw error;
    }

    if (!refreshPromise) {
      refreshPromise = api
        .post('/auth/refresh', { refreshToken })
        .then((response) => {
          const nextAccessToken = response.data.accessToken;
          const nextRefreshToken = response.data.refreshToken || refreshToken;
          setStoredAuth({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
          return nextAccessToken;
        })
        .catch((refreshError) => {
          clearStoredAuth();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const nextAccessToken = await refreshPromise;
    originalRequest._retry = true;
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

    return api(originalRequest);
  }
);

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Something went wrong';
};
