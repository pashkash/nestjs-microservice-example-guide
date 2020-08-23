import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  constructor(data: Required<ErrorResponseDto>) {
    Object.assign(this, data);
  }

  @ApiProperty({
    description: 'The type of the Exception',
    type: String,
    example: 'ExampleErrorType',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'The message of the Exception',
    type: String,
    example: 'Details if any',
  })
  @IsString()
  message: string;
}
