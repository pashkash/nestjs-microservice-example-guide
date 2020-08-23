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
