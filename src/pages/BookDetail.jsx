// src/pages/BookDetail.jsx — Premium product page (inspired by screenshot UI)
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useCart }  from '../contexts/CartContext';
import './BookDetail.css';

/* ── Icons ── */
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

const CAT_COLORS = {
  'Fiction': '#6b3fa0', 'Non-Fiction': '#0f766e', 'Islamic': '#15803d',
  'Children': '#b45309', 'History': '#9f1239', 'Science': '#0369a1',
  'Philosophy': '#7c3aed', 'Poetry': '#be185d',
};

export default function BookDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { getBookById, loading: booksLoading } = useBooks();
  const [added, setAdded]       = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // Scroll to top on load
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  const book    = getBookById(id);
  const loading = booksLoading;
  const inCart  = items.some(i => i.id === id);

  const handleAdd = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) return (
    <div className="page bd-loading">
      <div className="bd-spinner-wrap">
        <div className="spinner" />
        <p className="bd-spinner-text">Loading…</p>
      </div>
    </div>
  );

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

  const catColor = CAT_COLORS[book.category] || '#7c4dbd';

  // Multiple images support
  const images = (() => {
    if (book.images?.length) return book.images.filter(Boolean);
    if (book.image_url) return [book.image_url];
    return ['https://placehold.co/480x640/1a1a2e/b48de8?text=📖'];
  })();
  const currentImg = images[activeImg] || images[0];
  const priceNum = book.price ? Number(book.price).toFixed(2) : null;

  return (
    <div className="page book-detail">
      <div className="container bd-wrap">

        {/* Breadcrumb */}
        <nav className="bd-breadcrumb" aria-label="breadcrumb">
          <Link to="/shop" className="bd-breadcrumb__link"><ArrowLeftIcon /> Shop</Link>
          <span className="bd-breadcrumb__sep">/</span>
          {book.category && <>
            <Link to={`/shop?cat=${book.category}`} className="bd-breadcrumb__link">{book.category}</Link>
            <span className="bd-breadcrumb__sep">/</span>
          </>}
          <span className="bd-breadcrumb__current">{book.title}</span>
        </nav>

        {/* ══ PREMIUM CARD LAYOUT (inspired by screenshot) ══ */}
        <div className="bd-premium-card">

          {/* LEFT — Image */}
          <div className="bd-image-col">
            <div className="bd-image-frame">
              {book.category && (
                <div className="bd-image-badge" style={{ background: catColor }}>{book.category}</div>
              )}
              <img
                src={currentImg}
                alt={book.title}
                className="bd-image"
                onError={e => { e.target.src = 'https://placehold.co/480x640/1a1a2e/b48de8?text=📖'; }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="bd-thumbnails">
                {images.map((img, i) => (
                  <button key={i}
                    className={`bd-thumb-btn ${i === activeImg ? 'bd-thumb-btn--active' : ''}`}
                    onClick={() => setActiveImg(i)}>
                    <img src={img} alt={`${book.title} ${i+1}`}
                      onError={e => { e.target.src = 'https://placehold.co/80x110/1a1a2e/b48de8?text=📖'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div className="bd-info">

            {/* Tag line — like "HOODIE" in screenshot */}
            {book.category && (
              <div className="bd-tag">
                <span className="bd-tag__line" style={{ background: catColor }} />
                <span className="bd-tag__dot" style={{ background: catColor }} />
                {book.category}
              </div>
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

            {/* Rating */}
            <div className="bd-rating">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`bd-star ${n <= 4 ? 'bd-star--filled' : 'bd-star--empty'}`}>
                  <StarIcon />
                </span>
              ))}
              <span className="bd-rating__count">(4.0)</span>
            </div>

            {/* Price — like "MAD 300.00" in screenshot */}
            <div className="bd-price-wrap">
              {priceNum ? (
                <div className="bd-price-row">
                  <span className="bd-price-currency">MAD</span>
                  <span className="bd-price-amount">{priceNum}</span>
                </div>
              ) : (
                <span className="bd-price-free">Gratuit</span>
              )}
              <span className="bd-stock-badge">
                <span className="bd-stock-dot" />
                In Stock
              </span>
            </div>

            {/* Description — like screenshot monospace style */}
            {book.description && (
              <p className="bd-desc">{book.description}</p>
            )}

            <div className="bd-divider" />

            {/* Trust row */}
            <div className="bd-trust-row">
              <div className="bd-trust-item"><TruckIcon /><span>Fast Delivery</span></div>
              <div className="bd-trust-item"><ShieldIcon /><span>Secure Order</span></div>
              <div className="bd-trust-item"><RefreshIcon /><span>Easy Returns</span></div>
            </div>

            <div className="bd-divider" />

            {/* Action buttons */}
            <div className="bd-actions">
              <button
                className={`bd-add-btn ${added ? 'bd-add-btn--success' : ''} ${inCart && !added ? 'bd-add-btn--incart' : ''}`}
                onClick={handleAdd}
                disabled={added}
              >
                <span className="bd-add-btn__icon">
                  {added ? <CheckIcon /> : <CartIcon />}
                </span>
                <span className="bd-add-btn__text">
                  {added ? 'Added to Cart!' : inCart ? 'In Cart — Add Again' : 'Add to Cart'}
                </span>
              </button>

              <Link to="/cart" className="bd-cart-link">
                View Cart <ArrowRightIcon />
              </Link>

              <button className="bd-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeftIcon /> Back to Shop
              </button>
            </div>

            {/* Toast */}
            {added && (
              <div className="bd-toast scale-in" role="alert">
                <CheckIcon />
                <span>Added to your cart!</span>
                <Link to="/cart" className="bd-toast__link">Go to Cart →</Link>
              </div>
            )}

            {/* Meta */}
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
