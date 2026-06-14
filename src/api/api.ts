// Axios instance for user API calls. Attaches JWT and tenant context to every request.
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/users",
  withCredentials: true,
});

// Attach auth token and active tenant ID from localStorage to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const activeTenantId = localStorage.getItem("activeTenantId");
  if (activeTenantId && activeTenantId !== "__system__") {
    config.headers["x-tenant-id"] = activeTenantId;
  }
  return config;
});

export default api;
