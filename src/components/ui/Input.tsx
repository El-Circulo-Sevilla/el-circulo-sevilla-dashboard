import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? <span className="text-sm font-medium text-dark-500">{label}</span> : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-10 rounded-xl border border-brand-200 bg-white px-3 text-sm text-ink outline-none transition focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-300/50',
            error ? 'border-rose-400' : 'hover:border-brand-300',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
