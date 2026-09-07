import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { IconButton } from '@/components/ui';
import { MonthGrid } from './MonthGrid';
import { DaySheet } from './DaySheet';
import { useMonthIndicators } from './useMonthIndicators';
import { useCosmos } from '@/providers/CosmosProvider';
import { addMonths, monthLabel, subMonths, todayKey, type DateKey } from '@/utils/date';

export function CalendarScreen() {
  const { cosmos } = useCosmos();
  const tz = cosmos?.timezone ?? 'UTC';
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [direction, setDirection] = useState(0);
  const [selected, setSelected] = useState<DateKey | null>(null);
  const indicators = useMonthIndicators(monthDate);
  const today = todayKey(tz);

  function go(delta: number) {
    setDirection(delta);
    setMonthDate((d) => (delta > 0 ? addMonths(d, 1) : subMonths(d, 1)));
  }

  function onDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x < -70) go(1);
    else if (info.offset.x > 70) go(-1);
  }

  return (
    <Screen
      title="Calendario"
      subtitle="El tiempo compartido"
      right={
        <div className="flex items-center gap-1">
          <IconButton label="Mes anterior" size="sm" onClick={() => go(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton label="Mes siguiente" size="sm" onClick={() => go(1)}>
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      }
    >
      <div className="mb-4 text-center">
        <span className="font-display text-lg capitalize text-ink">{monthLabel(monthDate)}</span>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={monthLabel(monthDate)}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
          >
            <MonthGrid
              monthDate={monthDate}
              todayKey={today}
              selectedKey={selected}
              indicators={indicators}
              onSelect={setSelected}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-ink-faint">
        <LegendDot className="bg-blossom" label="Recuerdo" />
        <LegendDot className="bg-aura" label="Evento" />
        <LegendDot className="bg-noir-soft" label="Pendiente" />
      </div>

      <DaySheet dateKey={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </Screen>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}
