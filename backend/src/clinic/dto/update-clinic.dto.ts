import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateClinicDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiPropertyOptional({ example: '10:00 AM – 3:00 PM' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hours?: string;

  @ApiPropertyOptional({ example: '0332 5445555' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneDisplay?: string;

  @ApiPropertyOptional({ example: 'tel:+923325445555' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneHref?: string;
}
