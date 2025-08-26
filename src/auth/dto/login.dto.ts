import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  tempPassword: string | null;
}
export class MfaLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string; // mã 6 số từ Google Authenticator
}
