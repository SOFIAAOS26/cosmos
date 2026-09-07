import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from './nav';
import { Logo } from '@/components/brand/Logo';
import { useCosmos } from '@/providers/CosmosProvider';

/**
 * Desktop sidebar (§40). Keeps the intimate aesthetic — never a corporate dashboard.
 */
export function Sidebar() {
  const { cosmos } = useCosmos();
  return (
    <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-white/5 bg-surface/40 px-4 pb-6 pt-8">
      <div className="px-2">
        <Logo size="sm" />
        <p className="mt-3 truncate text-sm text-ink-faint">{cosmos?.name}</p>
      </div>
      <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-white/5 text-ink'
                  : 'text-ink-soft hover:bg-white/5 hover:text-ink',
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
      <p className="px-3 font-display text-xs italic text-ink-faint">our little universe.</p>
    </aside>
  );
}
