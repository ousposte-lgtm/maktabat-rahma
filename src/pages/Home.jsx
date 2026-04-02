// src/pages/Home.jsx
import { Link } from 'react-router-dom';
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
  const featured = books.slice(0, 8);

  return (
    <div className="page home">

      {/* ── Hero ── */}
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
              <Link to="/about" className="btn btn-outline">
                {tx.about_lib}
              </Link>
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

      {/* ── Featured Books ── */}
      <section className="home-featured">
        <div className="container">
          <div className="home-featured__header">
            <div>
              <span className="section-eyebrow">{tx.our_collection}</span>
              <h2 className="section-title">{tx.featured_books} <em>{tx.featured_em}</em></h2>
            </div>
            <Link to="/shop" className="btn btn-outline">{tx.view_all}</Link>
          </div>

          <div className="home-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
              : featured.map((book, i) => (
                  <BookCard key={book.id} book={book} delay={i * 55} />
                ))
            }
          </div>

          {!loading && books.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3>{tx.no_books}</h3>
              <p>{tx.no_books_sub}</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
