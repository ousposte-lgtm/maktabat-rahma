// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Fix #4: Default language = Arabic on first visit, then use saved preference
  const [theme, setTheme] = useState(() => localStorage.getItem('mr-theme') || 'dark');
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('mr-lang');
    // First visit (no saved lang) → default to Arabic
    if (!saved) return 'ar';
    return saved;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mr-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('mr-lang', lang);
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('mr-lang', l);
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
