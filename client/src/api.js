// src/api.js
import axios from "axios";

const fallback = "https://prohire-backend.onrender.com"; // <-- your Render backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? fallback : "/");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // enable if you ever switch to cookie auth
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
