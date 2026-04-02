// src/hooks/useBooks.js
// Re-exports from BooksContext so all existing pages (Home, Shop, Admin)
// continue using `import { useBooks } from '../hooks/useBooks'` unchanged.
export { useBooks } from '../contexts/BooksContext';
