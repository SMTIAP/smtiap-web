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
      const saved = localStorage.getItem(`theme_${userId}`);
      if (saved !== null) {
        isDark = saved === "dark";
      } else {
        isDark = localStorage.getItem("theme_guest") === "dark";
      }
    } else {
      isDark = localStorage.getItem("theme_guest") === "dark";
    }
  } catch {
    isDark = localStorage.getItem("theme_guest") === "dark";
  }
} else {
  isDark = localStorage.getItem("theme_guest") === "dark";
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