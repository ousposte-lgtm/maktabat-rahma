// src/pages/About.jsx — With store image + order form (name, address, city)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './About.css';

export default function About() {
  const { lang } = useTheme();
  const tx = t[lang];

  // Form state
  const [form, setForm] = useState({ name: '', address: '', city: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) return;
    const msg =
      `📦 *طلب توصيل — مكتبة رحمة*\n\n` +
      `👤 الاسم: ${form.name}\n` +
      `🏠 العنوان: ${form.address}\n` +
      `🏙️ المدينة: ${form.city}\n\n` +
      `أرجو تأكيد الطلب. شكراً! 🙏`;
    window.open(`https://wa.me/message/AUV2I33UDGMRM1?text=${encodeURIComponent(msg)}`, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const STATS = [
    { n: '500+', l: tx.books_label },
    { n: '8+',   l: tx.categories_label },
    { n: '📦',   l: tx.fast_delivery },
    { n: '💬',   l: 'WhatsApp' },
  ];

  const CATS = [
    { icon:'📖', name:'Islamic',     desc: lang === 'ar' ? 'القرآن، الحديث، الفقه، السيرة' : lang === 'fr' ? 'Coran, Hadith, Fiqh, Seerah' : 'Quran, Hadith, Fiqh, Seerah' },
    { icon:'📚', name:'Fiction',     desc: lang === 'ar' ? 'روايات وقصص أدبية' : lang === 'fr' ? 'Romans, nouvelles, littérature' : 'Novels, short stories, literature' },
    { icon:'🏛', name:'History',     desc: lang === 'ar' ? 'التاريخ الإسلامي والعالمي' : lang === 'fr' ? 'Histoire mondiale & islamique' : 'World & Islamic history' },
    { icon:'🔬', name:'Science',     desc: lang === 'ar' ? 'العلوم والتكنولوجيا' : lang === 'fr' ? 'Biologie, physique, technologie' : 'Biology, physics, technology' },
    { icon:'🧠', name:'Philosophy',  desc: lang === 'ar' ? 'المنطق والأخلاق والتفكير' : lang === 'fr' ? 'Logique, éthique, pensée critique' : 'Logic, ethics, critical thinking' },
    { icon:'🌸', name:'Poetry',      desc: lang === 'ar' ? 'الشعر الكلاسيكي والحديث' : lang === 'fr' ? 'Poésie classique & moderne' : 'Classical & modern poetry' },
    { icon:'👶', name:'Children',    desc: lang === 'ar' ? 'كتب تعليمية للأطفال' : lang === 'fr' ? 'Livres éducatifs pour enfants' : 'Educational books for kids' },
    { icon:'📊', name:'Non-Fiction', desc: lang === 'ar' ? 'سير ذاتية وتنمية' : lang === 'fr' ? 'Biographies, développement personnel' : 'Biographies, self-help, business' },
  ];

  const STEPS = [
    { n:'1', title: lang==='ar'?'تصفح':lang==='fr'?'Parcourir':'Browse',  desc: lang==='ar'?'استكشف مجموعتنا المختارة':lang==='fr'?'Explorez notre collection':'Explore our curated collection' },
    { n:'2', title: lang==='ar'?'أضف':lang==='fr'?'Ajouter':'Add',        desc: lang==='ar'?'أضف كتبك إلى السلة':lang==='fr'?'Ajoutez vos livres au panier':'Add your chosen books to the cart' },
    { n:'3', title: lang==='ar'?'اطلب':lang==='fr'?'Commander':'Order',   desc: lang==='ar'?'اضغط "طلب واتساب" لإرسال طلبك':lang==='fr'?'Commandez via WhatsApp':'Tap Order via WhatsApp to send' },
    { n:'4', title: lang==='ar'?'استلم':lang==='fr'?'Recevoir':'Receive', desc: lang==='ar'?'نؤكد ونوصل كتبك':lang==='fr'?'Nous confirmons et livrons':'We confirm and deliver to your door' },
  ];

  const formLabels = {
    title:    lang==='ar' ? 'بيانات التوصيل'  : lang==='fr' ? 'Informations de livraison' : 'Delivery Information',
    subtitle: lang==='ar' ? 'أدخل بياناتك وسنتواصل معك عبر واتساب لتأكيد الطلب' : lang==='fr' ? 'Entrez vos coordonnées — nous vous contacterons via WhatsApp' : 'Enter your details and we will contact you via WhatsApp',
    name:     lang==='ar' ? 'الاسم الكامل'   : lang==='fr' ? 'Nom complet'     : 'Full Name',
    address:  lang==='ar' ? 'العنوان'         : lang==='fr' ? 'Adresse'         : 'Address',
    city:     lang==='ar' ? 'المدينة'         : lang==='fr' ? 'Ville'           : 'City',
    send:     lang==='ar' ? 'إرسال عبر واتساب' : lang==='fr' ? 'Envoyer via WhatsApp' : 'Send via WhatsApp',
    sent:     lang==='ar' ? 'تم الإرسال ✓'   : lang==='fr' ? 'Envoyé ✓'       : 'Sent ✓',
    ph_name:  lang==='ar' ? 'مثال: محمد الأمين' : lang==='fr' ? 'Ex: Mohammed Amine' : 'e.g. Mohammed Amine',
    ph_addr:  lang==='ar' ? 'الحي، الشارع...' : lang==='fr' ? 'Quartier, rue...' : 'Neighbourhood, street...',
    ph_city:  lang==='ar' ? 'أكادير، الدار البيضاء...' : lang==='fr' ? 'Agadir, Casablanca...' : 'Agadir, Casablanca...',
  };

  return (
    <div className="page about">
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="container about-hero__inner">
          <p className="section-eyebrow fade-up">{tx.our_story}</p>
          <h1 className="section-title fade-up" style={{animationDelay:'80ms'}}>
            {tx.about_title} <em>{tx.about_title_em}</em>
          </h1>
          <div className="about-hero__arabic fade-up" style={{animationDelay:'160ms'}}>
            <span>مكتبة رحمة</span>
            <span className="about-hero__arabic-sub">
              {lang==='ar' ? 'مكتبة الرحمة' : lang==='fr' ? 'Bibliothèque de la Miséricorde' : 'Library of Mercy'}
            </span>
          </div>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-grid">
          <div className="about-text fade-up">
            <p className="section-eyebrow">{tx.our_mission}</p>
            <h2 className="about-section-title">{tx.mission_title}</h2>
            <p>{tx.mission_p1}</p>
            <p>{tx.mission_p2}</p>
          </div>
          <div className="about-visual">
            {/* Store image — styled with rounded + shadow */}
            <div className="about-store-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80"
                alt="مكتبة رحمة"
                className="about-store-img"
                onError={e => {
                  e.target.parentNode.innerHTML = `<div class="about-visual__card"><span class="about-visual__ar">اقرأ بسم ربك</span><span class="about-visual__verse">${lang==='ar' ? 'اقرأ باسم ربك' : lang==='fr' ? 'Lis au nom de ton Seigneur' : 'Read in the name of your Lord'}</span><span class="about-visual__ref">— ${lang==='ar'?'القرآن ٩٦:١':'Quran 96:1'}</span></div>`;
                }}
              />
              <div className="about-store-img-badge">
                <span>مكتبة رحمة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-stats-section">
        <div className="container about-stats">
          {STATS.map(s => (
            <div key={s.l} className="about-stat">
              <span className="about-stat__n">{s.n}</span>
              <span className="about-stat__l">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container about-section">
        <p className="section-eyebrow" style={{textAlign:'center'}}>
          {lang==='ar'?'ما نقدمه':lang==='fr'?'Ce que nous offrons':'What We Offer'}
        </p>
        <h2 className="section-title" style={{textAlign:'center',marginBottom:40}}>
          {lang==='ar'?'تصنيفاتنا':lang==='fr'?'Nos':' Our'} <em>{lang==='ar'?'':lang==='fr'?'Catégories':'Categories'}</em>
        </h2>
        <div className="about-cats">
          {CATS.map(c => (
            <Link to={`/shop?cat=${c.name}`} key={c.name} className="about-cat-card">
              <span className="about-cat-card__icon">{c.icon}</span>
              <h3 className="about-cat-card__name">{c.name}</h3>
              <p className="about-cat-card__desc">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-how-section">
        <div className="container">
          <p className="section-eyebrow" style={{textAlign:'center'}}>
            {lang==='ar'?'عملية بسيطة':lang==='fr'?'Processus Simple':'Simple Process'}
          </p>
          <h2 className="section-title" style={{textAlign:'center',marginBottom:40}}>
            {lang==='ar'?'كيف':lang==='fr'?'Comment':'How to'} <em>{lang==='ar'?'تطلب':lang==='fr'?'Commander':'Order'}</em>
          </h2>
          <div className="about-steps">
            {STEPS.map(s => (
              <div key={s.n} className="about-step">
                <div className="about-step__num">{s.n}</div>
                <h3 className="about-step__title">{s.title}</h3>
                <p className="about-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery Form ── */}
      <section className="container about-section">
        <div className="about-form-wrap fade-up">
          <div className="about-form-header">
            <span className="about-form-icon">📦</span>
            <div>
              <h2 className="about-form-title">{formLabels.title}</h2>
              <p className="about-form-subtitle">{formLabels.subtitle}</p>
            </div>
          </div>
          <div className="about-form">
            <div className="about-form__field">
              <label className="about-form__label">{formLabels.name}</label>
              <input
                className="about-form__input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={formLabels.ph_name}
                autoComplete="name"
              />
            </div>
            <div className="about-form__field">
              <label className="about-form__label">{formLabels.address}</label>
              <input
                className="about-form__input"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={formLabels.ph_addr}
                autoComplete="street-address"
              />
            </div>
            <div className="about-form__field">
              <label className="about-form__label">{formLabels.city}</label>
              <input
                className="about-form__input"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder={formLabels.ph_city}
                autoComplete="address-level2"
              />
            </div>
            <button
              className={`about-form__submit ${submitted ? 'submitted' : ''}`}
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.address.trim() || !form.city.trim()}
            >
              {submitted ? formLabels.sent : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {formLabels.send}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="container about-cta">
        <div className="about-cta__inner">
          <h2>{lang==='ar'?'مستعد للاستكشاف؟':lang==='fr'?'Prêt à explorer?':'Ready to explore?'}</h2>
          <p>{lang==='ar'?'تصفح مجموعتنا وابحث عن كتابك القادم':lang==='fr'?'Parcourez notre collection complète':'Browse our full collection and find your next favourite book.'}</p>
          <Link to="/shop" className="btn btn-primary" style={{fontSize:'1rem',padding:'14px 32px'}}>
            {lang==='ar'?'زيارة المتجر ←':lang==='fr'?'Visiter la boutique →':'Visit the Shop →'}
          </Link>
        </div>
      </section>
    </div>
  );
}
