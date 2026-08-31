import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { tap, type Observable } from 'rxjs';
import type { Request, Response } from 'express';

/**
 * Structured request logging. Never logs request bodies (which may contain
 * passwords, tokens, or personal data) — only method, path, status, and
 * duration.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} ${Date.now() - start}ms`,
          );
        },
        error: () => {
          this.logger.warn(
            `${method} ${originalUrl} ${response.statusCode} ${Date.now() - start}ms`,
          );
        },
      }),
    );
  }
}
