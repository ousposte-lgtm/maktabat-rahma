-- ═══════════════════════════════════════════════════════════════════════════
--  Maktabat Rahma — Supabase Row Level Security (RLS) Policies
--  Run this in: Supabase Dashboard → SQL Editor
--
--  REQUIRED: Enable RLS on books table first (done below).
--  These policies ensure:
--    • Anyone can READ books (public storefront)
--    • Only authenticated admin can INSERT / UPDATE / DELETE
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable RLS on the books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access (storefront)
DROP POLICY IF EXISTS "books_public_select" ON books;
CREATE POLICY "books_public_select"
  ON books FOR SELECT
  USING (true);

-- 3. Allow INSERT only for authenticated admin user
DROP POLICY IF EXISTS "books_admin_insert" ON books;
CREATE POLICY "books_admin_insert"
  ON books FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.email() = current_setting('app.admin_email', true)
  );

-- 4. Allow UPDATE only for authenticated admin user
DROP POLICY IF EXISTS "books_admin_update" ON books;
CREATE POLICY "books_admin_update"
  ON books FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND auth.email() = current_setting('app.admin_email', true)
  );

-- 5. Allow DELETE only for authenticated admin user
DROP POLICY IF EXISTS "books_admin_delete" ON books;
CREATE POLICY "books_admin_delete"
  ON books FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND auth.email() = current_setting('app.admin_email', true)
  );

-- ═══════════════════════════════════════════════════════════════════════
--  Storage bucket policies (book-covers)
--  Run separately if you want to lock down the storage bucket too.
-- ═══════════════════════════════════════════════════════════════════════

-- Allow public to read/view cover images
DROP POLICY IF EXISTS "covers_public_read" ON storage.objects;
CREATE POLICY "covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Allow authenticated admin to upload covers
DROP POLICY IF EXISTS "covers_admin_insert" ON storage.objects;
CREATE POLICY "covers_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-covers'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated admin to delete covers
DROP POLICY IF EXISTS "covers_admin_delete" ON storage.objects;
CREATE POLICY "covers_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-covers'
    AND auth.role() = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════════════
--  NOTE: After running this, set the app.admin_email setting in Supabase:
--  Dashboard → Settings → Database → Configuration → Custom settings
--  Key: app.admin_email   Value: your-admin@email.com
-- ═══════════════════════════════════════════════════════════════════════
