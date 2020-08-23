import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SampleResponseDto {
  @ApiProperty({
    description: 'Sample string',
    type: String,
    example: 'Bar',
  })
  @IsString()
  pong: string;
}
