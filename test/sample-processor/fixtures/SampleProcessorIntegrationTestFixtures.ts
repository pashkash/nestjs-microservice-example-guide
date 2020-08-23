import { SampleEntity } from '../../../src/modules/sample-processor/entities/SampleEntity';
import { SampleRequestDto } from '../../../src/modules/sample-processor/dto';
import { v4 as uuidv4 } from 'uuid';

export const sample = new SampleEntity();
sample.sample = 'Foo' + uuidv4();

export const bar200Request = sample.sample;
export const bar200Response = { sample: sample.sample };

export const bar204Request = 'Food';
export const bar204Response = {};

export const sampleRequestDto = new SampleRequestDto();
sampleRequestDto.ping = sample.sample;

export const sampleResponseDto = { pong: 'Bar' };
