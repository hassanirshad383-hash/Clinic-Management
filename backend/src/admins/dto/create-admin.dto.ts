import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12, {
    message: 'Password must be at least 12 characters long',
  })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ enum: AdminRole, default: AdminRole.STAFF })
  @IsEnum(AdminRole)
  role!: AdminRole;
}
