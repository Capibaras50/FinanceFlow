import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Payload } from 'src/models/payload.model';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/models/env.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env>) {
    const secretAccessToken = config.get('SECRET_ACCESS_KEY', { infer: true });
    const expiresAccessToken = config.get('EXPIRES_ACCESS_KEY', {
      infer: true,
    });
    const secretRefreshToken = config.get('SECRET_REFRESH_KEY', {
      infer: true,
    });
    const expiresRefreshToken = config.get('EXPIRES_REFRESH_KEY', {
      infer: true,
    });
    if (!secretAccessToken) {
      throw Error('Secret Access Token is not configured');
    }
    if (!expiresAccessToken) {
      throw Error('Expires Time Of Access Token is not configured');
    }
    if (!secretRefreshToken) {
      throw Error('Secret Refresh Token is not configured');
    }
    if (!expiresRefreshToken) {
      throw Error('Expires Time Of Refresh Token is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretAccessToken,
    });
  }

  validate(payload: Payload) {
    return { userId: payload.sub, profileId: payload.profileId };
  }
}
