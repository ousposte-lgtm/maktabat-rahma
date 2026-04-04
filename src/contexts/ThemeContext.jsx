// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('mr-theme') || 'dark');
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('mr-lang');
    if (!saved) return 'ar'; // default Arabic on first visit
    return saved;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mr-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    // Fix #1: Arabic ONLY changes text language, NOT layout direction.
    // We always keep dir="ltr" so layout stays identical across all languages.
    document.documentElement.setAttribute('dir', 'ltr');
    // Apply Arabic font class instead of RTL direction
    if (lang === 'ar') {
      document.documentElement.classList.add('lang-ar');
    } else {
      document.documentElement.classList.remove('lang-ar');
    }
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
