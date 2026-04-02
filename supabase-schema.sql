-- ═══════════════════════════════════════════════════════════════════════
--  MAKTABAT RAHMA — Supabase PostgreSQL Schema  v2
--
--  Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
--  Then click RUN (▶).
--
--  What this creates:
--    1. books table with all columns
--    2. Row Level Security (RLS) policies — public read, admin write
--    3. book-covers storage bucket for cover images
--    4. Realtime enabled on the books table
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1. BOOKS TABLE ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.books (
  id          uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text            NOT NULL,
  author      text,
  price       numeric(10, 2),            -- NULL means the book is free
  description text,
  category    text,
  image_url   text,
  created_at  timestamptz     DEFAULT now() NOT NULL
);

-- Fast queries: ordering by newest + filtering by category
CREATE INDEX IF NOT EXISTS books_created_at_idx ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS books_category_idx   ON public.books (category);


-- ── 2. ROW LEVEL SECURITY ─────────────────────────────────────────────

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running this script
DROP POLICY IF EXISTS "Public read"    ON public.books;
DROP POLICY IF EXISTS "Admin insert"   ON public.books;
DROP POLICY IF EXISTS "Admin update"   ON public.books;
DROP POLICY IF EXISTS "Admin delete"   ON public.books;

-- ANYONE can read books (public storefront)
CREATE POLICY "Public read" ON public.books
  FOR SELECT USING (true);

-- Only authenticated users can write
-- The app further restricts this to the admin email in JS, but
-- RLS adds a database-level guarantee that anonymous users can't mutate.
CREATE POLICY "Admin insert" ON public.books
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update" ON public.books
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete" ON public.books
  FOR DELETE USING (auth.role() = 'authenticated');


-- ── 3. STORAGE BUCKET ─────────────────────────────────────────────────

-- Create a public bucket for book cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,                                     -- public: images accessible without auth
  5242880,                                  -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if re-running
DROP POLICY IF EXISTS "Public image read"   ON storage.objects;
DROP POLICY IF EXISTS "Admin image upload"  ON storage.objects;
DROP POLICY IF EXISTS "Admin image update"  ON storage.objects;
DROP POLICY IF EXISTS "Admin image delete"  ON storage.objects;

-- Anyone can view images (bucket is public)
CREATE POLICY "Public image read" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

-- Authenticated users can upload
CREATE POLICY "Admin image upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-covers'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can overwrite
CREATE POLICY "Admin image update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'book-covers'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete
CREATE POLICY "Admin image delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'book-covers'
    AND auth.role() = 'authenticated'
  );


-- ── 4. REALTIME ───────────────────────────────────────────────────────

-- Enable Postgres CDC so the frontend receives live updates
-- without polling. Equivalent to Firestore's onSnapshot.
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;


-- ══════════════════════════════════════════════════════════════════════
--  DONE ✅
--
--  Next steps:
--    1. Authentication → Providers → ensure Email is enabled
--    2. Authentication → Users → Add User  (your admin account)
--    3. Fill in .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
--       VITE_ADMIN_EMAIL, VITE_WHATSAPP_NUMBER
--    4. npm install && npm run dev
--    5. (Optional) npm run seed  — to insert sample books
-- ══════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════
--  MIGRATION v2 — Run these AFTER the initial schema
--  Adds: featured flag + multiple images array
-- ═══════════════════════════════════════════════════════════════════════

-- Fix 8: Featured product toggle
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS books_featured_idx ON public.books (is_featured) WHERE is_featured = true;

-- Fix 7: Multiple images per product (stored as array of URLs)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}' NOT NULL;
