import type { SongPlatform } from '@/types/models';

export interface ParsedSong {
  platform: SongPlatform;
  /** Normalized canonical URL. */
  url: string;
  /** A thumbnail URL when we can derive one (YouTube). */
  thumbnail: string | null;
  /** Platform-native embed URL, when available. */
  embedUrl: string | null;
}

/**
 * Detect Spotify / YouTube from a pasted URL and derive helpful bits.
 * We keep this dependency-free and forgiving of the many URL shapes.
 */
export function parseSongUrl(raw: string): ParsedSong | null {
  const url = raw.trim();
  if (!url) return null;

  // YouTube — youtu.be/<id>, watch?v=<id>, shorts/<id>, music.youtube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i) ?? null;
  if (yt?.[1]) {
    const id = yt[1];
    return {
      platform: 'youtube',
      url,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
    };
  }

  // Spotify — open.spotify.com/track|album|playlist/<id>
  const sp = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/i) ?? null;
  if (sp?.[1] && sp?.[2]) {
    const [, kind, id] = sp;
    return {
      platform: 'spotify',
      url,
      thumbnail: null, // Spotify needs oEmbed/API; we show the vinyl object instead.
      embedUrl: `https://open.spotify.com/embed/${kind}/${id}`,
    };
  }

  return null;
}
