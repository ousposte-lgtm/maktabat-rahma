-- ═══════════════════════════════════════════════════════════════════════
--  MAKTABAT RAHMA — Supabase PostgreSQL Schema  v3
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. BOOKS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.books (
  id          uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text            NOT NULL,
  author      text,
  price       numeric(10, 2),
  description text,
  category    text,
  image_url   text,
  created_at  timestamptz     DEFAULT now() NOT NULL
);

-- ── 2. NEW COLUMNS (safe to run even if already exists) ───────────────
-- Multiple images support (Fix #7)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS images text[];
-- Featured toggle (Fix #8)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS books_created_at_idx  ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS books_category_idx    ON public.books (category);
CREATE INDEX IF NOT EXISTS books_is_featured_idx ON public.books (is_featured);

-- ── 3. ROW LEVEL SECURITY ─────────────────────────────────────────────
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read"    ON public.books;
DROP POLICY IF EXISTS "Admin insert"   ON public.books;
DROP POLICY IF EXISTS "Admin update"   ON public.books;
DROP POLICY IF EXISTS "Admin delete"   ON public.books;

CREATE POLICY "Public read"   ON public.books FOR SELECT  USING (true);
CREATE POLICY "Admin insert"  ON public.books FOR INSERT  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update"  ON public.books FOR UPDATE  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete"  ON public.books FOR DELETE  USING (auth.role() = 'authenticated');

-- ── 4. STORAGE BUCKET ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers', 'book-covers', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public image read"   ON storage.objects;
DROP POLICY IF EXISTS "Admin image upload"  ON storage.objects;
DROP POLICY IF EXISTS "Admin image update"  ON storage.objects;
DROP POLICY IF EXISTS "Admin image delete"  ON storage.objects;

CREATE POLICY "Public image read"  ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Admin image upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Admin image update" ON storage.objects FOR UPDATE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Admin image delete" ON storage.objects FOR DELETE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

-- ── 5. REALTIME ───────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;

-- ══════════════════════════════════════════════════════════════════════
--  DONE ✅  (v3 adds: images text[], is_featured boolean)
-- ══════════════════════════════════════════════════════════════════════
