// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './Navbar.css';

export default function Navbar() {
  const { itemCount } = useCart();
  const { theme, toggleTheme, lang, setLang } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const tx = t[lang];

  const NAV_LINKS = [
    { to: '/',      label: tx.home },
    { to: '/shop',  label: tx.shop },
    { to: '/cart',  label: tx.cart },
    { to: '/about', label: tx.about },
  ];

  useEffect(() => { setOpen(false); setLangOpen(false); }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* Logo — LEFT */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-ar">مكتبة رحمة</span>
            <span className="navbar__logo-en">Maktabat Rahma</span>
          </Link>

          {/* Desktop links — CENTER */}
          <nav className="navbar__links" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              >
                {label}
                {to === '/cart' && itemCount > 0 && (
                  <span className="navbar__cart-dot">{itemCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Controls — RIGHT */}
          <div className="navbar__controls">
            {/* Language switcher */}
            <div className="lang-switcher">
              <button
                className="lang-switcher__btn"
                onClick={() => setLangOpen(v => !v)}
                aria-label="Switch language"
              >
                <span className="lang-switcher__current">{lang.toUpperCase()}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4l3 3 3-3"/>
                </svg>
              </button>
              {langOpen && (
                <div className="lang-switcher__dropdown">
                  {['en', 'ar', 'fr'].map(l => (
                    <button
                      key={l}
                      className={`lang-switcher__option ${lang === l ? 'active' : ''}`}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                    >
                      {l === 'en' ? '🇬🇧 English' : l === 'ar' ? '🇲🇦 عربي' : '🇫🇷 Français'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            {/* Hamburger */}
            <button
              className={`navbar__hamburger ${open ? 'open' : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${open ? 'navbar__drawer--open' : ''}`}>
        <nav className="navbar__drawer-links">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `navbar__drawer-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
              {to === '/cart' && itemCount > 0 && (
                <span className="navbar__cart-dot">{itemCount}</span>
              )}
            </NavLink>
          ))}
          <div className="navbar__drawer-controls">
            <div className="lang-switcher lang-switcher--inline">
              {['en', 'ar', 'fr'].map(l => (
                <button key={l} className={`lang-pill ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
      </div>

      {open && <div className="navbar__overlay" onClick={() => setOpen(false)} />}
      {langOpen && <div className="navbar__overlay" style={{zIndex:897}} onClick={() => setLangOpen(false)} />}
    </>
  );
}
