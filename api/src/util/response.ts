export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
    correlationId: string;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(params: { code: string; message: string; statusCode: number; details?: unknown }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
  }
}

export function buildErrorResponse(params: {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}): ApiErrorEnvelope {
  return {
    error: {
      code: params.code,
      message: params.message,
      correlationId: params.correlationId,
      ...(params.details === undefined ? {} : { details: params.details }),
    },
  };
}
