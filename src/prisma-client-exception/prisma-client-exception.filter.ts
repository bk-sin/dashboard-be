import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';

/**
 * Catches Prisma's `PrismaClientKnownRequestError` and formats them into
 * a user-friendly HTTP response.
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientknownrequesterror
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      // --------------------------------------------------------------------
      // Handles unique constraint violations (e.g., creating a user with
      // an email that already exists).
      // --------------------------------------------------------------------
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const field = (exception.meta?.target as string[])?.join(', ');
        const message = `A record with this ${field} already exists. Please use another value.`;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }

      // --------------------------------------------------------------------
      // Handles cases where a related record is required but not found.
      // E.g., deleting a user that has posts.
      // --------------------------------------------------------------------
      case 'P2003': {
        const status = HttpStatus.CONFLICT;
        const field = exception.meta?.field_name as string;
        const message = `A foreign key constraint failed on the field: ${field}. The related record does not exist.`;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }

      // --------------------------------------------------------------------
      // Handles cases where a record to be updated or deleted was not found.
      // --------------------------------------------------------------------
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        const message =
          (exception.meta?.cause as string) ||
          'The requested resource was not found.';
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      }

      // --------------------------------------------------------------------
      // If the error code is not handled above, fall back to the default
      // NestJS exception filter.
      // --------------------------------------------------------------------
      default:
        super.catch(exception, host);
        break;
    }
  }
}
