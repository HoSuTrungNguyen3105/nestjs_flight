export function responseSuccess<T>(
  data: T,
  message = 'Thành công',
  code = '00',
) {
  return {
    code,
    message,
    ...data,
  };
}

export function responseError(message = 'Đã xảy ra lỗi', code = '99') {
  return {
    code,
    message,
  };
}
