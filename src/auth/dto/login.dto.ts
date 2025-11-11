import { IsEmail, IsString, Length } from 'class-validator';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  authType: string;

  @IsString()
  tempPassword: string | null;

  @IsString()
  userAgent: string;

  @IsString()
  ipAddress: string;

  @IsString()
  location: string;
}

export class MfaLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  authType: string;
}
