export class BaseResponseDto<T = null> {
  resultCode: string;
  resultMessage: string;
  data?: T | null;
  list?: T[] | null;
}
