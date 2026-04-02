# مكتبة رحمة — Maktabat Rahma

> Premium Arabic bookstore · React + Vite + Supabase

## Tech Stack

- **Frontend**: React 18, Vite 5, React Router 6
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (email/password + optional Google OAuth)
- **Storage**: Supabase Storage (cover images)
- **Realtime**: Supabase Postgres CDC

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase project URL + anon key

# 3. Set up database
# Paste supabase-schema.sql into Supabase SQL Editor → Run

# 4. Create admin user
# Supabase Dashboard → Authentication → Users → Add User

# 5. (Optional) Seed sample books
npm run seed

# 6. Start development server
npm run dev
```

## Full Setup Guide

See **SUPABASE_SETUP.md** for step-by-step instructions including:
- Supabase project creation
- Google OAuth setup
- Deployment options (Vercel, Netlify, Firebase Hosting)

## Project Structure

```
src/
├── supabase.js              # Supabase client + storage helpers
├── App.jsx                  # Router + context providers
├── contexts/
│   ├── AuthContext.jsx      # Supabase Auth (login, logout, session)
│   ├── BooksContext.jsx     # Database queries + realtime subscription
│   ├── CartContext.jsx      # Cart state (pure React)
│   └── ThemeContext.jsx     # Dark/light mode + i18n language
├── hooks/
│   └── useBooks.js          # Re-exports useBooks from BooksContext
├── components/
│   ├── Navbar.jsx / .css
│   ├── Footer.jsx / .css
│   └── BookCard.jsx / .css
├── pages/
│   ├── Home.jsx / .css
│   ├── Shop.jsx / .css
│   ├── BookDetail.jsx / .css
│   ├── Cart.jsx / .css
│   ├── About.jsx / .css
│   └── Admin.jsx / .css     # Admin dashboard (protected)
├── i18n/
│   └── translations.js      # EN / AR / FR translations
└── styles/
    └── global.css           # Design system tokens + global styles
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your project URL from Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your anon/public key (safe to expose in frontend) |
| `VITE_ADMIN_EMAIL` | Email of the admin account |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for orders (international format, no +) |

## Admin Dashboard

Visit `/admin` to access the dashboard. You must sign in with the email matching `VITE_ADMIN_EMAIL`.

Features:
- Add / edit / delete books
- Upload cover images to Supabase Storage
- Search and filter books
- Real-time updates via Supabase Postgres CDC
