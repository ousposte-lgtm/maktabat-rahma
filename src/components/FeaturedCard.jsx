// src/components/FeaturedCard.jsx — Premium card: View Details only, no add-to-cart
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './FeaturedCard.css';

const CAT_COLORS = {
  'Fiction': '#6b3fa0', 'Non-Fiction': '#0f766e', 'Islamic': '#15803d',
  'Children': '#b45309', 'History': '#9f1239', 'Science': '#0369a1',
  'Philosophy': '#7c3aed', 'Poetry': '#be185d',
};

export default function FeaturedCard({ book, delay = 0 }) {
  const { lang } = useTheme();
  const tx = t[lang];
  const catColor = CAT_COLORS[book.category] || '#7c4dbd';
  const priceNum = book.price ? Number(book.price).toFixed(2) : null;

  return (
    <div className="feat-card fade-up" style={{ animationDelay: `${delay}ms` }}>
      {/* Image with hover overlay */}
      <Link to={`/book/${book.id}`} className="feat-card__img-wrap">
        <img
          src={book.image_url || `https://placehold.co/300x420/1a1a2e/b48de8?text=📖`}
          alt={book.title}
          className="feat-card__img"
          loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/300x420/1a1a2e/b48de8?text=📖`; }}
        />
        {/* Category tag */}
        <div className="feat-card__cat" style={{ color: catColor }}>
          <span className="feat-card__cat-dot" style={{ background: catColor }} />
          {book.category}
        </div>
        {/* Hover overlay — "View Details" only */}
        <div className="feat-card__overlay">
          <span className="feat-card__view">{tx.view_details} →</span>
        </div>
        <div className="feat-card__gradient" />
      </Link>

      {/* Info — title then price */}
      <div className="feat-card__body">
        <Link to={`/book/${book.id}`} className="feat-card__title">{book.title}</Link>

        {/* Price: "MAD 300.00 / piece" */}
        <div className="feat-card__price-block">
          {priceNum ? (
            <>
              <span className="feat-card__currency">MAD</span>
              <span className="feat-card__amount">{priceNum}</span>
              <span className="feat-card__piece">/ {tx.piece}</span>
            </>
          ) : (
            <span className="feat-card__free">{tx.gratuit}</span>
          )}
        </div>

        {/* View Details button — replaces add-to-cart */}
        <Link to={`/book/${book.id}`} className="feat-card__view-btn">
          {tx.view_details}
        </Link>
      </div>
    </div>
  );
}
