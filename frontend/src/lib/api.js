import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

const NO_AUTH_PREFIXES = [
  "/api/auth/register/",
  "/api/auth/token/",
  "/api/auth/refresh/",
  "/api/auth/password-reset/",
  "/api/auth/password-reset/confirm/",
];

api.interceptors.request.use((config) => {
  const url = config.url || "";
  const skipAuth = NO_AUTH_PREFIXES.some((p) => url.startsWith(p));
  if (skipAuth) return config;

  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

function clearAuth() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isTokenError =
      error.response?.status === 401 &&
      !NO_AUTH_PREFIXES.some((p) => originalRequest.url?.startsWith(p));

    if (!isTokenError || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/api/auth/refresh/", {
        refresh: refreshToken,
      });
      localStorage.setItem("access", data.access);
      processQueue(null, data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
