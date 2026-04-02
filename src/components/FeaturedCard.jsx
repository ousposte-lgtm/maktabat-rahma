// src/components/FeaturedCard.jsx — Premium card for featured books only
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import './FeaturedCard.css';

const CAT_COLORS = {
  'Fiction': '#6b3fa0', 'Non-Fiction': '#0f766e', 'Islamic': '#15803d',
  'Children': '#b45309', 'History': '#9f1239', 'Science': '#0369a1',
  'Philosophy': '#7c3aed', 'Poetry': '#be185d',
};

export default function FeaturedCard({ book, delay = 0 }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some(i => i.id === book.id);
  const catColor = CAT_COLORS[book.category] || '#7c4dbd';

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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
        {/* Hover overlay — "View Details" */}
        <div className="feat-card__overlay">
          <span className="feat-card__view">View Details →</span>
        </div>
        {/* Bottom gradient */}
        <div className="feat-card__gradient" />
      </Link>

      {/* Info */}
      <div className="feat-card__body">
        <Link to={`/book/${book.id}`} className="feat-card__title">{book.title}</Link>

        <div className="feat-card__footer">
          {/* Price — MAD small, number large */}
          <div className="feat-card__price-block">
            {priceNum ? (
              <>
                <span className="feat-card__currency">MAD</span>
                <span className="feat-card__amount">{priceNum}</span>
              </>
            ) : (
              <span className="feat-card__free">Gratuit</span>
            )}
          </div>

          <button
            className={`feat-card__add ${added ? 'feat-card__add--done' : ''} ${inCart && !added ? 'feat-card__add--in' : ''}`}
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
