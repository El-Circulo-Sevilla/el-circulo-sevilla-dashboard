import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-400 text-white shadow-lg shadow-brand-400/20 hover:scale-[1.01] hover:bg-brand-500 disabled:bg-brand-300 disabled:text-brand-100',
  secondary:
    'border border-brand-200 bg-white text-ink hover:scale-[1.01] hover:border-brand-400 hover:bg-brand-50 disabled:text-dark-200',
  ghost: 'bg-transparent text-dark-400 hover:bg-brand-100 disabled:text-dark-200',
  danger: 'bg-error text-white hover:scale-[1.01] hover:bg-red-700 disabled:bg-red-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? (
      <span className="inline-flex items-center gap-2">
        <Spinner />
        Procesando...
      </span>
    ) : (
      children
    )}
  </button>
);
