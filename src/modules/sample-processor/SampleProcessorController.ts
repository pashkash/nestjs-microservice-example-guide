import { SampleProcessorService } from './SampleProcessorService';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiProduces,
  ApiOperation,
  ApiResponse,
  ApiDefaultResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SampleEntity } from './entities';
import { isString } from 'class-validator';
import { ValidationErrorException } from '../../exceptions';
import { SampleRequestDto, SampleResponseDto } from './dto';
import { ErrorResponseDto } from '../../dto';
import { ServerResponse } from 'http';
import { FastifyReply } from 'fastify';

/**
 * Class Purpose
 * Important notes reg how it works, in a nutshell
 */
@ApiTags('v1')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('v1')
export class SampleProcessorController {
  constructor(
    private readonly sampleProcessorService: SampleProcessorService,
  ) {}

  /**
   * Make sampleRequestDto response from special service method.
   *
   * @param sampleRequestDto
   * @param response
   */
  @Post('process')
  @ApiOperation({
    summary: 'Short description',
    description: `Long description / instructions`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All right, no new resources was created',
    type: SampleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'All right, new resources was created',
    type: SampleResponseDto,
  })
  @ApiDefaultResponse({
    description: 'Not all right. HTTP Code will reflect an error type',
    type: ErrorResponseDto,
  })
  async process(
    @Body() sampleRequestDto: SampleRequestDto,
    @Res() response: FastifyReply<ServerResponse>,
  ): Promise<FastifyReply<ServerResponse>> {
    // await validate(sampleRequestDto).then((errors) => {
    //   if (errors.length > 0) {
    //     throw new ValidationErrorException(errors.toString());
    //   }
    // });

    const {
      SampleResponseDto: sampleResponseDto,
      boolean: isNewResourcesAdded,
    } = await this.sampleProcessorService.process(sampleRequestDto);

    // Make a response with a ServerResponse object
    return (
      response
        // TODO: Move http code switching to interceptor
        // Change HttpStatus.OK to HttpStatus.NO_CONTENT for empty responses
        // https://restfulapi.net/tutorial/http-status/
        .status(isNewResourcesAdded ? HttpStatus.CREATED : HttpStatus.OK)
        .send(sampleResponseDto)
    );
  }

  /**
   * Make response with Entity directly from the Repository. Entity instance
   * transforms into JSON by ClassSerializerInterceptor which is globally set in
   * main.ts
   *
   * @param foo
   */
  @Get('bar/:foo')
  @ApiParam({
    name: 'foo',
    type: 'string',
    example: 'Foo',
  })
  @ApiOperation({
    summary: 'Another short description',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All right',
    type: SampleEntity,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All right, but empty, no message-body',
  })
  @ApiDefaultResponse({
    description: 'Not all right. HTTP Code will reflect an error type',
    type: ErrorResponseDto,
  })
  async getBarByFoo(@Param('foo') foo: string): Promise<SampleEntity> {
    if (!isString(foo)) {
      throw new ValidationErrorException("param 'foo' not a string type");
    }

    return this.sampleProcessorService.getBarByFoo(foo);
  }
}
