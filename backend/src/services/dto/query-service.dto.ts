import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryServiceDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
