// update-user.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma';

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsString()
  pictureUrl?: string;

  @IsString()
  rank?: string;

  @IsEnum(Role)
  role?: Role;

  @IsString()
  userAlias?: string;
}
