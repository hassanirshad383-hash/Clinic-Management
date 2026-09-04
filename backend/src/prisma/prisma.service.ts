import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    // Falls back to POSTGRES_PRISMA_URL / POSTGRES_URL so this works out of
    // the box with Vercel's Neon integration, which does not create a plain
    // DATABASE_URL variable.
    const connectionString =
      config.get<string>('DATABASE_URL') ??
      config.get<string>('POSTGRES_PRISMA_URL') ??
      config.getOrThrow<string>('POSTGRES_URL');

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
