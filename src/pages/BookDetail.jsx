// src/pages/BookDetail.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useCart }  from '../contexts/CartContext';
import './BookDetail.css';

/* ── Icons ── */
const CartIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ArrowLeftIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ArrowRightIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ChevronIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const StarIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const TruckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const ShieldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;

const CAT_COLORS = {
  'Fiction':'#6b3fa0','Non-Fiction':'#0f766e','Islamic':'#15803d',
  'Children':'#b45309','History':'#9f1239','Science':'#0369a1',
  'Philosophy':'#7c3aed','Poetry':'#be185d',
};

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { getBookById, loading: booksLoading } = useBooks();
  const [added,    setAdded]    = useState(false);
  // Fix 7: image gallery state
  const [activeImg, setActiveImg] = useState(0);

  const book   = getBookById(id);
  const loading = booksLoading;
  const inCart  = items.some(i => i.id === id);

  const handleAdd = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  // Fix 3: go back to previous page, fallback to /shop
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/shop');
  };

  if (loading) return (
    <div className="page bd-loading">
      <div className="bd-spinner-wrap">
        <div className="spinner" />
        <p className="bd-spinner-text">Loading book…</p>
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

  const catColor  = CAT_COLORS[book.category] || '#6b3fa0';
  const priceText = book.price ? `${Number(book.price).toFixed(2)} MAD` : 'Gratuit';

  // Fix 7: build image list — support both single image_url and images array
  const imageList = (() => {
    if (Array.isArray(book.images) && book.images.length > 0) return book.images;
    if (book.image_url) return [book.image_url];
    return [`https://placehold.co/480x640/1a1a2e/b48de8?text=📖`];
  })();

  const mainImg = imageList[activeImg] || imageList[0];

  return (
    <div className="page book-detail">
      <div className="container bd-wrap">

        {/* Breadcrumb */}
        <nav className="bd-breadcrumb" aria-label="breadcrumb">
          <button className="bd-breadcrumb__link bd-breadcrumb__back" onClick={handleBack}>
            <ArrowLeftIcon /> Back
          </button>
          <span className="bd-breadcrumb__sep">/</span>
          <Link to="/shop" className="bd-breadcrumb__link">Shop</Link>
          {book.category && (
            <>
              <span className="bd-breadcrumb__sep">/</span>
              <Link to={`/shop?cat=${book.category}`} className="bd-breadcrumb__link">
                {book.category}
              </Link>
            </>
          )}
          <span className="bd-breadcrumb__sep">/</span>
          <span className="bd-breadcrumb__current">{book.title}</span>
        </nav>

        {/* Two-column layout */}
        <div className="bd-layout">

          {/* LEFT — Image gallery */}
          <div className="bd-image-col">
            {/* Main image */}
            <div className="bd-image-frame">
              {book.category && (
                <div className="bd-image-badge" style={{ background: catColor }}>
                  {book.category}
                </div>
              )}
              <img
                key={mainImg}
                src={mainImg}
                alt={book.title}
                className="bd-image"
                onError={e => { e.target.src = 'https://placehold.co/480x640/1a1a2e/b48de8?text=📖'; }}
              />
              <div className="bd-image-glow" style={{ background: catColor }} />

              {/* Prev/Next arrows if multiple images */}
              {imageList.length > 1 && (
                <>
                  <button
                    className="bd-gallery-arrow bd-gallery-arrow--prev"
                    onClick={() => setActiveImg(i => (i - 1 + imageList.length) % imageList.length)}
                    aria-label="Previous image"
                  >
                    <ChevronIcon />
                  </button>
                  <button
                    className="bd-gallery-arrow bd-gallery-arrow--next"
                    onClick={() => setActiveImg(i => (i + 1) % imageList.length)}
                    aria-label="Next image"
                    style={{ transform: 'rotate(180deg)' }}
                  >
                    <ChevronIcon />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails — Fix 7 */}
            {imageList.length > 1 && (
              <div className="bd-thumbnails">
                {imageList.map((src, idx) => (
                  <button
                    key={idx}
                    className={`bd-thumb ${idx === activeImg ? 'bd-thumb--active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt={`${book.title} ${idx + 1}`}
                      onError={e => { e.target.src = 'https://placehold.co/80x100/1a1a2e/b48de8?text=📖'; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="bd-trust-row">
              <div className="bd-trust-item"><TruckIcon /><span>Fast Delivery</span></div>
              <div className="bd-trust-item"><ShieldIcon /><span>Secure Order</span></div>
              <div className="bd-trust-item"><RefreshIcon /><span>Easy Returns</span></div>
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="bd-info fade-up">

            {/* Category pill */}
            {book.category && (
              <Link to={`/shop?cat=${book.category}`} className="bd-category-pill" style={{ '--cat-color': catColor }}>
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

            {/* Stars */}
            <div className="bd-rating">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`bd-star ${n <= 4 ? 'bd-star--filled' : 'bd-star--empty'}`}>
                  <StarIcon />
                </span>
              ))}
              <span className="bd-rating__count">(4.0)</span>
            </div>

            <div className="bd-divider" />

            {/* Fix 2: Cleaner price section */}
            <div className="bd-price-section">
              <div className="bd-price-row">
                <span className="bd-price">{priceText}</span>
                <span className="bd-stock-pill">
                  <span className="bd-stock-dot" />
                  In Stock
                </span>
              </div>
              {book.price && (
                <p className="bd-price-note">Delivery via WhatsApp confirmation</p>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="bd-desc">
                <p>{book.description}</p>
              </div>
            )}

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
                  {added ? 'Added to Cart!' : inCart ? 'In Cart — Add Again' : 'Add to Cart'}
                </span>
              </button>

              {/* View Cart */}
              <Link to="/cart" className="bd-cart-link">
                View Cart <ArrowRightIcon />
              </Link>

              {/* Fix 3: Back button */}
              <button className="bd-back-btn" onClick={handleBack}>
                <ArrowLeftIcon /> Back
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
