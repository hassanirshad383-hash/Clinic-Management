import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiProperty({ example: '03325445555' })
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;

  // Honeypot: real users never see or fill this field (hidden via CSS on
  // the frontend). Bots that fill every field trip it, and the submission
  // is silently dropped without revealing that spam protection ran.
  @ApiPropertyOptional({ description: 'Leave empty — anti-spam honeypot field' })
  @IsOptional()
  @IsString()
  @MaxLength(0, { message: 'website must be empty' })
  website?: string;
}
