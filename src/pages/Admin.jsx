// src/pages/Admin.jsx — v4 (multi-image, featured toggle, improved UI)
import { useState, useEffect, useRef } from 'react';
import { supabase, ADMIN_EMAIL, uploadCoverImage, uploadMultipleImages, validateImageFile } from '../supabase';
import { useBooks } from '../hooks/useBooks';
import './Admin.css';

const CATEGORIES = [
  'Islamic','Fiction','Non-Fiction','History',
  'Science','Philosophy','Poetry','Children','Other'
];

const EMPTY_FORM = {
  title: '', author: '', price: '', description: '',
  category: '',
  images: [],          // array of { url, file, preview }
  mainImageIndex: 0,
  is_featured: false,
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error') };
}

export default function Admin() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { books, loading: booksLoading, addBook, updateBook, deleteBook } = useBooks();

  const [showModal,      setShowModal]      = useState(false);
  const [editingId,      setEditingId]      = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formErrors,     setFormErrors]     = useState({});
  const [saving,         setSaving]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [urlInputVal,    setUrlInputVal]    = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterCat,    setFilterCat]    = useState('All');

  const multiFileInputRef = useRef(null);
  const { toasts, success, error } = useToast();

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');
  const [loginErr,   setLoginErr]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  // Client-side brute-force guard: lock after 5 failures for 60 s
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockUntil, setLoginLockUntil] = useState(0);
  const MAX_ATTEMPTS = 5;
  const LOCK_SECONDS = 60;

  const handleLogin = async (e) => {
    e.preventDefault();
    // Check lockout
    const now = Date.now();
    if (now < loginLockUntil) {
      const secs = Math.ceil((loginLockUntil - now) / 1000);
      setLoginErr(`Too many failed attempts. Try again in ${secs}s.`);
      return;
    }
    if (!loginEmail.trim() || !loginPass) { setLoginErr('Please enter your email and password.'); return; }
    setLoginLoading(true); setLoginErr('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail.trim().toLowerCase(), password: loginPass });
    if (authError) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCK_SECONDS * 1000;
        setLoginLockUntil(lockUntil);
        setLoginAttempts(0);
        setLoginErr(`Too many failed attempts. Account locked for ${LOCK_SECONDS} seconds.`);
      } else {
        const c = authError.message?.toLowerCase() ?? '';
        setLoginErr(c.includes('invalid') || c.includes('credentials') ? 'Incorrect email or password.'
          : c.includes('rate') || c.includes('limit') ? 'Too many attempts. Try again later.'
          : 'Sign-in failed. Please try again.');
      }
    } else {
      // Reset on success
      setLoginAttempts(0);
      setLoginLockUntil(0);
    }
    setLoginLoading(false);
  };
  const handleLogout = () => supabase.auth.signOut();

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    return (!q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q))
      && (filterCat === 'All' || b.category === filterCat);
  });

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (formErrors[k]) setFormErrors(e => ({ ...e, [k]: null }));
  };

  const addImageFiles = (files) => {
    const newImgs = [];
    const rejected = [];

    Array.from(files).forEach(f => {
      const { valid, reason } = validateImageFile(f);
      if (valid) {
        newImgs.push({ file: f, url: '', preview: URL.createObjectURL(f) });
      } else {
        rejected.push(`"${f.name}": ${reason}`);
      }
    });

    if (rejected.length > 0) {
      error('Skipped: ' + rejected.join(' | '));
    }
    if (newImgs.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
    }
  };

  const addImageUrl = (url) => {
    if (!url || !/^https?:\/\/.+/.test(url)) return;
    setForm(prev => ({ ...prev, images: [...prev.images, { file: null, url, preview: url }] }));
  };

  const removeImage = (idx) => {
    setForm(prev => {
      const img = prev.images[idx];
      if (img?.file) URL.revokeObjectURL(img.preview);
      const imgs = prev.images.filter((_, i) => i !== idx);
      const mainIdx = prev.mainImageIndex >= imgs.length ? Math.max(0, imgs.length - 1) : prev.mainImageIndex;
      return { ...prev, images: imgs, mainImageIndex: mainIdx };
    });
  };

  const setMainImage = (idx) => setForm(prev => ({ ...prev, mainImageIndex: idx }));

  const openAdd = () => {
    setEditingId(null); setForm(EMPTY_FORM); setFormErrors({});
    setUrlInputVal(''); setShowModal(true);
  };

  const openEdit = (book) => {
    setEditingId(book.id);
    const existingImages = [];
    if (book.images?.length) book.images.filter(Boolean).forEach(u => existingImages.push({ file: null, url: u, preview: u }));
    else if (book.image_url) existingImages.push({ file: null, url: book.image_url, preview: book.image_url });

    setForm({
      title: book.title || '', author: book.author || '',
      price: book.price ?? '', description: book.description || '',
      category: book.category || '',
      images: existingImages, mainImageIndex: 0,
      is_featured: book.is_featured ?? false,
    });
    setFormErrors({}); setUrlInputVal(''); setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    form.images.forEach(img => { if (img.file) URL.revokeObjectURL(img.preview); });
    setShowModal(false); setEditingId(null); setForm(EMPTY_FORM);
    setFormErrors({}); setUploadProgress(null); setUrlInputVal('');
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())                     errs.title    = 'Title is required';
    if (form.title.trim().length > 200)         errs.title    = 'Title too long (max 200 chars)';
    if (form.author.trim().length > 150)        errs.author   = 'Author too long (max 150 chars)';
    if (!form.category)                         errs.category = 'Category is required';
    if (!CATEGORIES.includes(form.category) && form.category !== '')
                                                errs.category = 'Invalid category';
    if (form.price !== '' && (isNaN(Number(form.price)) || Number(form.price) < 0 || Number(form.price) > 99999))
                                                errs.price    = 'Price must be 0–99999';
    if (form.description.length > 1000)         errs.description = 'Description too long (max 1000 chars)';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true); setUploadProgress(0);

    try {
      // Separate files that need uploading from URLs that are already hosted
      const fileImages = form.images.filter(img => img.file);
      const urlImages  = form.images.filter(img => !img.file && img.url);

      // Upload all file images using the robust batch helper
      // onProgress fires after each file completes
      const uploadedFileUrls = await uploadMultipleImages(
        fileImages.map(img => img.file),
        {
          onProgress: (done, total) => {
            // 0–90% = uploading files
            setUploadProgress(Math.round((done / Math.max(total, 1)) * 90));
          },
          onError: (msg) => {
            // Show per-file errors as warnings but continue
            error(msg);
          },
        }
      );

      setUploadProgress(92);

      // Rebuild the full ordered image URL list maintaining the user's order
      // Replace file-slots with their uploaded URLs, keep url-slots as-is
      let fileUrlIdx = 0;
      const uploaded = form.images.map(img => {
        if (img.file) {
          // This slot was a file — use the uploaded URL (may be undefined if it failed)
          return uploadedFileUrls[fileUrlIdx++] || null;
        }
        return img.url || null;
      }).filter(Boolean); // remove any failed/null slots

      setUploadProgress(97);

      // Determine primary cover URL (respect mainImageIndex)
      const primaryUrl = uploaded[form.mainImageIndex] || uploaded[0] || '';

      const payload = {
        title:       form.title.trim(),
        author:      form.author.trim() || null,
        price:       form.price !== '' ? Number(form.price) : null,
        description: form.description.trim() || null,
        category:    form.category,
        imageUrl:    primaryUrl,
        images:      uploaded.length ? uploaded : null,
        is_featured: form.is_featured,
      };

      if (editingId) { await updateBook(editingId, payload); success('Book updated!'); }
      else           { await addBook(payload);                success('Book added!'); }

      setUploadProgress(100);
      closeModal();
    } catch (err) {
      error('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false); setUploadProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteBook(deleteTarget.id); success(`"${deleteTarget.title}" deleted.`); }
    catch (err) { error('Delete failed: ' + (err.message || '')); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  if (authLoading) return <div className="admin-splash"><div className="spinner" /></div>;

  if (!user) return (
    <div className="admin-login">
      <div className="admin-login__card scale-in">
        <div className="admin-login__logo">
          <span className="admin-login__logo-ar">مكتبة رحمة</span>
          <span className="admin-login__logo-en">Admin Dashboard</span>
        </div>
        <div className="admin-login__icon">🔐</div>
        <h1 className="admin-login__title">Admin Sign In</h1>
        <p className="admin-login__desc">Enter your admin credentials to access the dashboard.</p>
        <form className="admin-login__form" onSubmit={handleLogin} noValidate>
          {loginErr && <div className="admin-login__error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{loginErr}</div>}
          <div className="admin-login__field">
            <label>Email Address</label>
            <div className="admin-login__input-wrap">
              <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginErr(''); }} placeholder="admin@example.com" autoComplete="email" autoFocus />
            </div>
          </div>
          <div className="admin-login__field">
            <label>Password</label>
            <div className="admin-login__input-wrap">
              <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginErr(''); }} placeholder="••••••••" autoComplete="current-password" />
              <button type="button" className="admin-login__eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                         : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>
          <button type="submit" className="admin-login__submit-btn" disabled={loginLoading || Date.now() < loginLockUntil}>
            {loginLoading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}} /> Signing in…</> : <>Sign In →</>}
          </button>
        </form>
        <a href="/" className="admin-login__back">← Back to Store</a>
      </div>
      <ToastList toasts={toasts} />
    </div>
  );

  if (user.email !== ADMIN_EMAIL) return (
    <div className="admin-denied"><div className="admin-denied__card scale-in">
      <div className="admin-denied__icon">⛔</div>
      <h1>Access Denied</h1>
      <p>This account (<strong>{user.email}</strong>) is not authorised.</p>
      <button className="btn btn-outline" onClick={handleLogout} style={{marginTop:24}}>Sign Out</button>
    </div></div>
  );

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-ar">مكتبة رحمة</span>
          <span className="admin-sidebar__logo-en">Admin Panel</span>
        </div>
        <nav className="admin-sidebar__nav">
          <div className="admin-nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Dashboard
          </div>
          <div className="admin-nav-item" onClick={openAdd}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Book
          </div>
        </nav>
        <div className="admin-sidebar__footer">
          <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=6b3fa0&color=fff`} className="admin-sidebar__avatar" alt="avatar" />
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__user-name">{user.user_metadata?.full_name || 'Admin'}</span>
            <span className="admin-sidebar__user-email">{user.email}</span>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Books Dashboard</h1>
            <p className="admin-topbar__sub">Manage your collection · {books.length} books</p>
          </div>
          <button className="btn btn-primary admin-topbar__add" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Book
          </button>
        </div>

        <div className="admin-stats">
          {[
            { label:'Total Books', value: books.length, icon:'📚' },
            { label:'Featured',    value: books.filter(b=>b.is_featured).length, icon:'⭐' },
            { label:'With Price',  value: books.filter(b=>b.price).length, icon:'💰' },
            { label:'Free Books',  value: books.filter(b=>!b.price).length, icon:'🎁' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card">
              <span className="admin-stat-card__icon">{s.icon}</span>
              <span className="admin-stat-card__val">{booksLoading ? '…' : s.value}</span>
              <span className="admin-stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="admin-controls">
          <div className="admin-search-wrap">
            <svg className="admin-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="admin-search" type="text" placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="admin-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <select className="admin-filter" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="admin-table-wrap">
          {booksLoading ? (
            <div className="admin-loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty"><span>{search || filterCat !== 'All' ? '🔍 No matching books.' : '📭 No books yet.'}</span></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th><th>Title</th><th>Category</th>
                  <th>Price</th><th>Featured</th><th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, i) => (
                  <tr key={book.id} className="admin-table__row" style={{animationDelay:`${i*30}ms`}}>
                    <td>
                      <img className="admin-table__cover"
                        src={book.image_url || 'https://placehold.co/56x76/e8dff5/6b3fa0?text=📖'} alt={book.title}
                        onError={e => { e.target.src='https://placehold.co/56x76/e8dff5/6b3fa0?text=📖'; }} />
                    </td>
                    <td>
                      <div className="admin-table__title">{book.title}</div>
                      {book.author && <div className="admin-table__author">{book.author}</div>}
                    </td>
                    <td>{book.category && <span className="badge badge-plum">{book.category}</span>}</td>
                    <td className="admin-table__price">
                      {book.price ? `MAD ${Number(book.price).toFixed(2)}` : <span style={{color:'var(--ink-ghost)'}}>—</span>}
                    </td>
                    <td>
                      <span className={`admin-featured-badge ${book.is_featured ? 'admin-featured-badge--on' : ''}`}>
                        {book.is_featured ? '⭐ Featured' : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-btn-edit" onClick={() => openEdit(book)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button className="admin-btn-delete" onClick={() => setDeleteTarget(book)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ═══════════════ MODAL v4 ═══════════════ */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="admin-modal admin-modal--v4 scale-in">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{editingId ? '✏️ Edit Book' : '➕ Add New Book'}</h2>
              <button className="admin-modal__close" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form className="admin-modal__form" onSubmit={handleSave} noValidate>
              <div className="admin-modal__body">

                {/* LEFT: Details */}
                <div className="admin-modal__fields">
                  <div className="admin-modal__section-label">📖 Book Details</div>

                  <FormField label="Title *" error={formErrors.title}>
                    <input value={form.title} onChange={e => setField('title', e.target.value)}
                      placeholder="e.g. The Alchemist" className={formErrors.title ? 'error' : ''}
                      maxLength={200} />
                  </FormField>

                  <FormField label="Author">
                    <input value={form.author} onChange={e => setField('author', e.target.value)}
                      placeholder="e.g. Paulo Coelho"
                      maxLength={150} />
                  </FormField>

                  <div className="admin-modal__row">
                    <FormField label="Category *" error={formErrors.category}>
                      <select value={form.category} onChange={e => setField('category', e.target.value)} className={formErrors.category ? 'error' : ''}>
                        <option value="">— Select —</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Price (MAD)" error={formErrors.price}>
                      <input type="number" min="0" max="99999" step="0.01" value={form.price}
                        onChange={e => setField('price', e.target.value)} placeholder="0.00" className={formErrors.price ? 'error' : ''} />
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                      placeholder="A short description…" rows={3}
                      maxLength={1000} />
                  </FormField>

                  {/* Featured toggle */}
                  <div className="admin-modal__section-label" style={{marginTop:4}}>⚙️ Settings</div>
                  <div className="admin-featured-toggle">
                    <div
                      className={`admin-toggle-switch ${form.is_featured ? 'admin-toggle-switch--on' : ''}`}
                      onClick={() => setField('is_featured', !form.is_featured)}
                      role="switch" aria-checked={form.is_featured} tabIndex={0}
                      onKeyDown={e => e.key === ' ' && setField('is_featured', !form.is_featured)}
                    >
                      <div className="admin-toggle-thumb" />
                    </div>
                    <div className="admin-toggle-text">
                      <span className="admin-toggle-title">⭐ Featured Product</span>
                      <span className="admin-toggle-desc">Show in Featured Books on homepage</span>
                    </div>
                  </div>

                  {/* Images section */}
                  <div className="admin-modal__section-label" style={{marginTop:8}}>🖼️ Images</div>

                  <div className="admin-img-url-row">
                    <input type="url" placeholder="Paste image URL…" value={urlInputVal}
                      onChange={e => setUrlInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(urlInputVal); setUrlInputVal(''); } }} />
                    <button type="button" className="admin-img-url-add"
                      onClick={() => { addImageUrl(urlInputVal); setUrlInputVal(''); }} disabled={!urlInputVal}>
                      Add
                    </button>
                  </div>

                  <div className="admin-modal__or"><span>or upload files</span></div>

                  <div className="admin-upload-zone admin-upload-zone--multi"
                    onClick={() => multiFileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); addImageFiles(e.dataTransfer.files); }}>
                    <input ref={multiFileInputRef} type="file" accept="image/*" multiple style={{display:'none'}}
                      onChange={e => { addImageFiles(e.target.files); e.target.value = ''; }} />
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Click or drag & drop images</span>
                    <span className="admin-upload-zone__hint">Multiple files · PNG, JPG, WEBP · max 8 MB each</span>
                  </div>

                  {uploadProgress !== null && (
                    <div className="admin-upload-progress">
                      <div className="admin-upload-progress__bar" style={{width: uploadProgress + '%'}} />
                      <span>{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* RIGHT: Image gallery preview */}
                <div className="admin-modal__preview-col">
                  <p className="admin-modal__preview-label">
                    Images Preview
                    <span className="admin-preview-count">{form.images.length} image{form.images.length !== 1 ? 's' : ''}</span>
                  </p>

                  {form.images.length === 0 ? (
                    <div className="admin-modal__preview-empty-state">
                      <span>📷</span>
                      <p>No images yet</p>
                      <small>Add URLs or upload files</small>
                    </div>
                  ) : (
                    <>
                      <div className="admin-img-main-preview">
                        <img src={form.images[form.mainImageIndex]?.preview || ''}
                          alt="cover preview"
                          onError={e => { e.target.src = 'https://placehold.co/200x270/1a1a2e/b48de8?text=📖'; }} />
                        <span className="admin-img-main-label">★ Cover</span>
                      </div>
                      <div className="admin-img-thumbs">
                        {form.images.map((img, i) => (
                          <div key={i} className={`admin-img-thumb ${i === form.mainImageIndex ? 'admin-img-thumb--main' : ''}`}>
                            <img src={img.preview} alt={`img ${i+1}`}
                              onError={e => { e.target.src = 'https://placehold.co/80x100/1a1a2e/b48de8?text=📖'; }} />
                            <div className="admin-img-thumb-overlay">
                              {i !== form.mainImageIndex
                                ? <button type="button" className="admin-img-thumb-set" onClick={() => setMainImage(i)} title="Set as cover">★</button>
                                : <span className="admin-img-thumb-star">★</span>}
                              <button type="button" className="admin-img-thumb-del" onClick={() => removeImage(i)} title="Remove">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="admin-img-hint">★ = cover · click ★ on thumbnail to set as main</p>
                    </>
                  )}
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Saving…</> : editingId ? '✓ Update Book' : '+ Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={e => { if (!deleting && e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="admin-confirm scale-in">
            <div className="admin-confirm__icon">🗑</div>
            <h2 className="admin-confirm__title">Delete Book?</h2>
            <p className="admin-confirm__msg">Permanently delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.</p>
            <div className="admin-confirm__btns">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger admin-confirm__del" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}} /> Deleting…</> : '🗑 Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastList toasts={toasts} />
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="admin-form-field">
      <label className="admin-form-label">{label}</label>
      {children}
      {error && <span className="admin-form-error">{error}</span>}
    </div>
  );
}

function ToastList({ toasts }) {
  return (
    <div className="admin-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`admin-toast admin-toast--${t.type} scale-in`}>
          {t.type === 'success' ? '✓' : '⚠'} {t.msg}
        </div>
      ))}
    </div>
  );
}
