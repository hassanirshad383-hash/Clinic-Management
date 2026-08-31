import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';

interface Envelope {
  success: true;
  data: unknown;
  meta?: unknown;
}

function isPaginated(value: unknown): value is { data: unknown; meta: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value
  );
}

/**
 * Wraps every successful controller response in the standard
 * { success: true, data, meta? } envelope. Controllers just return their
 * plain payload (or { data, meta } for paginated lists).
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<Envelope> {
    return next.handle().pipe(
      map((payload: unknown): Envelope => {
        if (isPaginated(payload)) {
          return { success: true, data: payload.data, meta: payload.meta };
        }
        return { success: true, data: payload ?? null };
      }),
    );
  }
}
