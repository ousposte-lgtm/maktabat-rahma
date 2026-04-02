// src/pages/Shop.jsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import { useBooks } from '../hooks/useBooks';
import './Shop.css';

const CATS = ['All', 'Fiction', 'Non-Fiction', 'Islamic', 'Children', 'History', 'Science', 'Philosophy', 'Poetry'];
const SORTS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'alpha',     label: 'A → Z' },
];

export default function Shop() {
  const { books, loading } = useBooks();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState(params.get('cat') || 'All');
  const [sort, setSort]     = useState('newest');

  // Sync cat from URL param
  useEffect(() => {
    const c = params.get('cat');
    if (c && CATS.includes(c)) setCat(c);
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

  return (
    <div className="page shop">
      {/* Header */}
      <div className="shop__head">
        <div className="container shop__head-inner">
          <div>
            <p className="section-eyebrow">Our Collection</p>
            <h1 className="section-title">Browse <em>Books</em></h1>
          </div>
          <p className="shop__count">{loading ? '…' : `${filtered.length} book${filtered.length !== 1 ? 's' : ''}`}</p>
        </div>
      </div>

      <div className="container shop__body">
        {/* Controls */}
        <div className="shop__controls">
          {/* Search */}
          <div className="shop__search-wrap">
            <svg className="shop__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="shop__search"
              type="text"
              placeholder="Search by title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="shop__search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Sort */}
          <select className="shop__sort" value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="shop__cats">
          {CATS.map(c => (
            <button
              key={c}
              className={`shop__cat-btn ${cat === c ? 'active' : ''}`}
              onClick={() => changecat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Active search label */}
        {search && (
          <p className="shop__search-label">
            Results for "<strong>{search}</strong>" — {filtered.length} found
          </p>
        )}

        {/* Grid */}
        <div className="shop__grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <BookCardSkeleton key={i} />)
            : filtered.length > 0
              ? filtered.map((book, i) => <BookCard key={book.id} book={book} delay={i * 40} />)
              : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state__icon">🔍</div>
                  <h3>No books found</h3>
                  <p>Try a different search term or category.</p>
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
