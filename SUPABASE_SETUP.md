# Maktabat Rahma — Firebase → Supabase Migration Guide

## What changed

| Layer | Firebase (old) | Supabase (new) |
|---|---|---|
| Database | Firestore (NoSQL) | PostgreSQL (SQL) |
| Auth | Firebase Auth | Supabase Auth |
| Storage | Firebase Storage | Supabase Storage |
| Realtime | `onSnapshot` | Postgres CDC channels |
| Config | `src/firebase.js` | `src/supabase.js` |
| Offline cache | `enableIndexedDbPersistence` | Built-in via `@supabase/supabase-js` |

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to Morocco (e.g. EU West)
3. Set a strong database password — save it somewhere safe
4. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the SQL schema

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase-schema.sql`
3. Click **Run** (green button)

This creates:
- `public.books` table with all columns
- Row Level Security (RLS) policies
- `book-covers` storage bucket
- Realtime enabled on the books table

---

## Step 3 — Create your admin user

1. Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Enter your admin email and a strong password
3. Make sure Email Confirmations are **disabled** (or confirm the email)

> The admin email must match `VITE_ADMIN_EMAIL` in your `.env`

---

## Step 4 — Enable Email provider

1. Supabase Dashboard → **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Optionally enable **Google** (see Step 4b)

### Step 4b — Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
4. In Supabase → Authentication → Providers → Google → paste Client ID & Secret
5. The `loginWithGoogle()` function in `AuthContext.jsx` is already wired up

---

## Step 5 — Configure environment variables

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_EMAIL=your-admin@email.com
VITE_WHATSAPP_NUMBER=212600000000
```

Find your URL and anon key in:
**Supabase Dashboard → Project Settings → API**

---

## Step 6 — Install dependencies and run

```bash
npm install
npm run dev
```

---

## Step 7 — Deploy (Firebase Hosting → any static host)

Since you're leaving Firebase, you can deploy to:

**Vercel (recommended):**
```bash
npm install -g vercel
vercel
# Set env vars in Vercel dashboard → Settings → Environment Variables
```

**Netlify:**
```bash
npm run build
# Drag & drop the dist/ folder to netlify.com/drop
# Set env vars in Site Settings → Environment Variables
```

**Or keep Firebase Hosting** (just the hosting, database is now Supabase):
```bash
npm run build
firebase deploy --only hosting
```

---

## Data field name changes (Firebase → Supabase)

| Firebase field | Supabase column | Note |
|---|---|---|
| `imageUrl` | `image_url` | Snake_case in PostgreSQL |
| `createdAt` (number) | `created_at` (timestamptz) | Proper timestamp |
| Document ID (string) | `id` (uuid) | Auto-generated UUID |

All components have been updated to use the new field names.

---

## Architecture overview

```
src/
├── supabase.js          ← Single client + storage helpers (replaces firebase.js)
├── contexts/
│   ├── AuthContext.jsx  ← Supabase Auth (signIn, signOut, session listener)
│   ├── BooksContext.jsx ← Supabase DB + Realtime (replaces Firestore logic)
│   ├── CartContext.jsx  ← Unchanged (pure React state)
│   └── ThemeContext.jsx ← Unchanged
├── hooks/
│   └── useBooks.js      ← Re-exports from BooksContext (unchanged API)
└── pages/
    └── Admin.jsx        ← Uses supabase.auth + BooksContext mutations
```

---

## Troubleshooting

**Books not loading:**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Make sure RLS policies are applied (run `supabase-schema.sql`)
- Check browser console for Supabase errors

**Admin can't log in:**
- Make sure the user exists in Authentication → Users
- Make sure `VITE_ADMIN_EMAIL` matches exactly (case-sensitive)

**Image upload failing:**
- Make sure the `book-covers` bucket was created (run the SQL schema)
- Check that Storage RLS policies allow authenticated uploads

**Realtime not working:**
- Make sure `ALTER PUBLICATION supabase_realtime ADD TABLE public.books` ran
- Check Supabase Dashboard → Database → Replication
