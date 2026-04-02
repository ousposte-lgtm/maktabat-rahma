// src/pages/About.jsx
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  return (
    <div className="page about">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="container about-hero__inner">
          <p className="section-eyebrow fade-up">Our Story</p>
          <h1 className="section-title fade-up" style={{animationDelay:'80ms'}}>
            About <em>Maktabat Rahma</em>
          </h1>
          <div className="about-hero__arabic fade-up" style={{animationDelay:'160ms'}}>
            <span>مكتبة رحمة</span>
            <span className="about-hero__arabic-sub">Library of Mercy</span>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container about-section">
        <div className="about-grid">
          <div className="about-text fade-up">
            <p className="section-eyebrow">Our Mission</p>
            <h2 className="about-section-title">Knowledge is the light that guides every journey</h2>
            <p>Maktabat Rahma was founded with a simple but profound vision: to make quality books accessible to every reader, in every language, on every subject that enriches the human spirit.</p>
            <p>We curate our collection with care — from timeless Islamic scholarship and Arabic classics to contemporary world literature, science, history, and philosophy.</p>
          </div>
          <div className="about-visual">
            <div className="about-visual__card">
              <span className="about-visual__ar">اقرأ بسم ربك</span>
              <span className="about-visual__verse">Read in the name of your Lord</span>
              <span className="about-visual__ref">— Quran 96:1</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats-section">
        <div className="container about-stats">
          {[
            { n: '500+', l: 'Books Available' },
            { n: '8+',   l: 'Categories'      },
            { n: '📦',   l: 'Fast Delivery'   },
            { n: '💬',   l: 'WhatsApp Orders' },
          ].map(s => (
            <div key={s.l} className="about-stat">
              <span className="about-stat__n">{s.n}</span>
              <span className="about-stat__l">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container about-section">
        <p className="section-eyebrow" style={{textAlign:'center'}}>What We Offer</p>
        <h2 className="section-title" style={{textAlign:'center',marginBottom:40}}>Our <em>Categories</em></h2>
        <div className="about-cats">
          {[
            { icon:'📖', name:'Islamic',     desc:'Quran, Hadith, Fiqh, Seerah'     },
            { icon:'📚', name:'Fiction',     desc:'Novels, short stories, literature'},
            { icon:'🏛', name:'History',     desc:'World & Islamic history'          },
            { icon:'🔬', name:'Science',     desc:'Biology, physics, technology'     },
            { icon:'🧠', name:'Philosophy',  desc:'Logic, ethics, critical thinking' },
            { icon:'🌸', name:'Poetry',      desc:'Classical & modern poetry'        },
            { icon:'👶', name:'Children',    desc:'Educational books for kids'       },
            { icon:'📊', name:'Non-Fiction', desc:'Biographies, self-help, business' },
          ].map(c => (
            <Link to={`/shop?cat=${c.name}`} key={c.name} className="about-cat-card">
              <span className="about-cat-card__icon">{c.icon}</span>
              <h3 className="about-cat-card__name">{c.name}</h3>
              <p className="about-cat-card__desc">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How to order */}
      <section className="about-how-section">
        <div className="container">
          <p className="section-eyebrow" style={{textAlign:'center'}}>Simple Process</p>
          <h2 className="section-title" style={{textAlign:'center',marginBottom:40}}>How to <em>Order</em></h2>
          <div className="about-steps">
            {[
              { n:'1', title:'Browse',  desc:'Explore our curated collection of books'              },
              { n:'2', title:'Add',     desc:'Add your chosen books to the cart'                    },
              { n:'3', title:'Order',   desc:'Tap "Order via WhatsApp" to send your selection'      },
              { n:'4', title:'Receive', desc:'We confirm and deliver your books to your door'       },
            ].map(s => (
              <div key={s.n} className="about-step">
                <div className="about-step__num">{s.n}</div>
                <h3 className="about-step__title">{s.title}</h3>
                <p className="about-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container about-cta">
        <div className="about-cta__inner">
          <h2>Ready to explore?</h2>
          <p>Browse our full collection and find your next favourite book.</p>
          <Link to="/shop" className="btn btn-primary" style={{fontSize:'1rem',padding:'14px 32px'}}>
            Visit the Shop →
          </Link>
        </div>
      </section>
    </div>
  );
}
