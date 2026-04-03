// src/components/Footer.jsx — Updated social links: Instagram, Telegram, WhatsApp
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

const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
              <a
                href="https://www.instagram.com/maktabat_rahma"
                target="_blank" rel="noreferrer"
                className="footer__social-btn footer__social-btn--instagram"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://t.me/maktabat_rahma"
                target="_blank" rel="noreferrer"
                className="footer__social-btn footer__social-btn--telegram"
                aria-label="Telegram"
              >
                <TelegramIcon />
              </a>
              <a
                href="https://wa.me/message/AUV2I33UDGMRM1"
                target="_blank" rel="noreferrer"
                className="footer__social-btn footer__social-btn--whatsapp"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
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
