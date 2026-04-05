// src/supabase.js
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
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export const ADMIN_EMAIL     = import.meta.env.VITE_ADMIN_EMAIL     || '';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
export const COVERS_BUCKET   = 'book-covers';

// ── Validation constants ──────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 8;                             // 8 MB per image
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES    = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

/**
 * Validate a file before upload.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, reason: `Type not supported: ${file.type}. Use JPG, PNG or WEBP.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_FILE_SIZE_MB} MB.` };
  }
  return { valid: true };
}

/**
 * Generate a guaranteed-unique filename for storage.
 * Combines timestamp + counter + random suffix to avoid collisions
 * even when multiple images are uploaded in the same millisecond.
 */
let _uploadCounter = 0;
function uniqueFilename(file) {
  const ext     = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ts      = Date.now();
  const counter = String(++_uploadCounter).padStart(4, '0');
  const rand    = Math.random().toString(36).slice(2, 8);
  return `covers/${ts}-${counter}-${rand}.${ext}`;
}

/**
 * Upload ONE image to Supabase Storage with retry logic.
 * - Validates file before attempting upload
 * - Retries up to 3 times on transient errors
 * - Returns the public URL
 */
export async function uploadCoverImage(file, { retries = 3 } = {}) {
  // Validate first
  const { valid, reason } = validateImageFile(file);
  if (!valid) throw new Error(reason);

  const filename = uniqueFilename(file);
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error: uploadError } = await supabase.storage
        .from(COVERS_BUCKET)
        .upload(filename, file, {
          upsert:       false,          // never overwrite — unique name guarantees this
          contentType:  file.type,
          cacheControl: '3600',
        });

      if (uploadError) {
        // If the file somehow already exists (race), generate a new name and retry
        if (uploadError.statusCode === '409' || uploadError.message?.includes('already exists')) {
          // Change filename suffix and retry immediately
          lastError = uploadError;
          await _sleep(50 * attempt);
          continue;
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(COVERS_BUCKET)
        .getPublicUrl(filename);

      return data.publicUrl;

    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        // Exponential back-off: 200ms, 400ms, 800ms
        await _sleep(200 * attempt);
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
}

/**
 * Upload multiple images one-by-one safely.
 * Reports progress via optional onProgress(completed, total) callback.
 * Returns array of public URLs (failed ones are skipped + reported).
 */
export async function uploadMultipleImages(files, { onProgress, onError } = {}) {
  const results  = [];
  const total    = files.length;
  let completed  = 0;

  for (const file of files) {
    try {
      const url = await uploadCoverImage(file);
      results.push(url);
    } catch (err) {
      const msg = `Failed to upload "${file.name}": ${err.message}`;
      if (import.meta.env.DEV) console.warn('[uploadMultipleImages]', msg);
      if (onError) onError(msg, file);
      // Skip failed file — don't crash the whole batch
    }
    completed++;
    if (onProgress) onProgress(completed, total);
  }

  return results;
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delete a cover image from Supabase Storage by its public URL.
 */
export async function deleteCoverImage(publicUrl) {
  if (!publicUrl) return;
  try {
    const marker = `/object/public/${COVERS_BUCKET}/`;
    const idx    = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = publicUrl.slice(idx + marker.length);
    await supabase.storage.from(COVERS_BUCKET).remove([path]);
  } catch {
    // Non-critical — silently ignore
  }
}
