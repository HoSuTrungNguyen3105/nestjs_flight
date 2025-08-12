export class BaseResponseDto<T> {
  resultCode: string;
  resultMessage: string;
  data?: T;
  list?: T[];
}
