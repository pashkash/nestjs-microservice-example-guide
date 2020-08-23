# Design and implement application

In this chapter, we define what our service should do, make use cases base on it, draft a design and implement the app.  
  
The plan:
1. List features of the project, i.e., use cases, what should it do?
2. List models with interfaces and data transfer objects, applications, libraries, etc., and their responsibilities, i.e., how to organize components?
3. List data structures to transfer, i.e., that is the best data structure and how data moves?
4. Make the app, modules, controllers and providers

## List use cases
Two sample use cases to cover basic needs would be enough:
1. Process sample `POST` request  
1.1. Listen to the `POST /v1/process` route     
1.2. For a JSON sample `{ping: string}` payload     
1.3. Answer with `{pong: string}` JSON data response     
1.4. Manage 200, 201, or 500 HTTP statuses.  
2. Process sample `GET` request    
2.1. Listen to the `GET /v1/bar/:foo` route     
2.2. For a GET parameter `foo: string`  
2.3. Answer with `{sample: string}` JSON data response     
2.4. Manage 200 or 500 HTTP statuses.  

These samples process responsibility can be encapsulated by a SampleProcessor module.  

Great, we defined all use cases and modules. Let's specify our first Module, Controller, and Provider. The best move is to make tests based on these use cases; thus, we get a testable application as a side effect.  
Two types of tests will be fine. 

