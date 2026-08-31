import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryInquiryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @ApiPropertyOptional({ description: 'Filter by createdAt (exact day)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
