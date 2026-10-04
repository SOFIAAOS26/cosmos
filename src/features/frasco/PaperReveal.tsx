import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { PaperCard } from './PaperCard';
import { paperIntentionStyle } from '@/types/models';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { MemoryPaper } from '@/types/database';

interface PaperRevealProps {
  paper: MemoryPaper | null;
  authorName?: string;
  open: boolean;
  onClose: () => void;
  onAgain?: () => void;
}

/** The focus moment: the drawn paper rises, unfolds and holds (§8, §9, §23). */
export function PaperReveal({ paper, authorName, open, onClose, onAgain }: PaperRevealProps) {
  const reduce = usePrefersReducedMotion();
  const intention = paper ? paperIntentionStyle(paper.intention) : null;
  const isAngry = paper?.intention === 'angry';

  useEffect(() => {
    if (open) navigator.vibrate?.(10);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && paper && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: isAngry ? 'rgba(5,5,7,0.92)' : 'rgba(10,10,14,0.82)',
            backdropFilter: 'blur(10px)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ink hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            style={{ perspective: 1200 }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 160, rotateX: 80, scale: 0.6 }}
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16, delay: 0.15 } }
            }
          >
            <PaperCard paper={paper} authorName={authorName} showOpened />
          </motion.div>

          {isAngry && intention?.prompt && (
            <motion.p
              className="mt-6 max-w-xs text-center text-sm italic text-ink-soft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1 } }}
            >
              {intention.prompt}
            </motion.p>
          )}

          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8 } }}
          >
            {onAgain && (
              <button
                type="button"
                onClick={onAgain}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-ink hover:bg-white/15"
              >
                <RefreshCw className="h-4 w-4" /> Abrir otro
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-void hover:bg-white"
            >
              Guardar entre nosotros
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
