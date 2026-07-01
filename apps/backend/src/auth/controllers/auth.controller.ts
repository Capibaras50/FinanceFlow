import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type express from 'express';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshDto } from '../dto/refresh.dto';

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

  @Post('refresh')
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.revokeRefreshToken(logoutDto.refreshToken);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.recoveryPassword(forgotPasswordDto.email);
  }

  @Get('recovery-password')
  recoveryPasswordRedirect(
    @Query('token') recoveryToken: string,
    @Res() res: Response,
  ) {
    const deepLink = `finance-flow://reset-password?token=${encodeURIComponent(recoveryToken || '')}`;
    res.redirect(302, deepLink);
  }

  @Post('reset-password')
  resetPassword(
    @Query('token') recoveryToken: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.changePassword(
      recoveryToken,
      resetPasswordDto.password,
    );
  }
}
