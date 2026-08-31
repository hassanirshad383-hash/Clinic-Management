import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { PatientGender } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// Minimal fields only, per the clinic's privacy-by-design policy. No
// national ID, medical history, or financial information belongs here.
export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: PatientGender })
  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;
}
