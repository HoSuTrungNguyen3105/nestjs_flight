export class BaseResponseDto<T> {
  resultCode: string;
  resultMessage: string;
  data?: T | null; // 👈 thêm null
  list?: T[] | null; // 👈 thêm null
}
