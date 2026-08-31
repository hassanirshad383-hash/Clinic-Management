import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateInquiryDto {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
}
