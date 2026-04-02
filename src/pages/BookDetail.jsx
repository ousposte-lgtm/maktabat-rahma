// src/pages/BookDetail.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';   // ← global cache, no extra fetch
import { useCart }  from '../contexts/CartContext';
import './BookDetail.css';

/* ── Icon components (inline SVG, zero deps) ── */
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

/* ── CAT_COLORS kept from original ── */
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

export default function BookDetail() {
  const { id }    = useParams();
  const { addToCart, items }    = useCart();
  const { getBookById, loading: booksLoading } = useBooks();  // ← cache
  const [added, setAdded] = useState(false);

  // Instant lookup — no network call, no extra useEffect
  const book   = getBookById(id);
  const loading = booksLoading;   // only true on very first app load
  const inCart  = items.some(i => i.id === id);

  const handleAdd = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  /* ── loading state ── */
  if (loading) return (
    <div className="page bd-loading">
      <div className="bd-spinner-wrap">
        <div className="spinner" />
        <p className="bd-spinner-text">Loading book…</p>
      </div>
    </div>
  );

  /* ── not found ── */
  if (!book) return (
    <div className="page bd-loading">
      <div className="empty-state">
        <div className="empty-state__icon">📭</div>
        <h3>Book not found</h3>
        <p>This book may have been removed.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>
          <ArrowLeftIcon /> Back to Shop
        </Link>
      </div>
    </div>
  );

  const catColor  = CAT_COLORS[book.category] || '#6b3fa0';
  const priceText = book.price ? `${Number(book.price).toFixed(2)} MAD` : 'Free';

  return (
    <div className="page book-detail">
      <div className="container bd-wrap">

        {/* ── Breadcrumb / back ── */}
        <nav className="bd-breadcrumb" aria-label="breadcrumb">
          <Link to="/shop" className="bd-breadcrumb__link">
            <ArrowLeftIcon />
            Shop
          </Link>
          <span className="bd-breadcrumb__sep">/</span>
          {book.category && (
            <>
              <Link to={`/shop?cat=${book.category}`} className="bd-breadcrumb__link">
                {book.category}
              </Link>
              <span className="bd-breadcrumb__sep">/</span>
            </>
          )}
          <span className="bd-breadcrumb__current">{book.title}</span>
        </nav>

        {/* ── Two-column product layout ── */}
        <div className="bd-layout">

          {/* LEFT — Image */}
          <div className="bd-image-col">
            <div className="bd-image-frame">
              {/* Category ribbon */}
              {book.category && (
                <div className="bd-image-badge" style={{ background: catColor }}>
                  {book.category}
                </div>
              )}
              <img
                src={book.image_url || `https://placehold.co/480x640/1a1a2e/b48de8?text=📖`}
                alt={book.title}
                className="bd-image"
                onError={e => { e.target.src = 'https://placehold.co/480x640/1a1a2e/b48de8?text=📖'; }}
              />
              {/* Ambient glow under the cover */}
              <div className="bd-image-glow" style={{ background: catColor }} />
            </div>

            {/* Trust badges */}
            <div className="bd-trust-row">
              <div className="bd-trust-item">
                <TruckIcon />
                <span>Fast Delivery</span>
              </div>
              <div className="bd-trust-item">
                <ShieldIcon />
                <span>Secure Order</span>
              </div>
              <div className="bd-trust-item">
                <RefreshIcon />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="bd-info fade-up">

            {/* Category pill */}
            {book.category && (
              <Link
                to={`/shop?cat=${book.category}`}
                className="bd-category-pill"
                style={{ '--cat-color': catColor }}
              >
                {book.category}
              </Link>
            )}

            {/* Title */}
            <h1 className="bd-title">{book.title}</h1>

            {/* Author */}
            {book.author && (
              <p className="bd-author">
                <span className="bd-author__by">by</span>
                <span className="bd-author__name">{book.author}</span>
              </p>
            )}

            {/* Star rating (decorative) */}
            <div className="bd-rating">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`bd-star ${n <= 4 ? 'bd-star--filled' : 'bd-star--empty'}`}>
                  <StarIcon />
                </span>
              ))}
              <span className="bd-rating__count">(4.0)</span>
            </div>

            {/* Divider */}
            <div className="bd-divider" />

            {/* Price block */}
            <div className="bd-price-block">
              <span className="bd-price">{priceText}</span>
              <span className="bd-stock-badge">
                <span className="bd-stock-dot" />
                In Stock
              </span>
            </div>

            {/* Description */}
            {book.description && (
              <div className="bd-desc">
                <p>{book.description}</p>
              </div>
            )}

            {/* Divider */}
            <div className="bd-divider" />

            {/* Action buttons */}
            <div className="bd-actions">
              {/* Primary — Add to Cart */}
              <button
                className={`bd-add-btn ${added ? 'bd-add-btn--success' : ''} ${inCart && !added ? 'bd-add-btn--incart' : ''}`}
                onClick={handleAdd}
                disabled={added}
                aria-label="Add to cart"
              >
                <span className="bd-add-btn__icon">
                  {added ? <CheckIcon /> : <CartIcon />}
                </span>
                <span className="bd-add-btn__text">
                  {added
                    ? 'Added to Cart!'
                    : inCart
                    ? 'In Cart — Add Again'
                    : 'Add to Cart'}
                </span>
              </button>

              {/* Secondary — View Cart */}
              <Link to="/cart" className="bd-cart-link">
                View Cart
                <ArrowRightIcon />
              </Link>
            </div>

            {/* Success toast */}
            {added && (
              <div className="bd-toast scale-in" role="alert">
                <CheckIcon />
                <span>Added to your cart!</span>
                <Link to="/cart" className="bd-toast__link">Go to Cart →</Link>
              </div>
            )}

            {/* Meta info */}
            <div className="bd-meta">
              {book.category && (
                <div className="bd-meta__row">
                  <span className="bd-meta__label">Category</span>
                  <span className="bd-meta__value">{book.category}</span>
                </div>
              )}
              {book.author && (
                <div className="bd-meta__row">
                  <span className="bd-meta__label">Author</span>
                  <span className="bd-meta__value">{book.author}</span>
                </div>
              )}
              <div className="bd-meta__row">
                <span className="bd-meta__label">Language</span>
                <span className="bd-meta__value">Arabic / French</span>
              </div>
              <div className="bd-meta__row">
                <span className="bd-meta__label">Delivery</span>
                <span className="bd-meta__value">Via WhatsApp confirmation</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
