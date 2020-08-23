import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GenerateCommand } from './commands/GenerateCommand';
import { ConsoleModule } from 'nestjs-console';
import { TerminusModule } from '@nestjs/terminus';
import { Module, Logger } from '@nestjs/common';
import { HealthController } from './controllers';
import { app, services, databases, vault } from './config';
import { SampleProcessorModule } from './modules/sample-processor/SampleProcessorModule';
import { MainController } from './controllers/MainController';
import { MainService } from './services/MainService';
import * as Joi from '@hapi/joi';
import { LoggerModule, LoggerModuleOptions, LOGGER_INTERFACE_TOKEN, LoggerProvider, LoggerInterface } from '@custom/nestjs-logger';
import * as HttpClient from '@custom/cache-service-client';

// can't set up this
// 'template_microservice', {'namespace': 'redis'}
const v1Api = new HttpClient.V1Api();
v1Api.apiClient.basePath="http://0.0.0.0:8888";

v1Api.getNamespaces().then(function(data) {
  console.log('API v1Api.getNamespaces called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error(error);
});

const createCacheItemDto = new HttpClient.CreateCacheItemDto('foo');

console.log('createCacheItemDto: ' + JSON.stringify(createCacheItemDto));

v1Api.set('fooKey', {value:'ffffff'}, {'namespace': 'redis'}).then(function(data) {
  console.log('API v1Api.set called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error(error);
});

v1Api.get('fooKey', {'namespace': 'redis'}).then(function(data) {
  console.log('API v1Api.get called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error(error);
});

// foo
// redis
// {
//   "value": {"foo":"bar"},
//   "ttl": 0
// }


const monitoringApi = new HttpClient.MonitoringApi();
monitoringApi.apiClient.basePath="http://0.0.0.0:8888";
console.log(monitoringApi);

monitoringApi.check().then(function(data) {
  console.log('API monitoringApi.check() called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error(error);
});




import {
  CONFIG_SERVICE_INTERFACE_TOKEN,
  ConfigModule,
  ConfigServiceInterface,
} from '@custom/nestjs-config';
import { SentryTransport } from 'sentry-transport-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [app, services, databases, vault],
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        SENTRY_DSN: Joi.string(),
      }),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigServiceInterface,
      ): LoggerModuleOptions => {
        const aTransports = [];

        // TODO better to move into module constructor to be available to change 
        // this setting the whole product entirely, not for each of the projects
        if (configService.get('app.environment') === 'production') {
          aTransports.push(
            new SentryTransport({
              level: 'warn',
              sentryOpts: {
                dsn: configService.get<string>('services.sentry.dsn'),
                release: configService.get<string>('app.version'),
                environment:
                  configService.get<string>('app.environment') || 'development',
                serverName: configService.get<string>('app.hostname'),
              },
              handleExceptions: true,
            }),
          );
        }

        return {
          debug: configService.get('app.debug'),
          environment: configService.get('app.environment'),
          transports: aTransports,
          defaultContext: 'NestApplication',
        };
      },
      inject: [CONFIG_SERVICE_INTERFACE_TOKEN],
    }),
    // CacheModule.forRoot({
    //   imports: [ConfigModule, LoggerModule],
      
    //   useFactory: async (
    //     loggerService: LoggerInterface,
    //     adapterCollection: AdapterCollectionInterface,
    //     configService: ConfigServiceInterface
    //     ) => {
    //       return {
    //         loggerService,
    //         adapterCollection,
    //         configService
    //       }
    //     },
    //   inject: [CONFIG_SERVICE_INTERFACE_TOKEN, LOGGER_INTERFACE_TOKEN],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigServiceInterface) =>
        configService.get<TypeOrmModuleOptions>('databases.postgres'),
      inject: [CONFIG_SERVICE_INTERFACE_TOKEN],
    }),
    SampleProcessorModule,
    TerminusModule,
    ConsoleModule,
  ],
  controllers: [HealthController, MainController],
  providers: [MainService, Logger, GenerateCommand],
  exports: [],
})
export class MainModule {}
