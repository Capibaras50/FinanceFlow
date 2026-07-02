/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Env } from 'src/models/env.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService<Env>) {
    const clientID = config.get('GOOGLE_CLIENT_ID', { infer: true });
    const clientSecret = config.get('GOOGLE_CLIENT_SECRET', { infer: true });
    const callbackURL = config.get('GOOGLE_CALLBACK_URL', { infer: true });
    if (!clientID) {
      throw new Error('The Client ID is not configured');
    }
    if (!clientSecret) {
      throw new Error('The Client Secret is not configured');
    }
    if (!callbackURL) {
      throw new Error('The Callback Url is not configured');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { name, emails, photos } = profile;
    const user = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email: emails?.[0]?.value,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      firstName: name?.givenName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lastName: name?.familyName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    done(null, user);
  }
}
