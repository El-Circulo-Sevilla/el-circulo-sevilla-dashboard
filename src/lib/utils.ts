import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDateTime = (value: string) => {
  try {
    return format(new Date(value), "dd MMM yyyy, HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export const formatDate = (value: string) => {
  try {
    return format(new Date(value), 'dd MMM yyyy', { locale: es });
  } catch {
    return value;
  }
};
