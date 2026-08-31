import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategory } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    description: 'URL-safe unique identifier, e.g. "general-ultrasound"',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  @MaxLength(160)
  slug!: string;

  @ApiProperty({ enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(280)
  shortDescription!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  description!: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
