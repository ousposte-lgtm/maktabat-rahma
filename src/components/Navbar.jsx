// src/components/Navbar.jsx
// Desktop: Logo LEFT | Nav CENTER | Controls RIGHT
// Mobile:  Hamburger LEFT | Logo CENTER | Lang+Theme RIGHT
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './Navbar.css';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { itemCount } = useCart();
  const { theme, toggleTheme, lang, setLang } = useTheme();
  const [open, setOpen]         = useState(false);
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

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpen(false);
  };

  useEffect(() => { setOpen(false); setLangOpen(false); }, [location]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Lang Switcher (shared) ── */
  const LangSwitcher = ({ mobile = false }) => (
    <div className="lang-switcher">
      <button
        className={`lang-switcher__btn ${mobile ? 'lang-switcher__btn--mobile' : ''}`}
        onClick={() => setLangOpen(v => !v)}
        aria-label="Switch language"
      >
        <span className="lang-switcher__current">{lang.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4l3 3 3-3"/>
        </svg>
      </button>
      {langOpen && (
        <div className={`lang-switcher__dropdown ${mobile ? 'lang-switcher__dropdown--mobile' : ''}`}>
          {['en', 'ar', 'fr'].map(l => (
            <button key={l}
              className={`lang-switcher__option ${lang === l ? 'active' : ''}`}
              onClick={() => { setLang(l); setLangOpen(false); }}
            >
              {l === 'en' ? '🇬🇧 English' : l === 'ar' ? '🇲🇦 عربي' : '🇫🇷 Français'}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* ══════════════════════════════════════
              DESKTOP: Logo | Nav Links | Controls
              ══════════════════════════════════════ */}
          <Link to="/" className="navbar__logo navbar__logo--desktop" onClick={handleNavClick}>
            <img
              src="/logo-sm.webp"
              alt="Maktabat Rahma Logo"
              className="navbar__logo-img"
              width="36" height="36"
              loading="eager"
            />
            <div className="navbar__logo-text">
              <span className="navbar__logo-ar">مكتبة رحمة</span>
              <span className="navbar__logo-en">Maktabat Rahma</span>
            </div>
          </Link>

          <nav className="navbar__links" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                onClick={handleNavClick}
              >
                {label}
                {to === '/cart' && itemCount > 0 && (
                  <span className="navbar__cart-dot">{itemCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="navbar__controls navbar__controls--desktop">
            <LangSwitcher />
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* ══════════════════════════════════════
              MOBILE: [Hamburger] [Logo] [Lang+Theme]
              ══════════════════════════════════════ */}
          <div className="navbar__mobile-row">

            {/* LEFT: Hamburger only */}
            <button
              className={`navbar__hamburger ${open ? 'open' : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>

            {/* CENTER: Logo + site name */}
            <Link to="/" className="navbar__logo navbar__logo--mobile" onClick={handleNavClick}>
              <img
                src="/logo-sm.webp"
                alt="Maktabat Rahma Logo"
                className="navbar__logo-img"
                width="28" height="28"
                loading="eager"
              />
              <span className="navbar__logo-ar">مكتبة رحمة</span>
            </Link>

            {/* RIGHT: Lang + Theme */}
            <div className="navbar__mobile-controls">
              <LangSwitcher mobile />
              <button className="theme-toggle navbar__mobile-theme" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${open ? 'navbar__drawer--open' : ''}`}>
        <nav className="navbar__drawer-links">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `navbar__drawer-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              {label}
              {to === '/cart' && itemCount > 0 && (
                <span className="navbar__cart-dot">{itemCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {open    && <div className="navbar__overlay" onClick={() => setOpen(false)} />}
      {langOpen && <div className="navbar__overlay" style={{zIndex:897}} onClick={() => setLangOpen(false)} />}
    </>
  );
}
