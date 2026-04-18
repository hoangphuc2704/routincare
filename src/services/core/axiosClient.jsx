import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAllAuth,
} from '../../utils/tokenService';

// Dev (localhost:5174) luôn dùng relative path để đi qua Vite proxy, tránh CORS
const isDev = import.meta.env.DEV && window.location.host.includes('localhost:5174');
const rawBaseURL = isDev ? '' : import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshPromise = null;
const subscribers = [];

const subscribeTokenRefresh = (callback) => {
  subscribers.push(callback);
};

const onRefreshed = (newToken) => {
  subscribers.forEach((cb) => cb(newToken));
  subscribers.length = 0;
};

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Log for debugging
    console.error(' API Error:', {
      url: error.config?.url,
      status,
      data: error.response?.data,
      message: error.message,
    });

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAllAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = axios
        .post(`${baseURL}/api/Auth/refresh-token`, { refreshToken })
        .then((res) => {
          const newAccess = res.data?.accessToken || res.data?.data?.accessToken;
          const newRefresh = res.data?.refreshToken || res.data?.data?.refreshToken;
          if (newAccess) {
            setAuthTokens(newAccess, newRefresh || refreshToken);
            onRefreshed(newAccess);
            return newAccess;
          }
          throw new Error('No access token returned from refresh');
        })
        .catch((err) => {
          clearAllAuth();
          throw err;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        if (!newToken) {
          reject(error);
          return;
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(axiosClient(originalRequest));
      });

      if (refreshPromise) {
        refreshPromise.catch(reject);
      }
    });
  }
);

export default axiosClient;
