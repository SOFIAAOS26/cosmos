import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from './nav';

/**
 * Mobile bottom navigation (§8, §11).
 * Large touch targets, safe-area aware, quiet until active.
 */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <div className="glass mx-auto flex max-w-lg items-stretch justify-around rounded-t-2xl border-b-0 px-2 pt-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="group relative flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ease-cosmos',
                    isActive ? 'text-ink' : 'text-ink-faint group-active:scale-90',
                  )}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-ink' : 'text-ink-faint',
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-blossom shadow-blossom" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
