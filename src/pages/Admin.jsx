// src/pages/Admin.jsx
// ─────────────────────────────────────────────────────────────────────
//  Admin Dashboard — fully migrated from Firebase to Supabase.
//
//  Key changes vs Firebase version:
//    signInWithEmailAndPassword → supabase.auth.signInWithPassword
//    signOut                    → supabase.auth.signOut
//    onAuthStateChanged         → supabase.auth.onAuthStateChange
//    addDoc / updateDoc / delete → via BooksContext (which uses Supabase)
//    Firebase Storage upload    → uploadCoverImage() from src/supabase.js
// ─────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { supabase, ADMIN_EMAIL, uploadCoverImage } from '../supabase';
import { useBooks } from '../hooks/useBooks';
import './Admin.css';

const CATEGORIES = [
  'Islamic','Fiction','Non-Fiction','History',
  'Science','Philosophy','Poetry','Children','Other'
];

const EMPTY_FORM = {
  title: '', author: '', price: '', description: '',
  category: '', imageUrl: '', imageFile: null,
};

// ── Toast helper ────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error') };
}

// ── Main component ───────────────────────────────────────────────────
export default function Admin() {
  // ── Auth state ──────────────────────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Books from global context (Supabase) ────────────────────────
  const { books, loading: booksLoading, addBook, updateBook, deleteBook } = useBooks();

  // ── Form / modal state ──────────────────────────────────────────
  const [showModal,    setShowModal]   = useState(false);
  const [editingId,    setEditingId]   = useState(null);
  const [form,         setForm]        = useState(EMPTY_FORM);
  const [formErrors,   setFormErrors]  = useState({});
  const [saving,       setSaving]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewUrl,   setPreviewUrl]  = useState('');

  // ── Delete confirm ──────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Search / filter ─────────────────────────────────────────────
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const fileInputRef = useRef(null);
  const { toasts, success, error } = useToast();

  // ── Subscribe to Supabase auth state ────────────────────────────
  useEffect(() => {
    // Immediately read current session (no flash)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Preview URL sync ─────────────────────────────────────────────
  useEffect(() => {
    if (form.imageFile) {
      const url = URL.createObjectURL(form.imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(form.imageUrl || '');
  }, [form.imageFile, form.imageUrl]);

  // ── Login form state ─────────────────────────────────────────────
  const [loginEmail,   setLoginEmail]   = useState('');
  const [loginPass,    setLoginPass]    = useState('');
  const [loginErr,     setLoginErr]     = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPass,     setShowPass]     = useState(false);

  // ── Supabase email/password sign-in ─────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPass) {
      setLoginErr('Please enter your email and password.');
      return;
    }
    setLoginLoading(true);
    setLoginErr('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    loginEmail.trim(),
      password: loginPass,
    });

    if (authError) {
      // Map Supabase error codes to user-friendly messages
      const code = authError.message?.toLowerCase() ?? '';
      if (code.includes('invalid') || code.includes('credentials') || code.includes('password')) {
        setLoginErr('Incorrect email or password.');
      } else if (code.includes('rate') || code.includes('limit')) {
        setLoginErr('Too many attempts. Please try again later.');
      } else {
        setLoginErr('Sign-in failed: ' + authError.message);
      }
    }
    setLoginLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  // ── Form helpers ─────────────────────────────────────────────────
  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (formErrors[k]) setFormErrors(e => ({ ...e, [k]: null }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setPreviewUrl('');
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title:       book.title       || '',
      author:      book.author      || '',
      price:       book.price       ?? '',
      description: book.description || '',
      category:    book.category    || '',
      imageUrl:    book.image_url   || '',   // ← Supabase uses image_url (snake_case)
      imageFile:   null,
    });
    setFormErrors({});
    setPreviewUrl(book.image_url || '');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setUploadProgress(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title    = 'Title is required';
    if (!form.category)     errs.category = 'Category is required';
    if (form.price !== '' && isNaN(Number(form.price))) errs.price = 'Must be a number';
    if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl) && !form.imageFile)
      errs.imageUrl = 'Must be a valid URL';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save book (add or update) ────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setUploadProgress(null);

    try {
      let imageUrl = form.imageUrl;

      // Upload file to Supabase Storage if one was selected
      if (form.imageFile) {
        setUploadProgress(10);
        imageUrl = await uploadCoverImage(form.imageFile);
        setUploadProgress(100);
      }

      const payload = {
        title:       form.title.trim(),
        author:      form.author.trim()      || null,
        price:       form.price !== ''       ? Number(form.price) : null,
        description: form.description.trim() || null,
        category:    form.category           || null,
        imageUrl,     // BooksContext maps this to image_url for Supabase
      };

      if (editingId) {
        await updateBook(editingId, payload);
        success('Book updated successfully!');
      } else {
        await addBook(payload);
        success('Book added successfully!');
      }

      closeModal();
    } catch (err) {
      error('Error: ' + err.message);
    }
    setSaving(false);
    setUploadProgress(null);
  };

  // ── Delete book ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget.id);
      success('Book deleted.');
    } catch (err) {
      error('Delete failed: ' + err.message);
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  // ── Filtered list ────────────────────────────────────────────────
  const filtered = books.filter(b => {
    const q  = search.toLowerCase();
    const ms = !q || b.title?.toLowerCase().includes(q) || (b.author||'').toLowerCase().includes(q);
    const mc = filterCat === 'All' || b.category === filterCat;
    return ms && mc;
  });

  // ══════════════════════════════════════════════════════════════════
  //  RENDER STATES
  // ══════════════════════════════════════════════════════════════════

  if (authLoading) return (
    <div className="admin-splash"><div className="spinner" /></div>
  );

  // ── Login screen ─────────────────────────────────────────────────
  if (!user) return (
    <div className="admin-login">
      <div className="admin-login__card scale-in">
        <div className="admin-login__logo">
          <span className="admin-login__logo-ar">مكتبة رحمة</span>
          <span className="admin-login__logo-en">Admin Dashboard</span>
        </div>
        <div className="admin-login__icon">🔐</div>
        <h1 className="admin-login__title">Admin Sign In</h1>
        <p className="admin-login__desc">
          Enter your admin email and password to access the bookstore dashboard.
        </p>

        <form className="admin-login__form" onSubmit={handleLogin} noValidate>
          {loginErr && (
            <div className="admin-login__error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {loginErr}
            </div>
          )}

          <div className="admin-login__field">
            <label>Email Address</label>
            <div className="admin-login__input-wrap">
              <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                type="email"
                value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setLoginErr(''); }}
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="admin-login__field">
            <label>Password</label>
            <div className="admin-login__input-wrap">
              <svg className="admin-login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                type={showPass ? 'text' : 'password'}
                value={loginPass}
                onChange={e => { setLoginPass(e.target.value); setLoginErr(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="admin-login__eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login__submit-btn" disabled={loginLoading}>
            {loginLoading
              ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}} /> Signing in…</>
              : <>Sign In →</>
            }
          </button>
        </form>

        <a href="/" className="admin-login__back">← Back to Store</a>
      </div>
      <ToastList toasts={toasts} />
    </div>
  );

  // ── Access denied ────────────────────────────────────────────────
  if (user.email !== ADMIN_EMAIL) return (
    <div className="admin-denied">
      <div className="admin-denied__card scale-in">
        <div className="admin-denied__icon">⛔</div>
        <h1>Access Denied</h1>
        <p>This account (<strong>{user.email}</strong>) is not authorised to access the admin dashboard.</p>
        <button className="btn btn-outline" onClick={handleLogout} style={{marginTop:24}}>
          Sign Out
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  ADMIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="admin">

      {/* ── Sidebar ── */}
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
          <img
            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=6b3fa0&color=fff`}
            className="admin-sidebar__avatar"
            alt="avatar"
          />
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__user-name">{user.user_metadata?.full_name || 'Admin'}</span>
            <span className="admin-sidebar__user-email">{user.email}</span>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Books Dashboard</h1>
            <p className="admin-topbar__sub">Manage your book collection</p>
          </div>
          <button className="btn btn-primary admin-topbar__add" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Book
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { label:'Total Books',  value: books.length,                                           icon:'📚' },
            { label:'Categories',   value: new Set(books.map(b=>b.category).filter(Boolean)).size, icon:'🏷'  },
            { label:'With Price',   value: books.filter(b=>b.price).length,                        icon:'💰' },
            { label:'Free Books',   value: books.filter(b=>!b.price).length,                       icon:'🎁' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card">
              <span className="admin-stat-card__icon">{s.icon}</span>
              <span className="admin-stat-card__val">{booksLoading ? '…' : s.value}</span>
              <span className="admin-stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="admin-controls">
          <div className="admin-search-wrap">
            <svg className="admin-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="admin-search" type="text"
              placeholder="Search books…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="admin-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>

          <select className="admin-filter" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Books table */}
        <div className="admin-table-wrap">
          {booksLoading ? (
            <div className="admin-loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              <span>{search || filterCat !== 'All' ? '🔍 No matching books.' : '📭 No books yet. Add your first!'}</span>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, i) => (
                  <tr key={book.id} className="admin-table__row" style={{animationDelay:`${i*30}ms`}}>
                    <td>
                      <img
                        className="admin-table__cover"
                        src={book.image_url || 'https://placehold.co/56x76/e8dff5/6b3fa0?text=📖'}
                        alt={book.title}
                        onError={e => { e.target.src='https://placehold.co/56x76/e8dff5/6b3fa0?text=📖'; }}
                      />
                    </td>
                    <td>
                      <div className="admin-table__title">{book.title}</div>
                      {book.author && <div className="admin-table__author">{book.author}</div>}
                    </td>
                    <td>
                      {book.category && <span className="badge badge-plum">{book.category}</span>}
                    </td>
                    <td className="admin-table__price">
                      {book.price ? `${Number(book.price).toFixed(2)} MAD` : <span style={{color:'var(--ink-ghost)'}}>—</span>}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-btn-edit"   onClick={() => openEdit(book)}>
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

      {/* ── Add / Edit modal ── */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="admin-modal scale-in">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {editingId ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <button className="admin-modal__close" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form className="admin-modal__form" onSubmit={handleSave} noValidate>
              <div className="admin-modal__layout">

                {/* Fields */}
                <div className="admin-modal__fields">
                  <FormField label="Title *" error={formErrors.title}>
                    <input value={form.title} onChange={e => setField('title', e.target.value)}
                      placeholder="e.g. The Alchemist" className={formErrors.title ? 'error' : ''} />
                  </FormField>

                  <FormField label="Author">
                    <input value={form.author} onChange={e => setField('author', e.target.value)}
                      placeholder="e.g. Paulo Coelho" />
                  </FormField>

                  <div className="admin-modal__row">
                    <FormField label="Category *" error={formErrors.category}>
                      <select value={form.category} onChange={e => setField('category', e.target.value)}
                        className={formErrors.category ? 'error' : ''}>
                        <option value="">— Select —</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </FormField>

                    <FormField label="Price (MAD)" error={formErrors.price}>
                      <input type="number" min="0" step="0.01"
                        value={form.price} onChange={e => setField('price', e.target.value)}
                        placeholder="0.00" className={formErrors.price ? 'error' : ''} />
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <textarea value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="A short description of the book…" rows={4} />
                  </FormField>

                  <FormField label="Image URL" error={formErrors.imageUrl}>
                    <input value={form.imageUrl}
                      onChange={e => { setField('imageUrl', e.target.value); setField('imageFile', null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      placeholder="https://…" className={formErrors.imageUrl ? 'error' : ''} />
                  </FormField>

                  <div className="admin-modal__or"><span>or upload a file</span></div>

                  {/* Drag & drop zone — uploads to Supabase Storage */}
                  <div
                    className="admin-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f && f.type.startsWith('image/')) {
                        setField('imageFile', f); setField('imageUrl', '');
                      }
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}}
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setField('imageFile', f); setField('imageUrl', ''); }
                      }}
                    />
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>{form.imageFile ? form.imageFile.name : 'Click or drag & drop an image'}</span>
                    <span className="admin-upload-zone__hint">PNG, JPG, WEBP up to 5 MB</span>
                  </div>

                  {uploadProgress !== null && (
                    <div className="admin-upload-progress">
                      <div className="admin-upload-progress__bar" style={{width: uploadProgress + '%'}} />
                      <span>{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="admin-modal__preview-col">
                  <p className="admin-modal__preview-label">Cover Preview</p>
                  <div className="admin-modal__preview">
                    {previewUrl
                      ? <img src={previewUrl} alt="preview" onError={() => setPreviewUrl('')} />
                      : <div className="admin-modal__preview-empty"><span>📷</span><p>No image</p></div>
                    }
                  </div>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Saving…</>
                    : editingId ? '✓ Update Book' : '+ Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={e => { if (!deleting && e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="admin-confirm scale-in">
            <div className="admin-confirm__icon">🗑</div>
            <h2 className="admin-confirm__title">Delete Book?</h2>
            <p className="admin-confirm__msg">
              You are about to permanently delete <strong>"{deleteTarget.title}"</strong>.<br />
              This action cannot be undone.
            </p>
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

// ── Sub-components ────────────────────────────────────────────────────
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
