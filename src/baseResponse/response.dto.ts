import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class BaseResponseDto<T = null> {
  resultCode: string;
  resultMessage: string;
  data?: T | null;
  list?: T[] | null;
}
export interface UserPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// export const GetUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): UserPayload => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );
