import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lấy token từ header Authorization: Bearer <token>
      secretOrKey: process.env.JWT_SECRET, // secret để verify token
    });
  }

  async validate(payload: any) {
    // payload là nội dung bên trong token
    // ví dụ: { sub: userId, email: user@example.com }
    return { userId: payload.sub, email: payload.email };
  }
}
