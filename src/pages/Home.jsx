// src/pages/Home.jsx — fully translated
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Scroll to top then navigate
  const goTop = (path) => (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(path);
  };

  const featuredBooks = books.filter(b => b.is_featured);
  const featured = featuredBooks.length > 0 ? featuredBooks.slice(0, 8) : [];
  const showFallback = !loading && featuredBooks.length === 0;
  const regularBooks = books.filter(b => !b.is_featured).slice(0, 8);

  return (
    <div className="page home">

      {/* ── 1. Hero ── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__grid" />
        {/* Watermark logo — subtle background element */}
        <div className="hero__logo-watermark" aria-hidden="true">
          <img src="/logo.webp" alt="" width="280" height="280" />
        </div>

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
            <div className="hero__logo-display">
              <img
                src="/logo.webp"
                alt="مكتبة رحمة"
                className="hero__logo-main"
                width="320" height="320"
                loading="eager"
              />
              <div className="hero__logo-glow" aria-hidden="true" />
              <div className="hero__logo-ring" aria-hidden="true" />
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
              <span className="home-marquee__dot" />{item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 1.5 Image + Description Strip ── */}
      <section className="home-img-strip">
        <div className="container home-img-strip__inner">
          <div className="home-img-strip__img-wrap">
            <img
              src="/bookstore.webp"
              alt="مكتبة رحمة — القراءة نور"
              className="home-img-strip__img"
              loading="lazy"
              onError={e => { e.target.style.display='none'; }}
            />
            <div className="home-img-strip__img-overlay" />
          </div>
          <div className="home-img-strip__text">
            <p className="section-eyebrow">
              {lang === 'ar' ? 'عن المكتبة' : lang === 'fr' ? 'À propos' : 'About Us'}
            </p>
            <h2 className="home-img-strip__title">
              {lang === 'ar'
                ? <>الكتاب رفيق <em>العقل والروح</em></>
                : lang === 'fr'
                ? <>Le livre, compagnon de <em>l'esprit</em></>
                : <>Books that <em>enrich the mind</em></>
              }
            </h2>
            <p className="home-img-strip__desc">
              {lang === 'ar'
                ? 'في مكتبة رحمة، نؤمن بأن القراءة هي أعظم رحلة يقوم بها الإنسان. نختار لك بعناية أفضل الكتب العربية والإسلامية والعالمية — من الأدب الكلاسيكي إلى الفكر المعاصر — لتجد في كل صفحة ما يُنير طريقك.'
                : lang === 'fr'
                ? 'Chez Maktabat Rahma, nous croyons que la lecture est le plus grand voyage humain. Nous sélectionnons avec soin les meilleurs ouvrages arabes, islamiques et mondiaux — de la littérature classique à la pensée contemporaine.'
                : 'At Maktabat Rahma, we believe reading is the greatest journey a person can take. We carefully curate the finest Arabic, Islamic, and world titles — from timeless classics to contemporary thought — so every page illuminates your path.'
              }
            </p>
            <div className="home-img-strip__features">
              <div className="home-img-strip__feat">
                <span className="home-img-strip__feat-icon">📚</span>
                <span>{lang === 'ar' ? '٥٠٠+ كتاب' : lang === 'fr' ? '500+ livres' : '500+ Books'}</span>
              </div>
              <div className="home-img-strip__feat">
                <span className="home-img-strip__feat-icon">🚚</span>
                <span>{lang === 'ar' ? 'توصيل سريع' : lang === 'fr' ? 'Livraison rapide' : 'Fast Delivery'}</span>
              </div>
              <div className="home-img-strip__feat">
                <span className="home-img-strip__feat-icon">💬</span>
                <span>{lang === 'ar' ? 'طلب واتساب' : lang === 'fr' ? 'Commande WhatsApp' : 'WhatsApp Order'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Books ── */}
      <section className="home-featured">
        <div className="container">
          <div className="home-featured__header">
            <div className="home-featured__title-block">
              <span className="section-eyebrow">{tx.our_collection}</span>
              <h2 className="section-title">
                {tx.featured_books} <em className="section-title-em">{tx.featured_em}</em>
              </h2>
              <p className="home-featured__subtitle">
                {lang === 'ar' ? 'اكتشف أفضل اختياراتنا' : lang === 'fr' ? 'Découvrez nos meilleures sélections' : 'Discover our hand-picked top reads'}
              </p>
            </div>
            <Link to="/shop" className="btn btn-outline home-featured__view-all" onClick={goTop('/shop')}>{tx.view_all}</Link>
          </div>

          {loading ? (
            <div className="home-featured-grid">
              {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="home-featured-grid">
              {featured.map((book, i) => <FeaturedCard key={book.id} book={book} delay={i * 60} />)}
            </div>
          ) : showFallback ? (
            <div className="home-grid">
              {books.slice(0, 8).map((book, i) => <BookCard key={book.id} book={book} delay={i * 55} />)}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── 3. About snippet ── */}
      <section className="home-about-strip">
        <div className="container home-about-strip__inner">
          <div className="home-about-strip__logo-col">
            <img
              src="/logo.webp"
              alt="مكتبة رحمة"
              className="home-about-strip__logo"
              loading="lazy"
            />
          </div>
          <div className="home-about-strip__text">
            <p className="section-eyebrow">{tx.our_story}</p>
            <h2 className="home-about-strip__title">
              {tx.about_strip_title} <em>{tx.about_strip_em}</em>
            </h2>
            <p className="home-about-strip__desc">{tx.about_strip_desc}</p>
            <Link to="/about" className="btn btn-outline" onClick={goTop('/about')}>{tx.learn_more}</Link>
          </div>
        </div>
      </section>

      {/* ── 4. All Books (non-featured) ── */}
      {(loading || regularBooks.length > 0) && (
        <section className="home-featured" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="home-featured__header">
              <div className="home-featured__title-block">
                <span className="section-eyebrow">{tx.the_collection}</span>
                <h2 className="section-title">
                  {tx.all_books} <em className="section-title-em">{tx.all_books_em}</em>
                </h2>
              </div>
              <Link to="/shop" className="btn btn-outline home-featured__view-all" onClick={goTop('/shop')}>{tx.view_all}</Link>
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
