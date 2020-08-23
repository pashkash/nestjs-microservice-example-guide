import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
  DNSHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('monitoring')
export default class HealthController {
  constructor(
    private health: HealthCheckService,
    private memoryHealth: MemoryHealthIndicator,
    private db: TypeOrmHealthIndicator,
    // private ms: MicroserviceHealthIndicator,
    private dns: DNSHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ operationId: 'check' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> =>
        this.memoryHealth.checkHeap('memory_heap', 200 * 1024 * 1024),
      async (): Promise<HealthIndicatorResult> =>
        this.memoryHealth.checkRSS('memory_rss', 200 * 1024 * 1024),
      async (): Promise<HealthIndicatorResult> =>
        this.db.pingCheck('postgree database', { timeout: 1500 }),
      async (): Promise<HealthIndicatorResult> =>
        this.dns.pingCheck('microservice http', 'http://localhost:3000'),
    ]);
  }
}
