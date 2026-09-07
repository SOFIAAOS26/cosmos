import { Screen } from '@/components/layout/Screen';
import { Nedi } from '@/components/nedi';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { TodayCard } from './TodayCard';
import { NextMomentCard } from './NextMomentCard';
import { CalendarPeek } from './CalendarPeek';
import { InviteCard } from './InviteCard';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * OBSERVATORY — the home (§11, §13).
 * A small personal observatory: how the other is today, this week, the next
 * big moment, and Nedi's quiet presence.
 */
export function Observatory() {
  const { profile } = useAuth();
  const { members } = useCosmos();
  const alone = members.length < 2;

  return (
    <Screen
      title={
        <span>
          {greeting()}
          {profile?.display_name ? `, ${profile.display_name}` : ''}
        </span>
      }
      subtitle="Tu observatorio"
      right={<Nedi state={alone ? 'observing' : 'idle'} size={56} enter={false} />}
    >
      <div className="space-y-4">
        {alone ? (
          <InviteCard />
        ) : (
          <>
            <TodayCard />
            <NextMomentCard />
            <CalendarPeek />
          </>
        )}
      </div>
    </Screen>
  );
}
