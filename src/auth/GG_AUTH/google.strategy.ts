import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '146865982824-28vehedchbbv4s2pr8egik22r4h43gqp.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3456/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };

    done(null, user);
  }
}
