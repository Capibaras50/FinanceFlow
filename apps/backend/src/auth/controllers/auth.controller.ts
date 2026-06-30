import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import { AuthService } from '../services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  login(@Req() req: express.Request) {
    const user = req.user as User;
    return this.authService.login({ sub: user.id, profileId: user.profile.id });
  }
}
