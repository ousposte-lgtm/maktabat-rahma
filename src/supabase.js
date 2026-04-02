// src/supabase.js
// ─────────────────────────────────────────────────────────────────────
//  Single Supabase client — import this everywhere instead of firebase.js
//
//  Requires .env (copy from .env.example):
//    VITE_SUPABASE_URL
//    VITE_SUPABASE_ANON_KEY
//    VITE_ADMIN_EMAIL
//    VITE_WHATSAPP_NUMBER
// ─────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '⚠️  Supabase env vars missing.\n' +
    'Copy .env.example → .env and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.\n' +
    'Find them in: Supabase Dashboard → Project Settings → API'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,   // Admin stays logged in across page refreshes
    autoRefreshToken:   true,   // Silently refresh JWT before it expires
    detectSessionInUrl: true,   // Required for Google OAuth redirect flow
  },
  realtime: {
    params: {
      eventsPerSecond: 10,      // Rate-limit realtime events (default is fine)
    },
  },
});

// ── App-wide constants ────────────────────────────────────────────────
export const ADMIN_EMAIL     = import.meta.env.VITE_ADMIN_EMAIL     || '';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';

// ── Storage ───────────────────────────────────────────────────────────
export const COVERS_BUCKET = 'book-covers';

/**
 * Upload a cover image to Supabase Storage.
 * Returns the public URL of the uploaded file.
 *
 * Firebase equivalent:
 *   const ref = storageRef(storage, `covers/${filename}`);
 *   await uploadBytes(ref, file);
 *   const url = await getDownloadURL(ref);
 */
export async function uploadCoverImage(file) {
  // Build a unique, URL-safe filename
  const ext      = file.name.split('.').pop().toLowerCase();
  const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(COVERS_BUCKET)
    .upload(filename, file, {
      upsert:      false,
      contentType: file.type,
      cacheControl: '3600',  // 1-hour browser cache for images
    });

  if (uploadError) throw uploadError;

  // The bucket is public so we can get a stable public URL (no signed URL needed)
  const { data } = supabase.storage
    .from(COVERS_BUCKET)
    .getPublicUrl(filename);

  return data.publicUrl;
}

/**
 * Delete a cover image from Supabase Storage by its public URL.
 * Safe to call with null/undefined — silently returns.
 *
 * Firebase equivalent:
 *   await deleteObject(storageRef(storage, path));
 */
export async function deleteCoverImage(publicUrl) {
  if (!publicUrl) return;
  try {
    // Extract the storage path from the full public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/book-covers/<path>
    const marker = `/object/public/${COVERS_BUCKET}/`;
    const idx    = publicUrl.indexOf(marker);
    if (idx === -1) return;   // not one of our storage URLs — skip

    const path = publicUrl.slice(idx + marker.length);
    await supabase.storage.from(COVERS_BUCKET).remove([path]);
  } catch {
    // Non-critical: if image cleanup fails the book record is still deleted.
    // Log silently so the admin flow isn't interrupted.
  }
}
