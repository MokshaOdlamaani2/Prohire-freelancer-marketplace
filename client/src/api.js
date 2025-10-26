import axios from "axios";

const fallback = "https://prohire-backend.onrender.com"; // your deployed backend or local dev backend URL

const baseURL =
  (
    import.meta.env.VITE_API_URL?.trim() ||
    (import.meta.env.PROD ? fallback : "http://localhost:5000")
  ) + "/api"; // <-- append "/api" here

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
