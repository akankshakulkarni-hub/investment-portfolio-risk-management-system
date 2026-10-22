import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // localStorage unavailable — continue silently
    }
  }, [dark]);

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.patch('/auth/theme', { theme_preference: next ? 'dark' : 'light' });
      }
    } catch {
      // network error — preference already saved to localStorage above
    }
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);