## Make tests based on use cases
If you not familiar with the [Jest JavaScript Testing Framework](https://jestjs.io/en/), please learn it before continues reading.

### Integration tests
These tests act like a real customer. We are going to allow them to use only use cases described before. 
Also, these tests use real databases, protocols, and other dependencies.

There is only the first test case defined with the code, read full version in this repo with the fixtures as well. 
```typescript
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
  "SHOULD 200 OK response with 'SampleResponseDto' WHEN a valid " +
    "'SampleRequestDto' comes with already existed 'sample'",
  (done) => {
   //
  },
);

it(
  "SHOULD 200 OK response with 'Bar' WHEN a valid ':foo' parameter " +
    "comes and sample with this :foo named 'Bar' exists in DB",
  (done) => {
    //
  },
);

it(
  'SHOULD 204 No content response with no body-response WHEN a valid ' +
    "':foo' parameter comes but there is no samples with this :foo in DB",
  (done) => {
    //
  },
);
```

### Unit tests
Unit tests determine how the program should run inside. During making tests, you are determining the design of the application. You determine controllers, providers, its functions, when and how they should be called.

1. Ensure that the tested component produces that it should behave as designed with fewer tests as possible.
2. Make tests only for features provided by the component; mock any others.
 
Again, there is only the first test case fully illustrated.

```typescript
it('SHOULD insert into DB new row WHEN a valid payload that came ' +
    'the first time with HTTP CREATED status', async () => {
    // imitate a call with sampleRequestDto payload
    const result = await sampleController.process(
      fixtures.sampleRequestDto,
      mockResponse,
    );

    // ensure that process handler was called, was called once, was
    // called with right parameters
    expect(sampleProcessorService.process).toHaveBeenCalledTimes(1);
    expect(sampleProcessorService.process).toBeCalledWith(
      fixtures.sampleRequestDto,
    );

    // ensure that 'insert' handler was called, was called once, was
    // called with right parameters, was called with a "not existed" 'sample'
    expect(sampleProcessorService.insert).toHaveBeenCalledTimes(1);
    expect(sampleProcessorService.insert).toBeCalledWith(fixtures.sample);

    //ensure that Controller responses as expected
    expect(mockResponse.status.mock.calls[0][0]).toBe(HttpStatus.CREATED);
    expect(mockResponse.send.mock.calls[0][0]).toEqual(
      fixtures.sampleResponseDto,
    );
    expect(result).toBe('mocked');
  },
);
  
it('SHOULD NOT insert into DB new row a valid payload that came again ' +
   'and return HTTP OK status', async () => {
    //
  },
);

it(
  "SHOULD NOT find a not existed foo in DB", async () => {
    //
  },
);

it(
  "SHOULD find an existed foo in DB", async () => {
    //
  },
);
```

> It is how it should be on this step: we do not have any classes, code organization, or database models, and all of our tests fail. The main objective of this step is to become an ability to create a relevant application design based on information that we collected from use cases.

## List application design conclusions
It is possible now to try to make design decisions:
1. One application is enough because we have only one simple business feature
2. One module is enough, there is nothing to be decoupled more
3. One module controller with two methods (`process` and `getBarByFoo`) to serve POST and GET requests is enough
4  One module provider is enough to serve the only one controller
3. One module entity for databases is enough, for storing `samples`
4. Two module Data Transfer Objects (DTO) is enough: `SampleRequestDto`, `SampleResponseDto`, and one shared Error Response DTO `ErrorResponseDto`  
5. One shared `ValidationError` exception is enough, for validating incoming DTOs  
6. One module interface `IProcessor` is enough to create as many sample processors implementations as we need 

Next paragraphs, we realize these conclusions.

## Implementation
### Describe Data Transfer Objects (DTO)
A DTO is a class that defines the structure of the data sent over the network. Here we can add `class-validator` decorators to use the `validate()` method of this library to validate the payload. Also, here we can add `swagger` decorators to set up the OpenAPI schema specification of each payload key. 

For example, let's create `SampleRequestDto.ts` to define a Sample request data structure. When we were making tests we already prepared structure we need, actually.

```typescript
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SampleRequestDto {
  @ApiProperty({
    description: 'Sample string',
    type: String,
    example: 'Foo',
  })
  @IsString()
  ping: string;
}
```
Other DTOs you can found inside dto folder. 

### Working with SQL Database  
Another way to define a DTO is to describe an Entity. The "entity" is a class that maps to a database table. Let's stop a little and learn how to work with SQL storage. 

Out of the box NestJs proposes to use TypeORM and Sequelize packages for working with SQL Databases. This guide uses TypeScrpit [TypeORM](https://github.com/typeorm/typeorm) `@nestjs/typeorm` package due it's widely support.

To start using entity as DTO we need a database [connection](https://typeorm.io/#/connection), an [entity](https://typeorm.io/#/entities), and [repository](https://typeorm.io/#/working-with-repository) to change entity table data.

| Class  ||
|---|---|
| `Connection`  |A single database ORM connection to a specific database. |
| `Entity`  |A class decorated by an `@Entity` maps typescript object properties to appropriate table columns. Each `Entity` has a `Repository`. |
| `Repository`  | Allows you to manage (insert, update, delete, load, etc.) related `Entity`. |


#### First, establish database connection
By passing database [config properties](https://typeorm.io/#/connection-options) inside root module decorator for `TypeOrmModule.forRoot` method, like in this example
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: ["dist/**/*.entity{.ts,.js}"],
    }),
  ],
})
export class MainModule {}
```
It is possilble to setup multiple databases with one or multiple connections.  
Also, you can setup replications with this example configuration:
```typescript
{
  type: "postgres",
  replication: {
    master: {
      host: "server1",
      port: 5432,
      username: "test",
      password: "test",
      database: "test"
    },
    slaves: [{
      host: "server2",
      port: 5432,
      username: "test",
      password: "test",
      database: "test"
    }, {
      host: "server3",
      port: 5432,
      username: "test",
      password: "test",
      database: "test"
    }]
  }
}
```
Write operations will be performed by the master server. Find methods or select query builder will be performed by one of slave instance with Round-Robin, Random, or Order algorithms.

Let's glance at `entities` key. It can be configured with different ways:

| Way  | |
|---|---|
| Directory  | NestJS collects all entities while it launches and stores them on disk in `./dist/` folder; thus we can just set this directory `["dist/**/*.entity{.d.ts,.js}"]` to use all entities that NestJS can found|
| Set of Entities  | Hand-operated set of entities to work with them only, e.g., [`NpiHash`, ] |
| Auto Load  | With `autoLoadEntities: true`, every entity registered through the `forFeature()` method will be automatically added to the entities array of the configuration object. The most convenient way works both for standard and monorepo type of projects, but can't be used to make migrations. |

There is a way to config the database connection, with `ormconfig.json`, but it can't work with `autoLoadEntities` config option (or any other forRoot-specific), thus try to avoid this way.


#### Second, describe an entity
[Please, check the column types](https://typeorm.io/#/entities) to make entity you want. Let's make an example. 

```typescript
@Entity('sample_table')
export class SampleEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'sample',
    type: String,
  })
  @Index()
  @Column({ nullable: false, unique: true })
  sample: string;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
