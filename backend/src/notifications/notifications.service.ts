import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Notification abstraction. Only a mock/dev provider is wired up today —
 * it logs what *would* be sent instead of actually sending anything.
 *
 * To go live: implement a real provider (email/SMS/WhatsApp) behind this
 * same interface and switch on EMAIL_PROVIDER / SMS_API_KEY once real
 * credentials exist. Never invent or hard-code provider credentials.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');
  private readonly provider: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('EMAIL_PROVIDER') ?? 'mock';
  }

  async notifyAppointmentRequested(payload: {
    id: string;
    patientName: string;
    requestedService: string;
  }): Promise<void> {
    this.dispatch('appointment.requested', payload);
  }

  async notifyAppointmentConfirmed(payload: {
    id: string;
    patientName: string;
  }): Promise<void> {
    this.dispatch('appointment.confirmed', payload);
  }

  async notifyAppointmentCancelled(payload: {
    id: string;
    patientName: string;
  }): Promise<void> {
    this.dispatch('appointment.cancelled', payload);
  }

  async notifyInquiryReceived(payload: {
    id: string;
    name: string;
  }): Promise<void> {
    this.dispatch('inquiry.received', payload);
  }

  private dispatch(event: string, payload: Record<string, unknown>): void {
    if (this.provider === 'mock') {
      this.logger.log(
        `[mock notification] ${event} — ${JSON.stringify(payload)}`,
      );
      return;
    }

    // A real provider would be dispatched here. Until EMAIL_API_KEY /
    // SMS_API_KEY are configured with real credentials, fall back to mock
    // behavior rather than failing the request.
    this.logger.warn(
      `Notification provider "${this.provider}" is not implemented yet; falling back to mock for ${event}`,
    );
  }
}
