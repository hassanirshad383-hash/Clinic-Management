import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { validateEnv } from './config/env.validation.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

import { AuthModule } from './auth/auth.module.js';
import { AdminsModule } from './admins/admins.module.js';
import { ServicesModule } from './services/services.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { ClinicModule } from './clinic/clinic.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AuditModule } from './audit/audit.module.js';
import { HealthModule } from './health/health.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { FilesModule } from './files/files.module.js';

@Module({
    imports: [
          ConfigModule.forRoot({
                  isGlobal: true,
                  validate: validateEnv,
          }),

          // NOTE: @nestjs/throttler (rate limiting) was removed here because its
          // latest published release (6.5.0) is CommonJS and requires
          // @nestjs/common, which is ESM-only as of Nest 12 — the two cannot be
          // used together (require() of an ES Module fails at runtime). There is
          // currently no @nestjs/throttler release compatible with Nest 12.
          // Rate limiting on auth/public endpoints should be reintroduced (e.g.
          // once an ESM-compatible throttler ships, or via a custom guard).

          PrismaModule,

          AuthModule,
          AdminsModule,
          ServicesModule,
          AppointmentsModule,
          InquiriesModule,
          ClinicModule,
          DashboardModule,
          AuditModule,
          HealthModule,
          NotificationsModule,
          PatientsModule,
          ReportsModule,
          FilesModule,
        ],
    providers: [
          // Order matters: authenticate, then authorize.
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },

      { provide: APP_FILTER, useClass: AllExceptionsFilter },

      { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
      { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        ],
})
  export class AppModule {}
