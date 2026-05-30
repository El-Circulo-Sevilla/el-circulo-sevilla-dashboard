import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none ring-teal-500 transition focus-visible:ring-2',
            error ? 'border-rose-400' : 'border-slate-300',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </label>
    );
  },
);

Textarea.displayName = 'Textarea';
