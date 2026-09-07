import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, Heart, AlertCircle } from 'lucide-react';

type ToastTone = 'default' | 'success' | 'blossom' | 'error';

interface Toast {
  id: number;
  message: ReactNode;
  tone: ToastTone;
}

interface ToastApi {
  toast: (message: ReactNode, tone?: ToastTone, durationMs?: number) => void;
  success: (message: ReactNode) => void;
  love: (message: ReactNode) => void;
  error: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons: Record<ToastTone, ReactNode> = {
  default: <Info className="h-4 w-4 text-ink-soft" />,
  success: <Check className="h-4 w-4 text-aura" />,
  blossom: <Heart className="h-4 w-4 text-blossom" />,
  error: <AlertCircle className="h-4 w-4 text-blossom-soft" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: ReactNode, tone: ToastTone = 'default', durationMs = 2800) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, tone }]);
      window.setTimeout(() => remove(id), durationMs);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (m) => toast(m, 'success'),
      love: (m) => toast(m, 'blossom'),
      error: (m) => toast(m, 'error'),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="glass pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full px-4 py-2.5 text-sm text-ink shadow-lift"
              >
                {icons[t.tone]}
                <span>{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
