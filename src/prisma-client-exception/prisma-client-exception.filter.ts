import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
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

      default:
        super.catch(exception, host);
        break;
    }
  }
}
