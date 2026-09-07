import { useNavigate } from 'react-router-dom';
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useCosmos } from '@/providers/CosmosProvider';
import { todayKey } from '@/utils/date';

/** A glance at this week — a bridge into the calendar (§11). */
export function CalendarPeek() {
  const navigate = useNavigate();
  const { cosmos } = useCosmos();
  const today = todayKey(cosmos?.timezone ?? 'UTC');
  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  });

  return (
    <GlassCard padded>
      <button
        type="button"
        onClick={() => navigate('/calendar')}
        className="mb-3 flex w-full items-center justify-between"
      >
        <span className="text-xs uppercase tracking-widest text-ink-faint">Esta semana</span>
        <ChevronRight className="h-4 w-4 text-ink-faint" />
      </button>
      <div className="flex justify-between">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const isToday = key === today;
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate('/calendar')}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] uppercase text-ink-faint">
                {format(d, 'EEEEE', { locale: es })}
              </span>
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                  isToday ? 'bg-blossom text-void shadow-blossom' : 'text-ink hover:bg-white/5',
                )}
              >
                {format(d, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
