import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtEncodedUserData, RequestUser } from '../types/jwt-user-data.type';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // load from cookie, and if not, from the bearer auth token
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractFromCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtEncodedUserData): Promise<RequestUser> {
    return { id: payload.sub, username: payload.username, isAdmin: payload.isAdmin };
  }

  private static extractFromCookie(req: Request): string | null {
    const name = AuthService.ACCESS_COOKIE_NAME;

    if (req.cookies && name in req.cookies && req.cookies[name].length > 0) {
      return req.cookies[name];
    }
    return null;
  }
}
