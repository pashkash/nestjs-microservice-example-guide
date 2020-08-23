import request from 'supertest';
import { Test } from '@nestjs/testing';
import * as fixtures from '../fixtures/SampleProcessorIntegrationTestFixtures';
import { SampleProcessorModule } from '../../../src/modules/sample-processor/SampleProcessorModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleEntity } from '../../../src/modules/sample-processor/entities/SampleEntity';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { EveryExceptionFilter } from '../../../src/exception-filters/EveryExceptionFilter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmptyResponseInterceptor } from '../../../src/interceptors/EmptyResponseInterceptor';
import { Reflector } from '@nestjs/core';
import { app as appConfig, databases, services } from '../../../src/config';
import { FastifyAdapter } from '@nestjs/platform-fastify';


/**
 * Perform tests as a real customer. With real databases, transports and
 * other dependencies.
 */
describe('SampleProcessorIntegrationTests', () => {
  let app: INestApplication;

  // prepare environment once is enough
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [],
      imports: [
        // use local for local
        // use migrations for test before merging
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            configService.get('databases.postgres'),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([SampleEntity]),
        SampleProcessorModule,
        ConfigModule.forRoot({
          load: [appConfig, services, databases],
          envFilePath: ['.env.local', '.env'],
          isGlobal: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication(new FastifyAdapter());
    // const configService = app.get<ConfigService>('ConfigService');
    // console.log(configService);
    // console.log(process);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new EmptyResponseInterceptor());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.enableCors();
    await app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new EveryExceptionFilter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready(); // unless you will get 404

  });

  it(
    "SHOULD 201 OK response with 'SampleResponseDto' WHEN a valid " +
      "'SampleRequestDto' comes with not yet existed 'sample'",
    (done) => {
      request(app.getHttpServer())
        .post('/v1/process')
        .set('Content-Type', 'application/json')
        .send(fixtures.sampleRequestDto)
        .set('Accept', 'application/json')
        .expect(HttpStatus.CREATED)
        .end(async (err, res) => {
          expect(res.body).toStrictEqual(fixtures.sampleResponseDto);

          if (err) return done(err);
          done();
        });
    },
  );

  it(
    "SHOULD 200 OK response with 'Bar' WHEN a valid ':foo' parameter " +
      "comes and sample with this :foo named 'Bar' exists in DB",
    (done) => {
      request(app.getHttpServer())
        .get('/v1/bar/' + fixtures.bar200Request)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK)
        .end(async (err, res) => {
          expect(res.body).toStrictEqual(fixtures.bar200Response);

          if (err) return done(err);
          done();
        });
    },
  );

  it(
    'SHOULD 204 No content response with no body-response WHEN a valid ' +
      "':foo' parameter comes but there is no samples with this :foo in DB",
    (done) => {
      request(app.getHttpServer())
        .get('/v1/bar/' + fixtures.bar204Request)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(HttpStatus.NO_CONTENT)
        .end(async (err, res) => {
          expect(res.body).toStrictEqual(fixtures.bar204Response);

          if (err) return done(err);
          done();
        });
    },
  );

  it(
    "SHOULD 200 OK response with 'SampleResponseDto' WHEN a valid " +
      "'SampleRequestDto' comes with already existed 'sample'",
    (done) => {
      request(app.getHttpServer())
        .post('/v1/process')
        .set('Content-Type', 'application/json')
        .send(fixtures.sampleRequestDto)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK)
        .end(async (err, res) => {
          expect(res.body).toStrictEqual(fixtures.sampleResponseDto);

          if (err) return done(err);
          done();
        });
    },
  );
});
