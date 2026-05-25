import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/users",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Send active tenant context for multi-tenant support.
  // Only send x-tenant-id when a real tenant is selected (not system context).
  const activeTenantId = localStorage.getItem("activeTenantId");
  if (activeTenantId && activeTenantId !== "__system__") {
    config.headers["x-tenant-id"] = activeTenantId;
  }
  return config;
});

export default api;
