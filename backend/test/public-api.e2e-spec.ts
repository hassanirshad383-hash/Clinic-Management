import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

// Requires a real, migrated, seeded PostgreSQL database (see health.e2e-spec.ts).
describe('Public API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/services returns only active services, paginated', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/services');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toEqual(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
    for (const service of response.body.data) {
      expect(service.isActive).toBe(true);
    }
  });

  it('GET /api/v1/clinic returns the seeded clinic information', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/clinic');

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Irfan Diagnostic Centre');
  });

  it('rejects an appointment request with an invalid phone number', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .send({
        patientName: 'Test Patient',
        patientPhone: 'not-a-phone-number!!',
        requestedService: 'General Ultrasound',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts a valid appointment request', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .send({
        patientName: 'Test Patient',
        patientPhone: '03325445555',
        requestedService: 'General Ultrasound',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('PENDING');
  });

  it('rejects extra/unexpected fields on the inquiry form', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send({
        name: 'Test',
        phone: '03325445555',
        message: 'Hello',
        adminRole: 'SUPER_ADMIN', // mass-assignment attempt
      });

    expect(response.status).toBe(400);
  });

  it('blocks bot submissions via the honeypot field', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/inquiries')
      .send({
        name: 'Bot',
        phone: '03325445555',
        message: 'Spam',
        website: 'http://spam.example.com',
      });

    expect(response.status).toBe(400);
  });

  it('denies unauthenticated access to admin-only routes', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/appointments',
    );

    expect(response.status).toBe(401);
  });

  it('denies access to patient records without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/patients');
    expect(response.status).toBe(401);
  });
});
