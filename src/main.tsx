import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { jwtDecode } from "jwt-decode";

// Apply saved theme before render to avoid flash
const token = localStorage.getItem("token");
let isDark = false;
if (token) {
  try {
    const decoded = jwtDecode<{ id?: string }>(token);
    const userId = decoded?.id;
    if (userId) {
      isDark = localStorage.getItem(`theme_${userId}`) === "dark";
    }
  } catch {
    // ignore
  }
}

if (isDark) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)