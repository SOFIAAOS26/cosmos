import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, rows = 3, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full resize-none rounded-lg border bg-white/5 px-3.5 py-3 text-ink placeholder:text-ink-faint',
          'transition-colors duration-150 ease-cosmos',
          'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent',
          error ? 'border-blossom/50' : 'border-white/10',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-blossom-soft">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
});
