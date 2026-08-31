import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Catches every exception thrown anywhere in the app and normalizes it into
 * the standard { success: false, error: { code, message } } envelope.
 * Never leaks stack traces or internal details in production.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, body } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception: ${body.error.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = this.extractMessage(response, exception.message);

      return {
        status,
        body: {
          success: false,
          error: {
            code: this.codeForStatus(status),
            message,
            details: this.extractDetails(response),
          },
        },
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    // Unknown/unexpected error — never leak internals in production.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: this.isProduction
            ? 'An unexpected error occurred'
            : exception instanceof Error
              ? exception.message
              : 'An unexpected error occurred',
        },
      },
    };
  }

  private fromPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    body: ErrorBody;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          body: {
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'A record with these details already exists',
            },
          },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Resource not found' },
          },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'The request could not be processed',
            },
          },
        };
    }
  }

  private extractMessage(response: unknown, fallback: string): string {
    if (typeof response === 'string') return response;
    if (
      response &&
      typeof response === 'object' &&
      'message' in response
    ) {
      const message = (response as { message: unknown }).message;
      if (Array.isArray(message)) return message.join('; ');
      if (typeof message === 'string') return message;
    }
    return fallback;
  }

  private extractDetails(response: unknown): unknown {
    if (
      response &&
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray((response as { message: unknown }).message)
    ) {
      return (response as { message: unknown[] }).message;
    }
    return undefined;
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'ERROR';
    }
  }
}
