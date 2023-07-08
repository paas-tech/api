import { ExceptionFilter, Catch, ArgumentsHost, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { PrismaError } from 'prisma-error-enum';

@Catch(PrismaClientKnownRequestError)
export class PrismaCatcherFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let field = '';

    switch (exception.code) {
      case PrismaError.RecordsNotFound:
        throw new NotFoundException();

      case PrismaError.UniqueConstraintViolation:
        statusCode = 400;
        errorCode = exception.code;
        message = 'The value for the field is already taken';

        const fields = exception.meta?.target as string[];
        if (fields.length === 0) {
          field = '';
        } else {
          field = fields[0];
        }
        break;

      case PrismaError.ForeignConstraintViolation:
        statusCode = 400;
        errorCode = exception.code;
        message = 'The provided resource does not exist';
        break;

      default:
        throw new InternalServerErrorException();
    }

    const response = ctx.getResponse<Response>()

    response.status(statusCode).send({
      statusCode,
      errorCode,
      message,
      field: field ?? undefined,
    })
  }
}
