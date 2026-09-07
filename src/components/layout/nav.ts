import type { LucideIcon } from 'lucide-react';
import { Orbit, CalendarDays, Images, Rocket, Menu } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** The four areas + More (§12). Simple on purpose — never ten menus. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Cosmos', icon: Orbit, end: true },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/moments', label: 'Momentos', icon: Images },
  { to: '/future', label: 'Futuro', icon: Rocket },
  { to: '/more', label: 'Más', icon: Menu },
];
