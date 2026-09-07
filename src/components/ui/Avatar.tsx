import { cn } from '@/utils/cn';
import { identityOf, type Identity } from '@/theme/identity';

export interface AvatarProps {
  name: string;
  identity?: Identity | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ring?: boolean;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/**
 * A person in the cosmos. Identity colors the ring, but we also show
 * initials (and can add a label elsewhere) so color is never the only signal.
 */
export function Avatar({ name, identity, src, size = 'md', className, ring = true }: AvatarProps) {
  const id = identityOf(identity);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
        'bg-surface-elevated text-ink',
        ring && 'ring-2',
        ring && id.ring,
        sizes[size],
        className,
      )}
      title={`${name} · ${id.label}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
