import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStore';
import { emitSessionExpired } from './authEvents';

export const client = axios.create({ baseURL: '/api/v1' });

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

function isAuthEndpoint(url = '') {
  return url.startsWith('/auth/');
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status !== 401 || !config || config._retry || isAuthEndpoint(config.url)) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // A 401 while holding an access token means it is no longer valid.
      if (getAccessToken()) {
        clearTokens();
        emitSessionExpired();
      }
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      refreshPromise ??= axios
        .post('/api/v1/auth/refresh', { refreshToken })
        .then(({ data }) => {
          setTokens(data);
          return data;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const data = await refreshPromise;
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      return client(config);
    } catch (refreshError) {
      clearTokens();
      emitSessionExpired();
      return Promise.reject(refreshError);
    }
  }
);
