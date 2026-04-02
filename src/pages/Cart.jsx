// src/pages/Cart.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { WHATSAPP_NUMBER } from '../supabase';
import './Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQty, clearCart, total, itemCount } = useCart();

  const buildWhatsAppMsg = () => {
    if (items.length === 0) return;

    const lines = items.map(
      (item, i) =>
        `${i + 1}. *${item.title}*${item.author ? ` — ${item.author}` : ''}\n` +
        `   Qty: ${item.qty} × ${Number(item.price || 0).toFixed(2)} MAD`
    );

    const msg =
      `🌟 *New Order — مكتبة رحمة*\n\n` +
      lines.join('\n\n') +
      `\n\n──────────────────\n` +
      `📦 Items: ${itemCount}\n` +
      `💰 *Total: ${total.toFixed(2)} MAD*\n\n` +
      `Please confirm this order. Thank you! 🙏`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="page cart">
        <div className="container">
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <h2 className="cart__empty-title">Your cart is empty</h2>
            <p className="cart__empty-desc">
              You haven't added any books yet. Browse our collection and discover something wonderful.
            </p>
            <Link to="/shop" className="btn btn-primary cart__empty-cta">
              Browse Books
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart">
      <div className="container cart__layout">

        {/* Items list */}
        <div className="cart__items">
          <div className="cart__header">
            <h1 className="cart__title">
              Your Cart
              <span className="cart__badge">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </h1>
            <button className="btn btn-ghost" onClick={clearCart}>Clear all</button>
          </div>

          <div className="cart__list">
            {items.map((item, i) => (
              <div key={item.id} className="cart-item fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="cart-item__img-wrap">
                  <img
                    src={item.image_url || `https://placehold.co/80x110/e8dff5/6b3fa0?text=📖`}
                    alt={item.title}
                    className="cart-item__img"
                    onError={e => { e.target.src = 'https://placehold.co/80x110/e8dff5/6b3fa0?text=📖'; }}
                  />
                </div>

                <div className="cart-item__info">
                  <h3 className="cart-item__title">{item.title}</h3>
                  {item.author && <p className="cart-item__author">{item.author}</p>}
                  {item.category && <span className="badge badge-plum">{item.category}</span>}
                </div>

                <div className="cart-item__right">
                  {/* Qty control */}
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Decrease"
                    >−</button>
                    <span className="cart-item__qty-num">{item.qty}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase"
                    >+</button>
                  </div>

                  <span className="cart-item__price">
                    {(Number(item.price || 0) * item.qty).toFixed(2)} MAD
                  </span>

                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="cart__summary">
          <div className="cart__summary-card">
            <h2 className="cart__summary-title">Order Summary</h2>

            <div className="cart__summary-lines">
              {items.map(item => (
                <div key={item.id} className="cart__summary-line">
                  <span className="cart__summary-line-title">
                    {item.title} <span className="cart__summary-line-qty">×{item.qty}</span>
                  </span>
                  <span>{(Number(item.price || 0) * item.qty).toFixed(2)} MAD</span>
                </div>
              ))}
            </div>

            <div className="cart__summary-divider" />

            <div className="cart__summary-total">
              <span>Total</span>
              <span className="cart__summary-total-num">{total.toFixed(2)} MAD</span>
            </div>

            <button className="btn btn-whatsapp cart__whatsapp-btn" onClick={buildWhatsAppMsg}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Order via WhatsApp
            </button>

            <p className="cart__summary-note">
              Clicking will open WhatsApp with your order details pre-filled.
            </p>

            <Link to="/shop" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
