import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Only what is genuinely required to contact and schedule the patient.
// No medical history, diagnosis, medications, ID numbers, or financial data.
export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  patientName!: string;

  @ApiProperty({ example: '03325445555' })
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'patientPhone must be a valid phone number',
  })
  patientPhone!: string;

  @ApiProperty({ description: 'Name of the requested ultrasound service' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  requestedService!: string;

  @ApiPropertyOptional({ example: '2026-09-15' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional({ example: '11:00 AM' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  preferredTime?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
