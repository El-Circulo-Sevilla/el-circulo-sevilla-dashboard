import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-ink outline-none ring-teal-500 transition focus-visible:ring-2',
            error ? 'border-rose-400' : 'border-slate-300',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </label>
    );
  },
);

Select.displayName = 'Select';
