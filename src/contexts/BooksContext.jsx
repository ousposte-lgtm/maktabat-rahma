// src/contexts/BooksContext.jsx
// ─────────────────────────────────────────────────────────────────────
//  Supabase data layer — replaces Firebase Firestore
//
//  Firebase → Supabase mapping:
//    getDocs(query(...))        → supabase.from('books').select()
//    onSnapshot(...)            → supabase.channel(...).on('postgres_changes', ...)
//    addDoc(collection, data)   → supabase.from('books').insert(data)
//    updateDoc(doc, data)       → supabase.from('books').update(data).eq('id', id)
//    deleteDoc(doc)             → supabase.from('books').delete().eq('id', id)
//    enableIndexedDbPersistence → built-in via localStorage in Supabase client
//
//  Strategy: fetch once immediately (fast), then subscribe for live updates.
//  Books are sorted newest-first in JS — no DB index required.
// ─────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const BooksContext = createContext(null);

// Sort rows by created_at descending
const sortBooks = (rows) =>
  [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

export function BooksProvider({ children }) {
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Step 1: Initial fast fetch ──────────────────────────────────
    // Supabase returns data from its edge CDN — much faster than a cold
    // Firestore WebSocket connection. Paints the UI immediately.
    supabase
      .from('books')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) setBooks(sortBooks(data));
        setLoading(false);
      });

    // ── Step 2: Realtime subscription ───────────────────────────────
    // Supabase Postgres CDC — equivalent to onSnapshot.
    // Fires only on INSERT / UPDATE / DELETE, so no unnecessary re-renders.
    const channel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          setBooks(prev => {
            if (eventType === 'INSERT') {
              return sortBooks([...prev, newRow]);
            }
            if (eventType === 'UPDATE') {
              return sortBooks(prev.map(b => b.id === newRow.id ? newRow : b));
            }
            if (eventType === 'DELETE') {
              return prev.filter(b => b.id !== oldRow.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when the provider unmounts (e.g. test teardown)
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── CRUD mutations ────────────────────────────────────────────────
  // All mutations go through Supabase; realtime subscription auto-updates
  // the local state so no manual setBooks() is needed after mutations.

  /**
   * Add a new book.
   * Supabase column names use snake_case (image_url, created_at).
   */
  const addBook = async (data) => {
    const { error } = await supabase.from('books').insert({
      title:       data.title,
      author:      data.author   || null,
      price:       data.price    != null ? Number(data.price) : null,
      description: data.description || null,
      category:    data.category || null,
      image_url:   data.imageUrl || null,
      // created_at is set automatically by Postgres DEFAULT now()
    });
    if (error) throw error;
  };

  /**
   * Update an existing book by ID.
   */
  const updateBook = async (id, data) => {
    const { error } = await supabase
      .from('books')
      .update({
        title:       data.title,
        author:      data.author      || null,
        price:       data.price != null ? Number(data.price) : null,
        description: data.description || null,
        category:    data.category    || null,
        image_url:   data.imageUrl    || null,
      })
      .eq('id', id);
    if (error) throw error;
  };

  /**
   * Delete a book by ID.
   */
  const deleteBook = async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  };

  /**
   * Instant lookup by ID from the in-memory cache.
   * Used by BookDetail to avoid any extra network call.
   */
  const getBookById = (id) => books.find(b => b.id === id) ?? null;

  return (
    <BooksContext.Provider value={{ books, loading, getBookById, addBook, updateBook, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export const useBooks = () => useContext(BooksContext);
