// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider }  from './contexts/AuthContext';
import { CartProvider }  from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BooksProvider } from './contexts/BooksContext';
import Navbar     from './components/Navbar';
import Footer     from './components/Footer';
import Home       from './pages/Home';
import Shop       from './pages/Shop';
import Cart       from './pages/Cart';
import About      from './pages/About';
import BookDetail from './pages/BookDetail';
import Admin      from './pages/Admin';
import './styles/global.css';

// ── Fix 1: scroll to top on every route change ──────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/"         element={<Home />}       />
          <Route path="/shop"     element={<Shop />}       />
          <Route path="/cart"     element={<Cart />}       />
          <Route path="/about"    element={<About />}      />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/admin"    element={<Admin />}      />
          <Route path="*"         element={<NotFound />}   />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '7rem', color: 'var(--plum-light)', fontWeight: 700, lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--ink-faint)' }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 8 }}>← Back Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <BooksProvider>
          <AuthProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </AuthProvider>
        </BooksProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
