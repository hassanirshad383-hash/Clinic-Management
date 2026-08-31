import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty({ example: 'Abdominal Ultrasound' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  reportType!: string;

  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  reportDate!: string;

  @ApiPropertyOptional({ enum: ReportStatus, default: ReportStatus.DRAFT })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
