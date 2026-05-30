export interface AppError {
  code: string;
  message: string;
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: AppError };

export const toAppError = (
  error: unknown,
  fallbackCode: string,
  fallbackMessage: string,
): AppError => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const typedError = error as { code?: unknown; message: string };

    return {
      code:
        typeof typedError.code === 'string'
          ? typedError.code
          : fallbackCode,
      message: typedError.message || fallbackMessage,
    };
  }

  return {
    code: fallbackCode,
    message: fallbackMessage,
  };
};
