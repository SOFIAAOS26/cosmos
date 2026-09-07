import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Nedi } from '@/components/nedi';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useToast } from '@/providers/ToastProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { todayKey } from '@/utils/date';
import { TodayCard } from './TodayCard';
import { NextMomentCard } from './NextMomentCard';
import { CalendarPeek } from './CalendarPeek';
import { InviteCard } from './InviteCard';
import { TaskRadar } from '@/features/tasks/TaskRadar';
import type { NediState } from '@/components/nedi';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * OBSERVATORY — the home (§11, §13).
 * How the other is today, this week, the next big moment, and Nedi's presence.
 */
export function Observatory() {
  const { profile, user } = useAuth();
  const { cosmos, members } = useCosmos();
  const toast = useToast();
  const alone = members.length < 2;
  const today = cosmos ? todayKey(cosmos.timezone) : '';
  const [nediState, setNediState] = useState<NediState>('idle');

  // Nedi reacts to incoming support in realtime (§44) — briefly, never blocking.
  useRealtimeTable('task_support', cosmos?.id, (payload) => {
    const row = payload.new as { from_user?: string } | null;
    if (payload.eventType === 'INSERT' && row?.from_user && row.from_user !== user?.id) {
      toast.love('Recibiste apoyo ♡');
      setNediState('celebrating');
      window.setTimeout(() => setNediState('idle'), 4000);
    }
  });

  return (
    <Screen
      title={
        <span>
          {greeting()}
          {profile?.display_name ? `, ${profile.display_name}` : ''}
        </span>
      }
      subtitle="Tu observatorio"
      right={<Nedi state={alone ? 'observing' : nediState} size={56} enter={false} />}
    >
      <div className="space-y-4">
        {alone && <InviteCard />}
        {!alone && <TodayCard />}

        {today && <TaskRadar dateKey={today} label="Radar de hoy" />}

        <NextMomentCard />
        <CalendarPeek />
      </div>
    </Screen>
  );
}
