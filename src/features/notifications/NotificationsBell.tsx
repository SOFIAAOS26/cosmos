import { useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BottomSheet, IconButton } from '@/components/ui';
import { NediScene } from '@/components/nedi';
import { cn } from '@/utils/cn';
import { useNotifications } from './useNotifications';
import { markAllRead, notificationText } from './api';
import { useAuth } from '@/providers/AuthProvider';

/** A quiet bell with an unread dot; opens the notifications center (§43). */
export function NotificationsBell() {
  const { user } = useAuth();
  const { items, unread, refresh } = useNotifications();
  const [open, setOpen] = useState(false);

  async function openCenter() {
    setOpen(true);
    if (user && unread > 0) {
      await markAllRead(user.id);
      await refresh();
    }
  }

  return (
    <>
      <div className="relative">
        <IconButton label="Notificaciones" size="sm" onClick={openCenter}>
          <Bell className="h-5 w-5" />
        </IconButton>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blossom opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blossom" />
          </span>
        )}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Novedades">
        {items.length === 0 ? (
          <div className="py-6">
            <NediScene state="idle" size={92} caption="Todo tranquilo. Aquí verán sus novedades." />
          </div>
        ) : (
          <div className="space-y-2 py-2">
            {items.map((n) => {
              const { emoji, text } = notificationText(n);
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border px-3 py-2.5',
                    n.read_at ? 'border-white/5 bg-surface' : 'border-blossom/20 bg-blossom/5',
                  )}
                >
                  <span className="text-lg leading-none">{emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{text}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
