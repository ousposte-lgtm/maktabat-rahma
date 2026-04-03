// src/components/BookCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './BookCard.css';

const CAT_COLORS = {
  'Fiction': '#6b3fa0', 'Non-Fiction': '#0f766e', 'Islamic': '#15803d',
  'Children': '#b45309', 'History': '#9f1239', 'Science': '#0369a1',
  'Philosophy': '#7c3aed', 'Poetry': '#be185d',
};

export default function BookCard({ book, delay = 0 }) {
  const { addToCart, items } = useCart();
  const { lang } = useTheme();
  const tx = t[lang];
  const [added, setAdded] = useState(false);
  const inCart = items.some(i => i.id === book.id);
  const catColor = CAT_COLORS[book.category] || '#6b3fa0';
  const priceNum = book.price ? Number(book.price).toFixed(2) : null;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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
        <div className="book-card__overlay-cat" style={{ background: catColor }}>
          {book.category}
        </div>
        <div className="book-card__hover-overlay">
          <span className="book-card__view-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {tx.view_details}
          </span>
        </div>
      </Link>

      <div className="book-card__body">
        {/* Fix #4: Title ABOVE price */}
        <Link to={`/book/${book.id}`} className="book-card__title">{book.title}</Link>
        {book.author && <p className="book-card__author">{book.author}</p>}

        {/* Fix #4: Price format "MAD 300.00 / piece" */}
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

        <div className="book-card__footer">
          <button
            className={`book-card__add-btn ${added ? 'added' : ''} ${inCart && !added ? 'in-cart' : ''}`}
            onClick={handleAdd}
            title={inCart ? tx.in_cart_again : tx.add_to_cart}
          >
            {added ? '✓' : inCart ? '✓' : '+'}
          </button>
        </div>
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
        <div className="skeleton" style={{ height: 32, width: 32, borderRadius: '50%', marginLeft: 'auto' }} />
      </div>
    </div>
  );
}
