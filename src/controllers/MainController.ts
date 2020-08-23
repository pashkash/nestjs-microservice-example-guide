import { Controller, Get } from '@nestjs/common';
import { MainService } from '../services/MainService';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/')
@ApiTags('v1')
export class MainController {
  constructor(private readonly mainService: MainService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'All right',
  })
  getStatus(): { status: string } {
    return this.mainService.getStatus();
  }
}
