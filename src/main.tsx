import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem("theme");
const hasToken = !!localStorage.getItem("token");
if (savedTheme === "dark" && hasToken) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)