// src/components/BookCard.jsx — Unified with FeaturedCard style, View Details only
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './BookCard.css';

const CAT_COLORS = {
  'Fiction': '#6b3fa0', 'Non-Fiction': '#0f766e', 'Islamic': '#15803d',
  'Children': '#b45309', 'History': '#9f1239', 'Science': '#0369a1',
  'Philosophy': '#7c3aed', 'Poetry': '#be185d',
};

export default function BookCard({ book, delay = 0 }) {
  const { lang } = useTheme();
  const tx = t[lang];
  const catColor = CAT_COLORS[book.category] || '#6b3fa0';
  const priceNum = book.price ? Number(book.price).toFixed(2) : null;

  return (
    <div className="book-card fade-up" style={{ animationDelay: `${delay}ms` }}>
      <Link to={`/book/${book.id}`} className="book-card__img-wrap">
        <img
          src={book.image_url || `https://placehold.co/300x420/1e1e35/b48de8?text=${encodeURIComponent(book.title?.slice(0,10) || '📖')}`}
          alt={book.title}
          className="book-card__img"
          loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/300x420/1e1e35/b48de8?text=📖`; }}
        />
        <div className="book-card__overlay-cat" style={{ color: catColor }}>
          <span className="book-card__cat-dot" style={{ background: catColor }} />
          {book.category}
        </div>
        <div className="book-card__hover-overlay">
          <span className="book-card__view-btn">{tx.view_details} →</span>
        </div>
        <div className="book-card__gradient" />
      </Link>

      <div className="book-card__body">
        <Link to={`/book/${book.id}`} className="book-card__title">{book.title}</Link>
        {book.author && <p className="book-card__author">{book.author}</p>}

        <div className="book-card__price-block">
          {priceNum ? (
            <>
              <span className="book-card__price-currency">MAD</span>
              <span className="book-card__price-amount">{priceNum}</span>
              <span className="book-card__price-piece">/ {tx.piece}</span>
            </>
          ) : (
            <span className="book-card__price-free">{tx.gratuit}</span>
          )}
        </div>

        <Link to={`/book/${book.id}`} className="book-card__view-details-btn">
          {tx.view_details}
        </Link>
      </div>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="book-card book-card--skel">
      <div className="book-card__img-wrap skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="book-card__body">
        <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 18, width: '50%', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
      </div>
    </div>
  );
}
