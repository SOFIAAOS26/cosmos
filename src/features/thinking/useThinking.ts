import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { Thought } from '@/types/database';
import { sendThought, recentThoughts } from './api';
import { findSincronias, sincroniaStreak, SINCRONIA_WINDOW_MS } from './sincronia';

interface ThinkingOpts {
  /** Fires when the partner sends a thought (their pulse arrives live). */
  onPartnerThought?: () => void;
  /** Fires once when a fresh sincronía (both within 30 min) just happened. */
  onSincronia?: () => void;
}

export interface Thinking {
  send: () => Promise<void>;
  sending: boolean;
  /** Total sincronía moments on record. */
  count: number;
  /** Consecutive-day streak of sincronías. */
  streak: number;
}

/**
 * "Pensando en ti" (§Hito8-B): send a pulse, receive the partner's live, and
 * detect a sincronía when both land within 30 minutes — all derived from the
 * immutable `thoughts` rows. The sincronía check runs both when I send and when
 * the partner's pulse arrives, so the shooting star fires on both screens.
 */
export function useThinking(opts: ThinkingOpts = {}): Thinking {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [sending, setSending] = useState(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  // Last sincronía timestamp we already reacted to — so history on load and
  // repeat renders never re-fire the animation.
  const lastFiredRef = useRef(0);

  useEffect(() => {
    if (!cosmos) return;
    let live = true;
    recentThoughts(cosmos.id)
      .then((rows) => {
        if (!live) return;
        setThoughts(rows);
        const moments = findSincronias(rows);
        lastFiredRef.current = moments.length ? Math.max(...moments) : Date.now();
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [cosmos?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const maybeFireSincronia = useCallback((list: Thought[]) => {
    const moments = findSincronias(list);
    if (moments.length === 0) return;
    const latest = Math.max(...moments);
    if (latest > lastFiredRef.current && Date.now() - latest <= SINCRONIA_WINDOW_MS) {
      lastFiredRef.current = latest;
      optsRef.current.onSincronia?.();
    }
  }, []);

  useRealtimeTable('thoughts', cosmos?.id, (payload) => {
    if (payload.eventType !== 'INSERT') return;
    const row = payload.new as Thought;
    setThoughts((prev) => {
      if (prev.some((x) => x.id === row.id)) return prev;
      const next = [row, ...prev];
      if (row.author_id !== user?.id) optsRef.current.onPartnerThought?.();
      maybeFireSincronia(next);
      return next;
    });
  });

  const send = useCallback(async () => {
    if (!cosmos || !user || sending) return;
    setSending(true);
    try {
      const row = await sendThought(cosmos.id, user.id);
      setThoughts((prev) => {
        if (prev.some((x) => x.id === row.id)) return prev;
        const next = [row, ...prev];
        maybeFireSincronia(next);
        return next;
      });
    } catch {
      // swallow — a missed pulse is not worth an error toast
    } finally {
      setSending(false);
    }
  }, [cosmos?.id, user?.id, sending, maybeFireSincronia]); // eslint-disable-line react-hooks/exhaustive-deps

  const sincronias = useMemo(() => findSincronias(thoughts), [thoughts]);
  const streak = useMemo(() => sincroniaStreak(sincronias), [sincronias]);

  return { send, sending, count: sincronias.length, streak };
}
