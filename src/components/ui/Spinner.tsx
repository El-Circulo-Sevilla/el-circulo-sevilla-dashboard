import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => (
  <span
    className={cn(
      'inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600',
      className,
    )}
    aria-hidden
  />
);
