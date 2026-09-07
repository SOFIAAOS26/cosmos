import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IDENTITY, type Identity } from '@/theme/identity';

interface IdentityPickerProps {
  value: Identity | null;
  onChange: (id: Identity) => void;
  /** Identity already taken by the other member (disabled). */
  taken?: Identity | null;
}

const ORDER: Identity[] = ['noir', 'blossom'];

/** Choose your visual identity — Noir or Blossom (§7, §30). */
export function IdentityPicker({ value, onChange, taken }: IdentityPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ORDER.map((key) => {
        const id = IDENTITY[key];
        const selected = value === key;
        const disabled = taken === key;
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(key)}
            aria-pressed={selected}
            className={cn(
              'group relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-200 ease-cosmos',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              selected ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <span
              className="h-14 w-14 rounded-full ring-2 ring-white/10"
              style={{
                background:
                  key === 'noir'
                    ? 'radial-gradient(circle at 35% 30%, #52525B, #18181B)'
                    : 'radial-gradient(circle at 35% 30%, #F9A8D4, #F472B6)',
                boxShadow: key === 'blossom' ? '0 0 24px -6px rgba(244,114,182,0.6)' : undefined,
              }}
            />
            <div className="text-center">
              <div className="font-display text-base text-ink">{id.label}</div>
              <div className="text-xs text-ink-faint">
                {key === 'noir' ? 'sobrio · cinematográfico' : 'suave · luminoso'}
              </div>
            </div>
            {selected && (
              <span className="absolute right-3 top-3 text-ink">
                <Check className="h-4 w-4" />
              </span>
            )}
            {disabled && (
              <span className="absolute right-3 top-3 text-[10px] uppercase tracking-wide text-ink-faint">
                tomado
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
