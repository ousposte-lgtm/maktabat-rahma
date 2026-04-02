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

export default function BookCard({ book, delay = 0 }) {
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
          <span className="book-card__view-btn">View Details →</span>
        </div>
      </Link>

      <div className="book-card__body">
        <Link to={`/book/${book.id}`} className="book-card__title">{book.title}</Link>
        {book.author && <p className="book-card__author">{book.author}</p>}
        <div className="book-card__footer">
          <span className="book-card__price">
            {book.price ? `${Number(book.price).toFixed(2)} MAD` : 'Gratuit'}
          </span>
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
