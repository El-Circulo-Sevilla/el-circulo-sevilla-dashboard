import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-panel border border-slate-200 bg-white p-5 shadow-panel',
      className,
    )}
    {...props}
  />
);
