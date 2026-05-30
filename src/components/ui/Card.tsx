import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-2xl border border-brand-200/80 bg-surface p-5 shadow-panel',
      className,
    )}
    {...props}
  />
);
