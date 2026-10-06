export interface AppErrorDetails {
  message: string;
  code: string;
  operation: string;
  status?: number;
  timestamp: string;
}

export class AppError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

interface ErrorLike {
  message?: unknown;
  code?: unknown;
  status?: unknown;
}

export function toAppErrorDetails(
  error: unknown,
  operation: string,
  fallbackMessage: string,
  fallbackCode = 'UNKNOWN_ERROR'
): AppErrorDetails {
  const candidate =
    error && typeof error === 'object' ? (error as ErrorLike) : undefined;
  const message =
    typeof candidate?.message === 'string' && candidate.message.trim()
      ? candidate.message
      : fallbackMessage;
  const code =
    typeof candidate?.code === 'string' && candidate.code.trim()
      ? candidate.code
      : fallbackCode;
  const status =
    typeof candidate?.status === 'number' ? candidate.status : undefined;

  return {
    message,
    code,
    operation,
    status,
    timestamp: new Date().toISOString(),
  };
}

export function logAppError(details: AppErrorDetails) {
  // Only log normalized fields. Credentials and session tokens never enter this object.
  // console.error opens Expo's runtime error overlay, so diagnostics use a normal log.
  console.log('[VEGETA_ERROR]', {
    operation: details.operation,
    code: details.code,
    status: details.status,
    message: details.message,
    timestamp: details.timestamp,
  });
}
