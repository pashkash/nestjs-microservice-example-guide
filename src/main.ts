import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { MainModule } from './MainModule';
import { EveryExceptionFilter } from './exception-filters';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerDocumentBuilder } from './components/SwaggerDocumentBuilder';
import { EmptyResponseInterceptor } from './interceptors';
import {
  CONFIG_SERVICE_INTERFACE_TOKEN,
  ConfigServiceInterface,
} from '@custom/nestjs-config';
import {
  LoggerInterface,
  LOGGER_INTERFACE_TOKEN,
  LOGGER_SERVICE_TOKEN,
  LoggerProvider,
} from '@custom/nestjs-logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    new FastifyAdapter(),
    {
      logger: LoggerProvider.forBootstrap('info'),
    },
  );
  const configService = app.get<ConfigServiceInterface>(
    CONFIG_SERVICE_INTERFACE_TOKEN,
  );
  // console.log(configService.get('vault'));

  app.useLogger(app.get(LOGGER_SERVICE_TOKEN));
  app.useGlobalInterceptors(new EmptyResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors();
  await app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new EveryExceptionFilter());

  const document = SwaggerDocumentBuilder.create(app);
  SwaggerModule.setup('api', app, document);

  await app.listen(
    configService.get<number>('app.port') as number,
    configService.get<string>('app.host') as string,
  );

  app
    .get<LoggerInterface>(LOGGER_INTERFACE_TOKEN)
    .log(
      `Environment: "${configService.get('app.environment')}"`,
      'NestApplication',
    );
  app
    .get<LoggerInterface>(LOGGER_INTERFACE_TOKEN)
    .log(
      `Application running on: "http://${configService.get(
        'app.host',
      )}:${configService.get('app.port')}"`,
      'NestApplication',
    );
}
bootstrap();
