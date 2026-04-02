// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ ...book, qty }]

  const addToCart = useCallback((book) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === book.id);
      if (exists) return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...book, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const total     = items.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, itemCount }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
