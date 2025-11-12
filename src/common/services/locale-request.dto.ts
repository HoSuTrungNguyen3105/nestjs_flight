import { IsString, Length } from 'class-validator';

export class LocaleRequestDto {
  @IsString()
  @Length(2, 5)
  language: string; // ví dụ: 'ko', 'en', 'vi'

  @IsString()
  @Length(3, 3)
  currency: string; // ví dụ: 'JPY', 'USD', 'VND'
}
