// src/pages/Cart.jsx — With delivery form in checkout + centered empty state + fixed WA link
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import { sanitizeText } from '../utils/sanitize';
import './Cart.css';

const WA_LINK = 'https://wa.me/212608755373';  // Direct number — supports ?text= pre-fill

export default function Cart() {
  const { items, removeFromCart, updateQty, clearCart, total, itemCount } = useCart();
  const { lang } = useTheme();
  const tx = t[lang];

  // Delivery form state
  const [form, setForm] = useState({ name: '', address: '', city: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const s = {
    empty_title:   lang==='ar' ? 'سلتك فارغة'          : lang==='fr' ? 'Votre panier est vide'  : 'Your cart is empty',
    empty_desc:    lang==='ar' ? 'لم تضف أي كتب بعد. تصفح مجموعتنا واكتشف شيئاً رائعاً.' : lang==='fr' ? "Vous n'avez pas encore ajouté de livres." : "You haven't added any books yet. Browse our collection.",
    browse:        lang==='ar' ? 'تصفح الكتب'           : lang==='fr' ? 'Parcourir'              : 'Browse Books',
    your_cart:     lang==='ar' ? 'سلتك'                 : lang==='fr' ? 'Votre panier'           : 'Your Cart',
    item:          lang==='ar' ? 'كتاب'                 : lang==='fr' ? 'article'                : 'item',
    items:         lang==='ar' ? 'كتب'                  : lang==='fr' ? 'articles'               : 'items',
    clear:         lang==='ar' ? 'مسح الكل'             : lang==='fr' ? 'Tout effacer'           : 'Clear all',
    summary:       lang==='ar' ? 'ملخص الطلب'           : lang==='fr' ? 'Résumé de commande'     : 'Order Summary',
    total:         lang==='ar' ? 'المجموع'              : lang==='fr' ? 'Total'                  : 'Total',
    order_wa:      lang==='ar' ? 'الطلب عبر واتساب'     : lang==='fr' ? 'Commander via WhatsApp' : 'Order via WhatsApp',
    wa_note:       lang==='ar' ? 'سيفتح واتساب بتفاصيل طلبك جاهزة.' : lang==='fr' ? "WhatsApp s'ouvrira avec votre commande préremplie." : 'Clicking will open WhatsApp with your order details pre-filled.',
    continue:      lang==='ar' ? '← متابعة التسوق'      : lang==='fr' ? '← Continuer les achats' : '← Continue Shopping',
    // Form labels
    delivery_title: lang==='ar' ? 'بيانات التوصيل'      : lang==='fr' ? 'Informations de livraison' : 'Delivery Details',
    delivery_sub:   lang==='ar' ? 'أدخل بياناتك لإرسال طلبك عبر واتساب' : lang==='fr' ? 'Entrez vos coordonnées pour commander via WhatsApp' : 'Fill in your details to send your order via WhatsApp',
    f_name:         lang==='ar' ? 'الاسم'               : lang==='fr' ? 'Nom'                    : 'Name',
    f_address:      lang==='ar' ? 'العنوان'              : lang==='fr' ? 'Adresse'                : 'Address',
    f_city:         lang==='ar' ? 'المدينة'              : lang==='fr' ? 'Ville'                  : 'City',
    f_send:         lang==='ar' ? 'إرسال عبر واتساب'    : lang==='fr' ? 'Envoyer via WhatsApp'   : 'Send via WhatsApp',
    f_sent:         lang==='ar' ? 'تم الإرسال ✓'        : lang==='fr' ? 'Envoyé ✓'              : 'Sent ✓',
    ph_name:        lang==='ar' ? 'مثال: محمد الأمين'   : lang==='fr' ? 'Ex: Mohammed Amine'     : 'e.g. Mohammed Amine',
    ph_addr:        lang==='ar' ? 'الحي، الشارع...'      : lang==='fr' ? 'Quartier, rue...'       : 'Street, neighbourhood...',
    ph_city:        lang==='ar' ? 'أكادير، الدار البيضاء...' : lang==='fr' ? 'Agadir, Casablanca...' : 'Agadir, Casablanca...',
  };

  // Check if all 3 delivery fields are filled
  const formFilled = form.name.trim() !== '' && form.address.trim() !== '' && form.city.trim() !== '';

  const buildWhatsAppMsg = () => {
    // Guard: do nothing if form is not filled or cart is empty
    if (!formFilled || items.length === 0) return;

    // Sanitize user input before embedding in URL
    const safeName    = sanitizeText(form.name,    100);
    const safeAddress = sanitizeText(form.address, 200);
    const safeCity    = sanitizeText(form.city,    100);

    // Build order lines
    const lines = items.map((item, i) =>
      `${i + 1}. ${item.title}${item.author ? ` — ${item.author}` : ''}\n` +
      `   Qty: ${item.qty} x ${Number(item.price || 0).toFixed(2)} MAD`
    );

    // Build the full message with all required fields
    const msg = [
      'طلب جديد - مكتبة رحمة',
      '',
      '--- بيانات التوصيل ---',
      `الاسم: ${safeName}`,
      `العنوان: ${safeAddress}`,
      `المدينة: ${safeCity}`,
      '',
      '--- الطلب ---',
      ...lines,
      '',
      '---',
      `المجموع: ${total.toFixed(2)} MAD`,
      `عدد الكتب: ${itemCount}`,
    ].join('\n');

    // URL-encode the message and append to the WhatsApp link
    const encoded = encodeURIComponent(msg);
    // wa.me/message/ custom links support ?text= for pre-filling
    const url = `${WA_LINK}?text=${encoded}`;

    window.open(url, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (items.length === 0) {
    return (
      <div className="page cart">
        <div className="container">
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <h2 className="cart__empty-title">{s.empty_title}</h2>
            <p className="cart__empty-desc">{s.empty_desc}</p>
            <Link to="/shop" className="btn btn-primary cart__empty-cta">
              {s.browse}
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

        <div className="cart__items">
          <div className="cart__header">
            <h1 className="cart__title">
              {s.your_cart}
              <span className="cart__badge">{itemCount} {itemCount !== 1 ? s.items : s.item}</span>
            </h1>
            <button className="btn btn-ghost" onClick={clearCart}>{s.clear}</button>
          </div>

          <div className="cart__list">
            {items.map((item, i) => (
              <div key={item.id} className="cart-item fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="cart-item__img-wrap">
                  <img
                    src={item.image_url || `https://placehold.co/80x110/e8dff5/6b3fa0?text=📖`}
                    alt={item.title} className="cart-item__img"
                    onError={e => { e.target.src = 'https://placehold.co/80x110/e8dff5/6b3fa0?text=📖'; }}
                  />
                </div>
                <div className="cart-item__info">
                  <h3 className="cart-item__title">{item.title}</h3>
                  {item.author && <p className="cart-item__author">{item.author}</p>}
                  {item.category && <span className="badge badge-plum">{item.category}</span>}
                </div>
                <div className="cart-item__right">
                  <div className="cart-item__qty">
                    <button className="cart-item__qty-btn" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
                    <span className="cart-item__qty-num">{item.qty}</span>
                    <button className="cart-item__qty-btn" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <span className="cart-item__price"><span className="price-mad">MAD</span> {(Number(item.price || 0) * item.qty).toFixed(2)}</span>
                  <button className="cart-item__remove" onClick={() => removeFromCart(item.id)} aria-label="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart__summary">
          <div className="cart__summary-card">
            <h2 className="cart__summary-title">{s.summary}</h2>
            <div className="cart__summary-lines">
              {items.map(item => (
                <div key={item.id} className="cart__summary-line">
                  <span className="cart__summary-line-title">
                    {item.title} <span className="cart__summary-line-qty">×{item.qty}</span>
                  </span>
                  <span><span className="price-mad">MAD</span> {(Number(item.price || 0) * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-divider" />
            <div className="cart__summary-total">
              <span>{s.total}</span>
              <span className="cart__summary-total-num"><span className="price-mad">MAD</span> {total.toFixed(2)}</span>
            </div>

            {/* ── Delivery Form ── */}
            <div className="cart__delivery-form">
              <div className="cart__delivery-form-header">
                <span className="cart__delivery-form-icon">📦</span>
                <div>
                  <h3 className="cart__delivery-form-title">{s.delivery_title}</h3>
                  <p className="cart__delivery-form-sub">{s.delivery_sub}</p>
                </div>
              </div>
              <div className="cart__delivery-fields">
                <div className="cart__field">
                  <label className="cart__field-label">{s.f_name}</label>
                  <input
                    className="cart__field-input"
                    type="text" name="name"
                    value={form.name} onChange={handleChange}
                    placeholder={s.ph_name} autoComplete="name"
                    maxLength={100}
                  />
                </div>
                <div className="cart__field">
                  <label className="cart__field-label">{s.f_address}</label>
                  <input
                    className="cart__field-input"
                    type="text" name="address"
                    value={form.address} onChange={handleChange}
                    placeholder={s.ph_addr} autoComplete="street-address"
                    maxLength={200}
                  />
                </div>
                <div className="cart__field">
                  <label className="cart__field-label">{s.f_city}</label>
                  <input
                    className="cart__field-input"
                    type="text" name="city"
                    value={form.city} onChange={handleChange}
                    placeholder={s.ph_city} autoComplete="address-level2"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            {/* Hint when form incomplete */}
            {!formFilled && (
              <p className="cart__form-hint cart__form-hint--warn">
                ⚠️ {lang==='ar' ? 'يرجى ملء الاسم والعنوان والمدينة أولاً' : lang==='fr' ? 'Veuillez remplir tous les champs de livraison' : 'Please fill all delivery fields to continue'}
              </p>
            )}

            <button
              className={`btn btn-whatsapp cart__whatsapp-btn ${submitted ? 'submitted' : ''} ${!formFilled ? 'cart__whatsapp-btn--disabled' : ''}`}
              onClick={buildWhatsAppMsg}
              disabled={!formFilled}
              title={!formFilled ? (lang==='ar' ? 'يرجى ملء جميع بيانات التوصيل' : lang==='fr' ? 'Veuillez remplir tous les champs' : 'Please fill in all delivery fields') : ''}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              {submitted ? s.f_sent : s.order_wa}
            </button>
            <p className="cart__summary-note">{s.wa_note}</p>
            <Link to="/shop" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {s.continue}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
