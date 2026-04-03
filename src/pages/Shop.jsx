// src/pages/Shop.jsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import { useBooks } from '../hooks/useBooks';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './Shop.css';

const CATS_KEYS = ['All', 'Fiction', 'Non-Fiction', 'Islamic', 'Children', 'History', 'Science', 'Philosophy', 'Poetry'];

export default function Shop() {
  const { books, loading } = useBooks();
  const { lang } = useTheme();
  const tx = t[lang];
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState(params.get('cat') || 'All');
  const [sort, setSort]     = useState('newest');

  const SORTS = [
    { value: 'newest',     label: tx.sort_newest },
    { value: 'price-asc',  label: tx.sort_price_asc },
    { value: 'price-desc', label: tx.sort_price_desc },
    { value: 'alpha',      label: tx.sort_alpha },
  ];

  useEffect(() => {
    const c = params.get('cat');
    if (c && CATS_KEYS.includes(c)) setCat(c);
  }, [params]);

  const changecat = (c) => {
    setCat(c);
    if (c !== 'All') setParams({ cat: c });
    else setParams({});
  };

  const filtered = useMemo(() => {
    let r = books.filter(b => {
      const q  = search.toLowerCase();
      const ok = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);
      const oc = cat === 'All' || b.category === cat;
      return ok && oc;
    });
    if (sort === 'price-asc')  r = [...r].sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
    if (sort === 'price-desc') r = [...r].sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    if (sort === 'alpha')      r = [...r].sort((a,b) => a.title?.localeCompare(b.title));
    return r;
  }, [books, search, cat, sort]);

  // Display label for "All" category in current language
  const catLabel = (c) => c === 'All' ? tx.cat_all : c;

  return (
    <div className="page shop">
      <div className="shop__head">
        <div className="container shop__head-inner">
          <div>
            <p className="section-eyebrow">{tx.shop_collection}</p>
            <h1 className="section-title">{tx.shop_title} <em>{tx.shop_title_em}</em></h1>
          </div>
          <p className="shop__count">
            {loading ? '…' : `${filtered.length} ${tx.books_label}`}
          </p>
        </div>
      </div>

      <div className="container shop__body">
        <div className="shop__controls">
          <div className="shop__search-wrap">
            <svg className="shop__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="shop__search"
              type="text"
              placeholder={tx.search_placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="shop__search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <select className="shop__sort" value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="shop__cats">
          {CATS_KEYS.map(c => (
            <button
              key={c}
              className={`shop__cat-btn ${cat === c ? 'active' : ''}`}
              onClick={() => changecat(c)}
            >
              {catLabel(c)}
            </button>
          ))}
        </div>

        {search && (
          <p className="shop__search-label">
            {tx.results_for} "<strong>{search}</strong>" — {filtered.length} {tx.found}
          </p>
        )}

        <div className="shop__grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <BookCardSkeleton key={i} />)
            : filtered.length > 0
              ? filtered.map((book, i) => <BookCard key={book.id} book={book} delay={i * 40} />)
              : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state__icon">🔍</div>
                  <h3>{tx.no_results}</h3>
                  <p>{tx.no_results_sub}</p>
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
