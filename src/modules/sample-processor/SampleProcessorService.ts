import { Injectable } from '@nestjs/common';
import { InsertResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SampleEntity } from './entities';
import { SampleRequestDto, SampleResponseDto } from './dto';
import { IProcessor } from './interfaces';

@Injectable()
export class SampleProcessorService implements IProcessor {
  constructor(
    @InjectRepository(SampleEntity)
    private readonly sampleRepository: Repository<SampleEntity>,
  ) {}

  /**
   *
   * @param sampleRequestDto
   */
  async process(
    sampleRequestDto: SampleRequestDto,
  ): Promise<{ SampleResponseDto; boolean }> {
    const sample = new SampleEntity();
    sample.sample = sampleRequestDto.ping;
    sample.createdAt = new Date();
    sample.updatedAt = new Date();
    const insertResult = await this._insert(sample);

    // no new ids means row wasn't inserted due 'simple' column value duplicate
    const isNewResourcesAdded: boolean =
      insertResult.identifiers[0] !== undefined;

    // prepare answer
    const sampleResponseDto = new SampleResponseDto();
    sampleResponseDto.pong = 'Bar';

    return {
      SampleResponseDto: sampleResponseDto,
      boolean: isNewResourcesAdded,
    };
  }

  /**
   *
   * @param foo
   */
  getBarByFoo(foo: string): Promise<SampleEntity> {
    return this.sampleRepository.findOne({
      where: { sample: foo },
      order: { id: 'DESC' },
    });
  }

  /**
   *
   * @param sample
   */
  async _insert(sample: SampleEntity): Promise<InsertResult> {
    // query builder example (with generic types checks)
    return await this.sampleRepository
      .createQueryBuilder()
      .insert()
      .orIgnore(true)
      .into(SampleEntity)
      .values([sample])
      .execute();

    // raw query example for extraordinary complex queries
    // try to avoid it due to harder to support such code
    // const [
    //   escapedQuery,
    //   escapedParams,
    // ] = await this.sampleRepository.manager.connection.driver.escapeQueryWithParameters(
    //   'INSERT IGNORE INTO :tableName VALUES (:sample, :createAt :updateAt)',
    //   {
    //     tableName: this.sampleRepository.manager.connection.getMetadata(Sample)
    //       .tableName,
    //     sample: sample.sample,
    //     createAt: sample.createdAt,
    //     updateAt: sample.updatedAt,
    //   },
    //   {},
    // );
    // return await this.sampleRepository.manager.connection.query(
    //   escapedQuery,
    //   escapedParams,
    // );
  }
}
