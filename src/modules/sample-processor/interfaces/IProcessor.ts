import { SampleRequestDto } from '../dto';
import { SampleEntity } from '../entities';

export default interface IProcessor {
  process(
    sampleRequestDto: SampleRequestDto,
  ): Promise<{ SampleResponseDto; boolean }>;
  getBarByFoo(foo: string): Promise<SampleEntity>;
}
