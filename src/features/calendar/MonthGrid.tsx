import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { buildMonthMatrix, WEEKDAYS_ES, type DateKey } from '@/utils/date';
import type { IndicatorMap } from './useMonthIndicators';

interface MonthGridProps {
  monthDate: Date;
  todayKey: DateKey;
  selectedKey: DateKey | null;
  indicators: IndicatorMap;
  onSelect: (key: DateKey) => void;
}

/** The month grid — clean, uncluttered, small dots only (§14). */
export function MonthGrid({ monthDate, todayKey, selectedKey, indicators, onSelect }: MonthGridProps) {
  const cells = buildMonthMatrix(monthDate, todayKey);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 px-1">
        {WEEKDAYS_ES.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-ink-faint">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const ind = indicators[cell.key];
          const selected = cell.key === selectedKey;
          const day = cell.date.getDate();
          return (
            <motion.button
              key={cell.key}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(cell.key)}
              aria-label={cell.key}
              aria-pressed={selected}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                cell.inMonth ? 'text-ink' : 'text-ink-faint/40',
                selected && 'bg-white/10',
                cell.isToday && !selected && 'ring-1 ring-white/25',
              )}
            >
              <span className={cn(cell.isToday && 'font-semibold text-blossom')}>{day}</span>
              {ind && (
                <span className="absolute bottom-1.5 flex items-center gap-0.5">
                  {ind.memory && <Dot className="bg-blossom" />}
                  {ind.event && <Dot className="bg-aura" />}
                  {ind.task && <Dot className="bg-noir-soft" />}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Dot({ className }: { className?: string }) {
  return <span className={cn('h-1 w-1 rounded-full', className)} />;
}
