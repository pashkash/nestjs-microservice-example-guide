import { SampleEntity } from '../../../src/modules/sample-processor/entities/SampleEntity';
import { SampleRequestDto, SampleResponseDto } from '../../../src/modules/sample-processor/dto';

export const sample = new SampleEntity();
sample.sample = 'Foo';
sample.createdAt = new Date();
sample.updatedAt = new Date();

export const existedSample = new SampleEntity();
existedSample.sample = 'ExistedFoo';
existedSample.createdAt = new Date();
existedSample.updatedAt = new Date();

export const sampleRequestDto = new SampleRequestDto();
sampleRequestDto.ping = 'Foo';

export const sampleExistedRequestDto = new SampleRequestDto();
sampleExistedRequestDto.ping = 'ExistedFoo';

export const sampleResponseDto = new SampleResponseDto();
sampleResponseDto.pong = 'Bar';

export const foo = 'Foo';
export const fooAnswer = 'Bar';
export const fooSampleRepositoryFindOne = {
  order: { id: 'DESC' },
  where: { sample: 'Foo' },
};

export const fooNotExisted = 'Bar';
export const fooNotExistedAnswer = undefined;
export const fooNotExistedSampleRepositoryFindOne = {
  order: { id: 'DESC' },
  where: { sample: 'Bar' },
};
