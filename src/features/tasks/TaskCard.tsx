import { motion } from 'framer-motion';
import { Check, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import { identityOf } from '@/theme/identity';
import { CHECKIN_MOODS } from '@/types/models';
import type { MemberWithProfile } from '@/providers/CosmosProvider';
import type { Task, TaskSupport, TaskReaction, TaskCheckin } from '@/types/database';

interface TaskCardProps {
  task: Task;
  author: MemberWithProfile | null;
  support: TaskSupport[];
  reactions: TaskReaction[];
  checkin?: TaskCheckin;
  currentUserId: string;
  onOpen: () => void;
  onToggle: () => void;
  onSupport?: () => void;
}

const PRIORITY_TONE = { normal: 'neutral', important: 'blossom', high: 'high' } as const;
const PRIORITY_LABEL = { normal: '', important: 'Importante', high: 'Alta' } as const;

export function TaskCard({
  task,
  author,
  support,
  reactions,
  checkin,
  currentUserId,
  onOpen,
  onToggle,
  onSupport,
}: TaskCardProps) {
  const id = identityOf(author?.identity);
  const isMine = task.author_id === currentUserId;
  const supported = support.length > 0;
  const mood = checkin ? CHECKIN_MOODS.find((m) => m.key === checkin.mood) : null;

  return (
    <motion.div
      layout
      className={cn(
        'relative flex items-center gap-3 rounded-xl border bg-surface px-3 py-2.5 transition-shadow',
        supported ? 'border-blossom/25 shadow-blossom' : 'border-white/5',
      )}
    >
      {/* Aura when supported */}
      {supported && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 animate-aura-pulse rounded-xl"
          style={{ background: 'radial-gradient(120% 120% at 100% 0%, rgba(244,114,182,0.12), transparent 60%)' }}
        />
      )}

      {/* Complete toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.completed ? 'Marcar pendiente' : 'Completar'}
        className={cn(
          'z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
          task.completed
            ? 'border-transparent bg-aura/80 text-void'
            : 'border-white/25 text-transparent hover:border-white/50',
        )}
      >
        <Check className="h-4 w-4" />
      </button>

      {/* Body — tap opens detail */}
      <button type="button" onClick={onOpen} className="z-10 min-w-0 flex-1 text-left">
        <p className={cn('truncate text-sm', task.completed && 'text-ink-faint line-through')}>
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          <span className={id.text}>{author?.profile.display_name ?? '—'}</span>
          {task.category && <span className="text-ink-faint">· {task.category}</span>}
          {mood && <span title={mood.label}>· {mood.emoji}</span>}
          {reactions.length > 0 && (
            <span className="text-ink-faint">· {reactions.map((r) => r.emoji).join(' ')}</span>
          )}
        </div>
      </button>

      {/* Right side: priority + support */}
      <div className="z-10 flex shrink-0 items-center gap-2">
        {task.priority !== 'normal' && (
          <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
        )}
        {!isMine && !task.completed && onSupport && (
          <button
            type="button"
            onClick={onSupport}
            aria-label="Mandar apoyo"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              supported ? 'text-blossom' : 'text-ink-faint hover:text-blossom',
            )}
          >
            <Heart className={cn('h-4 w-4', supported && 'fill-blossom')} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
