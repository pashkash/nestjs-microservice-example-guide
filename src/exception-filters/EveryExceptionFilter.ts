import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/ErrorResponseDto';
import { ServerResponse } from 'http';
import { FastifyReply } from 'fastify';

/**
 * This is a standard response for any errors; thus no need to have
 * ApiResponse
 */
@Catch()
export class EveryExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply<ServerResponse>>();
    // const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionName =
      exception instanceof Error ? exception.constructor.name : typeof Error;

    const exceptionMessage =
      exception instanceof Error ? exception.message : '';

    response.status(status).send(
      new ErrorResponseDto({
        type: exceptionName,
        message: exceptionMessage,
        // statusCode: status,
        // path: request.url,
      }),
    );
  }
}
