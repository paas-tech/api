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
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtEncodedUserData): Promise<RequestUser> {
    return { id: payload.sub, username: payload.username, isAdmin: payload.isAdmin };
  }
  
  private static extractFromCookie(req: Request): string|null {
    const name = AuthService.ACCESS_COOKIE_NAME;

    // this is dark magic as a work-around
    // the expressjs normal "req.cookies" always returns undefined for some reason
    // so this is the basic reimplementation of it
    const cookies: { [key: string]: string } = req.headers.cookie?.split('; ').reduce(
      (acc: { [key: string]: string }, cur: string) => {
        const split = cur.split('=');
        acc[split[0]] = split[1];
        return acc;
      },
      {}
    );

    if (
        cookies && 
        name in cookies && 
        cookies[name].length > 0
    ) {
      return cookies[name];
    }
    return null;
  }

}