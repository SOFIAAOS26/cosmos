import { useEffect, useMemo, useState } from 'react';
import { signPaths } from './storage';

/**
 * Resolve a set of private storage paths to signed URLs.
 * Stable across renders for the same set of paths.
 */
export function useSignedUrls(paths: (string | null | undefined)[]): Record<string, string> {
  const key = useMemo(() => paths.filter(Boolean).join('|'), [paths]);
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const list = key ? key.split('|') : [];
    if (list.length === 0) {
      setMap({});
      return;
    }
    void signPaths(list).then((res) => {
      if (active) setMap(res);
    });
    return () => {
      active = false;
    };
  }, [key]);

  return map;
}

/** Convenience for a single path. */
export function useSignedUrl(path: string | null | undefined): string | null {
  const map = useSignedUrls([path]);
  return path ? map[path] ?? null : null;
}
