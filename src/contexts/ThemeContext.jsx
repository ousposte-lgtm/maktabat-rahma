// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Default language is Arabic on first visit; persisted afterwards
const getInitialLang = () => {
  const stored = localStorage.getItem('mr-lang');
  if (stored) return stored;          // respect saved choice
  return 'ar';                         // first-visit default = AR
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('mr-theme') || 'dark');
  const [lang,  setLangState] = useState(getInitialLang);

  // Persist + apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mr-theme', theme);
  }, [theme]);

  // Persist + apply language / direction
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('mr-lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Wrap setLang so callers don't need to touch localStorage directly
  const setLang = (l) => setLangState(l);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
