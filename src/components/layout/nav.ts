import type { ComponentType } from 'react';
import { Orbit, CalendarDays, Images, Rocket, Menu } from 'lucide-react';
import { JarIcon } from '@/features/frasco/JarIcon';

export interface NavItem {
  to: string;
  label: string;
  /** Any icon component that accepts className + strokeWidth (Lucide or our own). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  end?: boolean;
}

/** The areas + More (§12). Simple on purpose — never ten menus. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Cosmos', icon: Orbit, end: true },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/moments', label: 'Momentos', icon: Images },
  { to: '/frasco', label: 'Frasco', icon: JarIcon },
  { to: '/future', label: 'Futuro', icon: Rocket },
  { to: '/more', label: 'Más', icon: Menu },
];