```
Note, that properties can be decorated with `ApiProperty` the same way as `DTO` classes.

#### Third, register entity repository
Finally, register `Repository` for `Entity` to be able to call `find()`, `save()`, etc methods.

To make it works, we perform three steps
1. Mention `SampleEntity` entity inside `entities` in the root module to let TypeORM know about. Insofar as we already use "Directory" way to mention entities our entity will be included automatically.
```typescript
import { TypeOrmModule} from '@nestjs/typeorm'; 
...
      imports: [
        TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: ["dist/**/*.entity{.ts,.js}"], // includes SampleEntity,
        }), 
...
```
2. Add `SampleEntity` to the list of `TypeOrmModule.forFeature([...])]` inside module you need to register repositories for these entities. 
```typescript
...
import { SampleEntity } from './entities/SampleEntity';

@Module({
  imports: [TypeOrmModule.forFeature([SampleEntity])],
...})
export class SampleProcessorModule {}
```
3. Inject this registered `Repository` into the provider's constructor, for example
```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleEntity } from './entities/SampleEntity';
import { IProcessor } from '../../interfaces';

@Injectable()
export class SampleProcessorService implements IProcessor{
  constructor(
    @InjectRepository(SampleEntity)
    private readonly sampleRepository: Repository<SampleEntity>,
  ) {}
...
```
Now it is possible to do `this.sampleRepository.find(...)` or `this.sampleRepository.save(...)` inside `SampleProcessorService` methods.  

4. Make the migration file to correlate the corresponding table with the entity.
By giving `migration_name` to this command, you can create a new migration file inside '/migrations' folder. Each migration file is a set of SQL-commands to be database updated. This check starts each time the app starts, because of `migrationsRun: true,` option.   
```
yarn run typeorm migration:generate --migration_name
```

#### Fourthly, use entity as a DTO
But our goal is to use `SampleEntity` as a DTO. We decorated it already. Now we want from application to response with automatically transformed entity instance into JSON.  
We can do it with the `ClassSerializerInterceptor` [interceptor](https://docs.nestjs.com/interceptors), which will transform our entities instance before the application shot the response.  To apply it to the controller method we need to decorate it with `@UseInterceptors(ClassSerializerInterceptor)`.  
We apply this interceptor to the all application by adding one line into `main.ts`
```typescript
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```
Please, note that you can hide entity properties from output JSON with `@Exclude()` decorator inside `SampleEntity.ts`.

Great, we configured the database entity and used this entity class as a DTO. Now, back to design.

### Describe controllers
We have DTOs. Now we need a controller to manage routes to process DTOs there.   
According to our design conclusions we need two routes:
1. `POST /v1/process/`
2. `GET /v1/bar/:foo`  
  
Draft methods for them 
```typescript
...
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('v1') // add 'v1' prefix ro the routes
export class SampleProcessorController {
  constructor(
    // inject SampleProcessorService instance
    private readonly sampleProcessorService: SampleProcessorService,
  ) {}

  @Post('process') // add /v1/process route 
  async process(
    @Body() sampleRequestDto: SampleRequestDto, 
    @Res() response: FastifyReply<ServerResponse>,
  ): Promise<FastifyReply<ServerResponse>> {
    await validate(sampleRequestDto).then((errors) => {
      if (errors.length > 0) {
        throw new ValidationError(errors.toString());
      }
    });

    const {
      SampleResponseDto: sampleResponseDto,
      boolean: isNewResourcesAdded,
    } = await this.sampleProcessorService.process(sampleRequestDto);

    // Make a response with a ServerResponse object to illustrate how to change HTTP status
    return (
      response
        .status(isNewResourcesAdded ? HttpStatus.CREATED : HttpStatus.OK)
        .send(sampleResponseDto)
    );
  }

