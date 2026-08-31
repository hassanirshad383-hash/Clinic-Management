import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
  const isProduction = nodeEnv === 'production';

  // --- Security middleware ---
  app.use(helmet());
  app.use(cookieParser());

  const corsOrigins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  // --- Validation ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // --- API versioning: /api/v1/... ---
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // --- API documentation (dev/staging only; disabled in production) ---
  if (!isProduction) {
    const documentConfig = new DocumentBuilder()
      .setTitle('Dr. Hassan Irshad — Ultrasound Clinic API')
      .setDescription(
        'Backend API for the Ultrasound Clinic website and admin dashboard.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  Logger.log(
    `Application running on port ${port} [${nodeEnv}]`,
    'Bootstrap',
  );
}

void bootstrap();
