// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import FeaturedCard from '../components/FeaturedCard';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import { useBooks } from '../hooks/useBooks';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './Home.css';

const MARQUEE_ITEMS = [
  'Arabic Classics', 'Islamic Knowledge', 'World Literature',
  'Philosophy', 'Poetry', 'History', 'Science', 'Contemporary Thought',
  'Arabic Classics', 'Islamic Knowledge', 'World Literature',
  'Philosophy', 'Poetry', 'History', 'Science', 'Contemporary Thought',
];

export default function Home() {
  const { books, loading } = useBooks();
  const { lang } = useTheme();
  const tx = t[lang];

  // Featured: only is_featured=true books; fallback to first 4 if none
  const featuredBooks = books.filter(b => b.is_featured);
  const featured = featuredBooks.length > 0 ? featuredBooks.slice(0, 8) : [];
  const showFeaturedFallback = !loading && featuredBooks.length === 0;

  // Regular books for the lower grid (skip featured ones, show rest)
  const regularBooks = books.filter(b => !b.is_featured).slice(0, 8);

  return (
    <div className="page home">

      {/* ── 1. Hero ── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__grid" />
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">
              <span className="hero__eyebrow-line" />
              {tx.welcome}
            </span>
            <h1 className="hero__title">
              <span className="hero__title-ar">مكتبة رحمة</span>
              <em className="hero__title-em">{tx.tagline}</em>
            </h1>
            <p className="hero__desc">{tx.desc}</p>
            <div className="hero__ctas">
              <Link to="/shop" className="btn btn-primary hero__cta-main">
                {tx.browse}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/about" className="btn btn-outline">{tx.about_lib}</Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__book-stack">
              <div className="hero__book hero__book--behind-l" />
              <div className="hero__book hero__book--behind-r" />
              <div className="hero__book hero__book--main">
                <span className="hero__book-title">اقرأ</span>
                <div className="hero__book-line" />
                <span className="hero__book-sub">Maktabat Rahma</span>
              </div>
              <div className="hero__glow" />
            </div>
            <div className="hero__float-badge">
              <div className="hero__float-badge-icon">📚</div>
              <div className="hero__float-badge-text">
                <span className="hero__float-badge-label">{tx.new_arrivals}</span>
                <span className="hero__float-badge-value">{tx.updated_daily}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="home-marquee">
        <div className="home-marquee__track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="home-marquee__item">
              <span className="home-marquee__dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 2. Featured Books ── */}
      {(loading || featured.length > 0 || showFeaturedFallback) && (
        <section className="home-featured">
          <div className="container">
            <div className="home-featured__header">
              <div className="home-featured__title-block">
                <span className="section-eyebrow">{tx.our_collection}</span>
                <h2 className="section-title">
                  {tx.featured_books}{' '}
                  <em className="section-title-em">{tx.featured_em}</em>
                </h2>
                <p className="home-featured__subtitle">Discover our hand-picked top reads</p>
              </div>
              <Link to="/shop" className="btn btn-outline home-featured__view-all">{tx.view_all}</Link>
            </div>

            {/* Premium featured grid — uses FeaturedCard */}
            {loading ? (
              <div className="home-featured-grid">
                {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
              </div>
            ) : featured.length > 0 ? (
              <div className="home-featured-grid">
                {featured.map((book, i) => (
                  <FeaturedCard key={book.id} book={book} delay={i * 60} />
                ))}
              </div>
            ) : (
              /* Fallback: no featured products — show normal grid */
              <div className="home-grid">
                {books.slice(0, 8).map((book, i) => (
                  <BookCard key={book.id} book={book} delay={i * 55} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. About snippet ── */}
      <section className="home-about-strip">
        <div className="container home-about-strip__inner">
          <div className="home-about-strip__quote">
            <span className="home-about-strip__ar">اقرأ بسم ربك</span>
            <span className="home-about-strip__verse">Read in the name of your Lord</span>
            <span className="home-about-strip__ref">— Quran 96:1</span>
          </div>
          <div className="home-about-strip__text">
            <p className="section-eyebrow">Our Story</p>
            <h2 className="home-about-strip__title">A library built on <em>knowledge & mercy</em></h2>
            <p className="home-about-strip__desc">
              Maktabat Rahma was founded with a simple but profound vision: to make quality books accessible to every reader. We curate Arabic classics, Islamic scholarship, world literature, and contemporary thought — all in one place.
            </p>
            <Link to="/about" className="btn btn-outline">Learn More →</Link>
          </div>
        </div>
      </section>

      {/* ── 4. All Books (non-featured) ── */}
      {regularBooks.length > 0 && (
        <section className="home-featured" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="home-featured__header">
              <div className="home-featured__title-block">
                <span className="section-eyebrow">The Collection</span>
                <h2 className="section-title">All <em className="section-title-em">Books</em></h2>
              </div>
              <Link to="/shop" className="btn btn-outline home-featured__view-all">{tx.view_all}</Link>
            </div>
            <div className="home-grid">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
                : regularBooks.map((book, i) => <BookCard key={book.id} book={book} delay={i * 55} />)
              }
            </div>
          </div>
        </section>
      )}

      {!loading && books.length === 0 && (
        <div className="container" style={{ paddingBottom: 80 }}>
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3>{tx.no_books}</h3>
            <p>{tx.no_books_sub}</p>
          </div>
        </div>
      )}
    </div>
  );
}
