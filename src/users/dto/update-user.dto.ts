// update-user.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  pictureUrl?: string;

  @IsOptional()
  @IsString()
  rank?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  userAlias?: string;
}
