import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleProcessorService } from './SampleProcessorService';
import { SampleProcessorController } from './SampleProcessorController';
import { SampleEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([SampleEntity])],
  providers: [SampleProcessorService],
  controllers: [SampleProcessorController],
  exports: [SampleProcessorService],
})
export class SampleProcessorModule {}
