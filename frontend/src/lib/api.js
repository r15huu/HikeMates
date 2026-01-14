import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// endpoints that must NOT include Authorization header
const NO_AUTH_PREFIXES = [
  "/api/auth/register/",
  "/api/auth/token/",
  "/api/auth/refresh/",
  "/api/auth/password-reset/",
  "/api/auth/password-reset/confirm/",
];

api.interceptors.request.use((config) => {
  const url = config.url || "";

  // If request is for auth endpoints, do not attach token
  const skipAuth = NO_AUTH_PREFIXES.some((p) => url.startsWith(p));
  if (skipAuth) return config;

  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Optional: global handler for invalid token errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error?.response?.data;
    const tokenInvalid =
      data?.code === "token_not_valid" ||
      (typeof data?.detail === "string" && data.detail.toLowerCase().includes("token")) ||
      JSON.stringify(data || {}).toLowerCase().includes("token_not_valid");

    if (tokenInvalid) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    return Promise.reject(error);
  }
);