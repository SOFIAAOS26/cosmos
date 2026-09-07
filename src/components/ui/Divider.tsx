import { cn } from '@/utils/cn';

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 text-ink-faint', className)}>
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    );
  }
  return <hr className={cn('border-0 border-t border-white/10', className)} />;
}
