import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { backdropVariants, sheetVariants } from '@/theme/motion';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Max height as a viewport fraction. Default 0.9. */
  maxHeight?: number;
  className?: string;
  showClose?: boolean;
}

/**
 * A drag-dismissible bottom sheet — the primary way COSMOS reveals detail
 * without an abrupt navigation (§13, §15). Mobile-first, safe-area aware.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = 0.9,
  className,
  showClose = true,
}: BottomSheetProps) {
  // Lock body scroll & close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'glass absolute inset-x-0 bottom-0 rounded-t-2xl',
              'flex flex-col overflow-hidden',
              className,
            )}
            style={{ maxHeight: `${maxHeight * 100}dvh` }}
            variants={sheetVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-10 rounded-full bg-white/20" aria-hidden />
            </div>

            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 pb-2 pt-2">
                <div className="min-w-0 font-display text-lg text-ink">{title}</div>
                {showClose && (
                  <IconButton label="Cerrar" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </IconButton>
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
