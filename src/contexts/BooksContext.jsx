// src/contexts/BooksContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const BooksContext = createContext(null);

const sortBooks = (rows) =>
  [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

export function BooksProvider({ children }) {
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('books')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) setBooks(sortBooks(data));
        setLoading(false);
      });

    const channel = supabase
      .channel('books-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        setBooks(prev => {
          if (eventType === 'INSERT') return sortBooks([...prev, newRow]);
          if (eventType === 'UPDATE') return sortBooks(prev.map(b => b.id === newRow.id ? newRow : b));
          if (eventType === 'DELETE') return prev.filter(b => b.id !== oldRow.id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fix #8: Support is_featured + Fix #7: Support images[] array
  const addBook = async (data) => {
    const { error } = await supabase.from('books').insert({
      title:       data.title,
      author:      data.author   || null,
      price:       data.price    != null ? Number(data.price) : null,
      description: data.description || null,
      category:    data.category || null,
      image_url:   data.imageUrl || null,
      images:      data.images?.length ? data.images : null,
      is_featured: data.is_featured ?? false,
    });
    if (error) throw error;
  };

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
        images:      data.images?.length ? data.images : null,
        is_featured: data.is_featured ?? false,
      })
      .eq('id', id);
    if (error) throw error;
  };

  const deleteBook = async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  };

  const getBookById = (id) => books.find(b => b.id === id) ?? null;

  return (
    <BooksContext.Provider value={{ books, loading, getBookById, addBook, updateBook, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export const useBooks = () => useContext(BooksContext);
