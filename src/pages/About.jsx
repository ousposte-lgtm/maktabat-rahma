// src/pages/About.jsx — fully translated
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/translations';
import './About.css';

export default function About() {
  const { lang } = useTheme();
  const tx = t[lang];

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
    { n:'1', title: lang==='ar'?'تصفح':lang==='fr'?'Parcourir':'Browse',  desc: lang==='ar'?'استكشف مجموعتنا المختارة':lang==='fr'?'Explorez notre collection':' Explore our curated collection' },
    { n:'2', title: lang==='ar'?'أضف':lang==='fr'?'Ajouter':'Add',        desc: lang==='ar'?'أضف كتبك إلى السلة':lang==='fr'?'Ajoutez vos livres au panier':'Add your chosen books to the cart' },
    { n:'3', title: lang==='ar'?'اطلب':lang==='fr'?'Commander':'Order',   desc: lang==='ar'?'اضغط "طلب واتساب" لإرسال طلبك':lang==='fr'?'Commandez via WhatsApp':'Tap Order via WhatsApp to send' },
    { n:'4', title: lang==='ar'?'استلم':lang==='fr'?'Recevoir':'Receive', desc: lang==='ar'?'نؤكد ونوصل كتبك':lang==='fr'?'Nous confirmons et livrons':'We confirm and deliver to your door' },
  ];

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
            <div className="about-visual__card">
              <span className="about-visual__ar">اقرأ بسم ربك</span>
              <span className="about-visual__verse">
                {lang==='ar' ? 'اقرأ باسم ربك' : lang==='fr' ? 'Lis au nom de ton Seigneur' : 'Read in the name of your Lord'}
              </span>
              <span className="about-visual__ref">— {lang==='ar'?'القرآن ٩٦:١':'Quran 96:1'}</span>
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
