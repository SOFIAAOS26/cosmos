import { getSupabase } from '@/lib/supabase';

/**
 * Media storage helpers (§29, §35).
 * - Photos live in the PRIVATE `photos` bucket under `cosmos/<cosmosId>/...`.
 * - We compress on the client before upload (never trust a phone photo to be small).
 * - Reads use signed URLs (private bucket) with an in-memory cache.
 */

const PHOTO_BUCKET = 'photos';
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.82;
const SIGN_TTL = 60 * 60 * 24 * 7; // 7 days

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/** Downscale to MAX_DIM on the long side and re-encode as JPEG. */
export async function compressImage(file: File, maxDim = MAX_DIM): Promise<CompressedImage> {
  const img = await loadImage(file);
  const longest = Math.max(img.width, img.height);
  const scale = longest > maxDim ? maxDim / longest : 1;
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context for image compression');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );
  if (!blob) throw new Error('Image compression failed');
  return { blob, width, height };
}

/** Upload a photo for a cosmos; returns the storage path (not a public URL). */
export async function uploadPhoto(
  cosmosId: string,
  file: File,
): Promise<{ path: string; width: number; height: number }> {
  const supabase = getSupabase();
  const { blob, width, height } = await compressImage(file);
  const path = `cosmos/${cosmosId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return { path, width, height };
}

export async function deletePhoto(path: string): Promise<void> {
  if (!path) return;
  const supabase = getSupabase();
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

/* ------------------------------- Signed URLs ------------------------------- */

interface CacheEntry {
  url: string;
  expires: number;
}
const signCache = new Map<string, CacheEntry>();

/** Sign a batch of storage paths, using the cache where possible. */
export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const now = Date.now();
  const need: string[] = [];

  for (const p of paths) {
    if (!p) continue;
    const hit = signCache.get(p);
    if (hit && hit.expires > now + 60_000) out[p] = hit.url;
    else need.push(p);
  }

  if (need.length > 0) {
    const supabase = getSupabase();
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(need, SIGN_TTL);
    data?.forEach((entry) => {
      if (entry.signedUrl && entry.path) {
        out[entry.path] = entry.signedUrl;
        signCache.set(entry.path, { url: entry.signedUrl, expires: now + SIGN_TTL * 1000 });
      }
    });
  }
  return out;
}

export async function signPath(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const map = await signPaths([path]);
  return map[path] ?? null;
}
