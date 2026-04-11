export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

function log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext): void {
  const payload = {
    level,
    message,
    ...(context ?? {}),
    timestamp: new Date().toISOString(),
  };

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export const logger = {
  info: (message: string, context?: LogContext): void => log('info', message, context),
  warn: (message: string, context?: LogContext): void => log('warn', message, context),
  error: (message: string, context?: LogContext): void => log('error', message, context),
};
