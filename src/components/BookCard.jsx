// src/components/BookCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './BookCard.css';

const CAT_COLORS = {
  'Fiction':     '#6b3fa0',
  'Non-Fiction': '#0f766e',
  'Islamic':     '#15803d',
  'Children':    '#b45309',
  'History':     '#9f1239',
  'Science':     '#0369a1',
  'Philosophy':  '#7c3aed',
  'Poetry':      '#be185d',
};

// Fix #9: Accept `featured` prop to apply larger card styling
export default function BookCard({ book, delay = 0, featured = false }) {
  const { addToCart, items } = useCart();
  const [added, setAdded]   = useState(false);
  const inCart = items.some(i => i.id === book.id);
  const catColor = CAT_COLORS[book.category] || '#6b3fa0';

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`book-card fade-up ${featured ? 'book-card--featured' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <Link to={`/book/${book.id}`} className="book-card__img-wrap">
        <img
          src={book.image_url || `https://placehold.co/300x420/1e1e35/b48de8?text=${encodeURIComponent(book.title?.slice(0,10) || '📖')}`}
          alt={book.title}
          className="book-card__img"
          loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/300x420/1e1e35/b48de8?text=📖`; }}
        />
        {/* Fix #9: Category badge */}
        <div className="book-card__overlay-cat" style={{ background: catColor }}>
          {book.category}
        </div>
        {/* Fix #9: Hover overlay with "View Details" */}
        <div className="book-card__hover-overlay">
          <span className="book-card__view-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View Details
          </span>
        </div>
        {/* Fix #9: Image zoom effect via CSS */}
      </Link>

      <div className="book-card__body">
        <Link to={`/book/${book.id}`} className="book-card__title">{book.title}</Link>
        {book.author && <p className="book-card__author">{book.author}</p>}
        <div className="book-card__footer">
          {/* Fix #2: Refined price inside card */}
          <div className="book-card__price-block">
            {book.price ? (
              <>
                <span className="book-card__price-amount">{Number(book.price).toFixed(2)}</span>
                <span className="book-card__price-currency">MAD</span>
              </>
            ) : (
              <span className="book-card__price-free">Gratuit</span>
            )}
          </div>
          <button
            className={`book-card__add-btn ${added ? 'added' : ''} ${inCart && !added ? 'in-cart' : ''}`}
            onClick={handleAdd}
            title={inCart ? 'Already in cart' : 'Add to cart'}
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
        <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 18, width: '40%' }} />
          <div className="skeleton" style={{ height: 32, width: 32, borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  );
}
