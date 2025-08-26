export class BaseResponseDto<T = null> {
  resultCode: string;
  resultMessage: string;
  data?: T | null; // 👈 thêm null
  list?: T[] | null; // 👈 thêm null
}
