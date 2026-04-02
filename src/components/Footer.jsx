// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './Footer.css';

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.24 8.24 0 004.82 1.54V6.84a4.85 4.85 0 01-1.05-.15z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);

export default function Footer() {
  const { lang } = useTheme();
  const tx = t[lang];

  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__brand-link">
            <span className="footer__brand-ar">مكتبة رحمة</span>
            <span className="footer__brand-en">Maktabat Rahma</span>
          </Link>
          <p className="footer__tagline">{tx.tagline_footer}</p>

          <div className="footer__social">
            <span className="footer__social-label">{tx.follow}</span>
            <div className="footer__social-icons">
              <a
                href="https://www.tiktok.com/@maktabat_rahma?is_from_webapp=1&sender_device=pc"
                target="_blank" rel="noreferrer"
                className="footer__social-btn footer__social-btn--tiktok"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a href="#" className="footer__social-btn" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="footer__social-btn" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="footer__links">
          <div className="footer__col">
            <h4>{tx.navigate}</h4>
            <Link to="/">{tx.home}</Link>
            <Link to="/shop">{tx.shop}</Link>
            <Link to="/cart">{tx.cart}</Link>
            <Link to="/about">{tx.about}</Link>
          </div>
          <div className="footer__col">
            <h4>{tx.categories}</h4>
            <Link to="/shop?cat=Islamic">Islamic</Link>
            <Link to="/shop?cat=Fiction">Fiction</Link>
            <Link to="/shop?cat=History">History</Link>
            <Link to="/shop?cat=Poetry">Poetry</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>{tx.rights_pre} {new Date().getFullYear()} {tx.rights_post}</p>
          <div className="footer__ornament">❧</div>
        </div>
      </div>
    </footer>
  );
}
