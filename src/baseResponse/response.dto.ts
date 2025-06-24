export class BaseResponseDto<T> {
  resultCode: number;
  resultMessage: string;
  list?: T[];
}
