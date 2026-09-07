import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import { noteUnlocked, openNote } from './api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { identityOf } from '@/theme/identity';
import type { MemberWithProfile } from '@/providers/CosmosProvider';
import type { Note } from '@/types/database';

const KIND_LABEL = { immediate: 'Nota', scheduled: 'Programada', sealed: 'Sellada' } as const;

interface NoteCardProps {
  note: Note;
  viewerId: string;
  author: MemberWithProfile | null;
  onChanged: () => void;
  onDelete?: (note: Note) => void;
}

export function NoteCard({ note, viewerId, author, onChanged, onDelete }: NoteCardProps) {
  const unlocked = noteUnlocked(note, viewerId);
  const isMine = note.author_id === viewerId;
  const id = identityOf(author?.identity);
  const [opening, setOpening] = useState(false);

  async function reveal() {
    if (opening) return;
    setOpening(true);
    // Play a short "opening" beat, then persist opened_at (§17: animation, not security).
    window.setTimeout(async () => {
      try {
        await openNote(note.id);
        onChanged();
      } finally {
        setOpening(false);
      }
    }, 650);
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4',
        note.kind === 'sealed' && !unlocked ? 'border-blossom/25' : 'border-white/5',
        'bg-surface',
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge tone={note.kind === 'sealed' ? 'blossom' : note.kind === 'scheduled' ? 'aura' : 'neutral'}>
          {KIND_LABEL[note.kind]}
        </Badge>
        <span className={cn('text-[11px]', id.text)}>
          {isMine ? 'De ti' : author?.profile.display_name ?? 'Alguien'}
        </span>
        <span className="ml-auto text-[11px] text-ink-faint">
          {format(new Date(note.created_at), "d 'de' MMM", { locale: es })}
        </span>
        {isMine && onDelete && (
          <button type="button" onClick={() => onDelete(note)} aria-label="Eliminar" className="text-ink-faint hover:text-blossom-soft">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {unlocked ? (
        <div>
          {note.title && <p className="font-display text-base text-ink">{note.title}</p>}
          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{note.body}</p>
        </div>
      ) : note.kind === 'scheduled' ? (
        <div className="flex items-center gap-2 py-2 text-sm text-ink-faint">
          <Clock className="h-4 w-4" />
          Se abre el {note.unlock_at ? format(new Date(note.unlock_at), "d 'de' MMMM, HH:mm", { locale: es }) : 'pronto'}
        </div>
      ) : (
        // sealed, for the recipient
        <button
          type="button"
          onClick={reveal}
          className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blossom/20 to-surface-elevated py-6 text-sm text-ink"
        >
          <AnimatePresence>
            {!opening ? (
              <motion.span key="sealed" exit={{ opacity: 0, scale: 1.1 }} className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blossom" /> Hay algo aquí para ti — toca para abrir
              </motion.span>
            ) : (
              <motion.span
                key="opening"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1.05 }}
                className="flex items-center gap-2 text-blossom"
              >
                <Sparkles className="h-4 w-4" /> Abriendo…
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}
    </div>
  );
}
