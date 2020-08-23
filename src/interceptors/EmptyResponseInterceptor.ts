import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerResponse } from 'http';
import { FastifyReply } from 'fastify';

export class EmptyResponse {}

export interface Response<T> {
  data: T;
}

/**
 * Change HttpStatus.OK to HttpStatus.NO_CONTENT for empty responses
 * Thus no need to wrap all controllers with ApiResponse decorator
 *
 * REST API rile for NO_CONTENT responses
 * https://restfulapi.net/http-status-204-no-content/
 */
@Injectable()
export class EmptyResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const statusCode: number = context
      .switchToHttp()
      .getResponse<FastifyReply<ServerResponse>>().res.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (statusCode === HttpStatus.OK && data === undefined) {
          context
            .switchToHttp()
            .getResponse<FastifyReply<ServerResponse>>()
            .status(HttpStatus.NO_CONTENT);
        }
        return data;
      }),
    );
  }
}
