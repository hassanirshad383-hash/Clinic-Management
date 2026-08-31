import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API and database health check' })
  async check() {
    let databaseConnected = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseConnected = false;
    }

    return {
      status: databaseConnected ? 'ok' : 'degraded',
      database: databaseConnected ? 'connected' : 'unavailable',
      environment: this.config.get<string>('NODE_ENV') ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
