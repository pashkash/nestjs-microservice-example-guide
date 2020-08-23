import { Test } from '@nestjs/testing';
import * as fixtures from '../fixtures/SampleProcessorUnitTestFixtures';
import { SampleProcessorModule } from '../../../src/modules/sample-processor/SampleProcessorModule';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { SampleEntity } from '../../../src/modules/sample-processor/entities/SampleEntity';
import { SampleProcessorController } from '../../../src/modules/sample-processor/SampleProcessorController';
import { SampleProcessorService } from '../../../src/modules/sample-processor/SampleProcessorService';
import { InsertResult, Repository } from 'typeorm';
import MockDate from 'mockdate';
import { HttpStatus } from '@nestjs/common';
import deepEqual from 'deep-equal';

/**
 * Unit tests.
 * Develops before writing the code, it is a part of the design stage.
 * Unit tests determine how the program should run inside.
 *
 * 1. Ensure that component produces that it should and behaves as designed
 * with less amount of test as possible.
 * 2. Make tests only for features provided by the component; mock any others.
 */
describe('SampleProcessorUnitTests', () => {
  // freeze time
  MockDate.set(fixtures.sample.createdAt);

  let sampleController: SampleProcessorController;
  let sampleProcessorService: SampleProcessorService;
  let sampleRepository: Repository<SampleEntity>;
  let mockResponse: any;
  let mockSampleProcessorServiceInsert: any;
  let mockSampleRepositoryFindOne: any;

  // means before each test
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SampleProcessorController],
      providers: [SampleProcessorService],
      imports: [
        TypeOrmModule.forFeature([SampleEntity]),
        SampleProcessorModule,
      ],
    })
      // mock
      .overrideProvider(getRepositoryToken(SampleEntity))
      .useValue({
        // findOne: () => mockSampleRepositoryFindOne,
      })
      .compile();

    sampleController = moduleRef.get<SampleProcessorController>(
      SampleProcessorController,
    );

    sampleProcessorService = moduleRef.get<SampleProcessorService>(
      SampleProcessorService,
    );
    mockSampleProcessorServiceInsert = jest.fn(
      async (sample: SampleEntity): Promise<InsertResult> => {
        const id = sample.sample === 'ExistedFoo' ? undefined : { id: 68 };

        return Promise.resolve({
          identifiers: [id],
          generatedMaps: [id],
          raw: [id],
        });
      },
    );
    sampleProcessorService._insert = mockSampleProcessorServiceInsert;
    jest.spyOn(sampleProcessorService, 'getBarByFoo');
    jest.spyOn(sampleProcessorService, 'process');
    jest.spyOn(sampleProcessorService, '_insert');

    sampleRepository = moduleRef.get<Repository<SampleEntity>>(
      getRepositoryToken(SampleEntity),
    );
    mockSampleRepositoryFindOne = jest.fn(
      async (options: any): Promise<SampleEntity> => {
        return Promise.resolve(
          deepEqual(options, fixtures.fooNotExistedSampleRepositoryFindOne)
            ? fixtures.fooNotExistedAnswer
            : fixtures.fooAnswer,
        );
      },
    );
    sampleRepository.findOne = mockSampleRepositoryFindOne;
    jest.spyOn(sampleRepository, 'findOne');

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnValueOnce('mocked'),
    };
    jest.spyOn(mockResponse, 'status');
    jest.spyOn(mockResponse, 'send');
  });

  it(
    'SHOULD insert into DB new row WHEN a valid payload that came ' +
      'the first time with HTTP CREATED status',
    async () => {
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
      expect(sampleProcessorService._insert).toHaveBeenCalledTimes(1);
      expect(sampleProcessorService._insert).toBeCalledWith(fixtures.sample);

      //ensure that Controller responses as expected
      expect(mockResponse.status.mock.calls[0][0]).toBe(HttpStatus.CREATED);
      expect(mockResponse.send.mock.calls[0][0]).toEqual(
        fixtures.sampleResponseDto,
      );
      expect(result).toBe('mocked');
    },
  );

  it(
    'SHOULD NOT insert into DB new row a valid payload that came again ' +
      'and return HTTP OK status',
    async () => {
      // imitate a call with sampleRequestDto payload
      const result = await sampleController.process(
        fixtures.sampleExistedRequestDto,
        mockResponse,
      );

      // ensure that process handler was called, was called once, was
      // called with right parameters
      expect(sampleProcessorService.process).toHaveBeenCalledTimes(1);
      expect(sampleProcessorService.process).toBeCalledWith(
        fixtures.sampleExistedRequestDto,
      );

      // ensure that 'insert' handler was called, was called once, was
      // called with right parameters, was called with "already existed" 'sample'
      expect(sampleProcessorService._insert).toHaveBeenCalledTimes(1);
      expect(sampleProcessorService._insert).toBeCalledWith(
        fixtures.existedSample,
      );

      //ensure that Controller responses as expected
      expect(mockResponse.status.mock.calls[0][0]).toBe(HttpStatus.OK);
      expect(mockResponse.send.mock.calls[0][0]).toEqual(
        fixtures.sampleResponseDto,
      );

      expect(result).toBe('mocked');
    },
  );

  it('SHOULD NOT find a not existed foo in DB', async () => {
    const result = await sampleController.getBarByFoo(fixtures.fooNotExisted);

    expect(sampleProcessorService.getBarByFoo).toHaveBeenCalledTimes(1);
    expect(sampleProcessorService.getBarByFoo).toBeCalledWith(
      fixtures.fooNotExisted,
    );

    expect(sampleRepository.findOne).toHaveBeenCalledTimes(1);
    expect(sampleRepository.findOne).toBeCalledWith(
      fixtures.fooNotExistedSampleRepositoryFindOne,
    );

    expect(result).toBe(fixtures.fooNotExistedAnswer);
  });

  it('SHOULD find an existed foo in DB', async () => {
    const result = await sampleController.getBarByFoo(fixtures.foo);

    expect(sampleProcessorService.getBarByFoo).toHaveBeenCalledTimes(1);
    expect(sampleProcessorService.getBarByFoo).toBeCalledWith(fixtures.foo);

    expect(sampleRepository.findOne).toHaveBeenCalledTimes(1);
    expect(sampleRepository.findOne).toBeCalledWith(
      fixtures.fooSampleRepositoryFindOne,
    );

    expect(result).toBe(fixtures.fooAnswer);
  });
});
