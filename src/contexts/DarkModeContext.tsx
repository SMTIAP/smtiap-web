import { createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: (_value: boolean) => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export function getSavedTheme(): boolean {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode<{ id?: string }>(token);
      const userId = decoded?.id;
      if (userId) {
        const saved = localStorage.getItem(`theme_${userId}`);
        if (saved !== null) {
          return saved === "dark";
        }
      }
    } catch {
      // ignore
    }
  }
  return localStorage.getItem("theme_guest") === "dark";
}