  @Get('bar/:foo') // add /v1/bar/:foo route
  async getBarByFoo(@Param('foo') foo: string): Promise<SampleEntity> {
    if (!isString(foo)) {
      throw new ValidationError("param 'foo' not a string type");
    }
    // SampleEntity will be transformed into DTO JSON 
    return this.sampleProcessorService.getBarByFoo(foo);
  }
}
```

### Describe providers and interfaces
Since it implements an interface let's define it first.
```typescript
import { SampleRequestDto } from '../dto';
import { SampleEntity } from '../entities';

export default interface IProcessor {
  process(sampleRequestDto: SampleRequestDto): Promise<{ SampleResponseDto; boolean }>;
  getBarByFoo(foo: string): Promise<SampleEntity>;
}
```

Now, add three methods into `SampleProcessorService.ts` provider to serve controller needs:
1. `process` to process `SampleRequestDto`
2. `getBarByFoo` to fetch bar by foo parameter
3. internal reusable `_insert` to support `process` method

Note, that here we inject `SampleEntity` with registered repository to manage table data.

```typescript
...
@Injectable()
export class SampleProcessorService implements IProcessor{
  constructor(
    @InjectRepository(SampleEntity)
    private readonly sampleRepository: Repository<SampleEntity>,
  ) {}

  async process(
    sampleRequestDto: SampleRequestDto,
  ): Promise<{ SampleResponseDto; boolean }> {

    const sample = new SampleEntity();
    sample.sample = sampleRequestDto.ping;
    sample.createdAt = new Date();
    sample.updatedAt = new Date();
    const insertResult = await this._insert(sample);

    console.log(insertResult);

    // no new ids means row wasn't inserted due 'simple' column value duplicate
    const isNewResourcesAdded: boolean =
      insertResult.identifiers[0] !== undefined;

    // prepare answer
    const sampleResponseDto = new SampleResponseDto();
    sampleResponseDto.pong = 'Bar'; // always bar

    return {
      SampleResponseDto: sampleResponseDto,
      boolean: isNewResourcesAdded,
    };
  }

  getBarByFoo(foo: string): Promise<SampleEntity> {
    // use repository methods
    return this.sampleRepository.findOne({
      where: { sample: foo },
      order: { id: 'DESC' },
    });
  }

  async _insert(sample: SampleEntity): Promise<InsertResult> {
    // query builder example (with generic types checks)
    return await this.sampleRepository
      .createQueryBuilder()
      .insert()
      .orIgnore(true)
      .into(SampleEntity)
      .values([sample])
      .execute();
  }
}
```
Good, we already defined DTO, entity, controller, interface, and provider.

### Describe module
Now we are able to manage all dependencies together.
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleProcessorService } from './SampleProcessorService';
import { SampleProcessorController } from './SampleProcessorController';
import { SampleEntity } from './entities/SampleEntity';

@Module({
  imports: [TypeOrmModule.forFeature([SampleEntity])],
  providers: [SampleProcessorService],
  controllers: [SampleProcessorController],
  exports: [SampleProcessorService],
})
export class SampleProcessorModule {}
```

### Describe application
We can't understand everything from the app file, but we can say that we are using [Fastify](https://github.com/fastify/fastify) HTTP server engine and the global Interceptor mentioned below. 
```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { MainModule } from './MainModule';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    new FastifyAdapter()
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(8888);
}
bootstrap();
```

## Summary
Great!  
Based on use cases we created tests and design of the application. Every change of the code should be the same way: update use cases -> update tests -> update code.

## Reading quality check
1. Please, make tests for health-check
2. Try to explain all DTO
3. Try to explain all tests cases 
4. Try to explain all controllers and providers decorators
