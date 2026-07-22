import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Query,
  Body,
  Res,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type express from 'express';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/models/env.model';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<Env>,
  ) {}

  private cookieOpts(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production'
          ? ('strict' as const)
          : ('lax' as const),
      path: '/',
      maxAge,
    };
  }

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    const tokens = await this.authService.login({
      sub: user.id,
      profileId: user.profile.id,
      role: user.role,
    });
    res.cookie(
      'accessToken',
      tokens.accessToken,
      this.cookieOpts(15 * 60 * 1000),
    );
    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.cookieOpts(7 * 24 * 60 * 60 * 1000),
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken: string | null =
      refreshDto?.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshToken(refreshToken);
    res.cookie(
      'accessToken',
      tokens.accessToken,
      this.cookieOpts(15 * 60 * 1000),
    );
    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.cookieOpts(7 * 24 * 60 * 60 * 1000),
    );
    return tokens;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken: string | null =
      req.cookies?.refreshToken || logoutDto?.refreshToken;
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.recoveryPassword(forgotPasswordDto.email);
  }

  @Get('recovery-password')
  recoveryPasswordRedirect(
    @Query('token') recoveryToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.get('user-agent') || '';
    const isMobile = /android/i.test(userAgent);
    const encodedToken = encodeURIComponent(recoveryToken || '');
    if (isMobile) {
      const deepLink = `finance-flow://reset-password?token=${encodedToken}`;
      return res.redirect(302, deepLink);
    }
    const webLink = `${this.configService.get('WEB_URL', { infer: true })}/reset-password?token=${encodedToken}`;
    return res.redirect(302, webLink);
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

  @UseGuards(GoogleOAuthGuard)
  @Get()
  async googleAuth() {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google-redirect')
  async googleAuthRedirect(@Req() req: express.Request, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req);
    const userAgent = req.get('user-agent') || '';
    const isMobile = /android/i.test(userAgent);
    const encodedAccessToken = encodeURIComponent(tokens.accessToken || '');
    const encodedRefreshToken = encodeURIComponent(tokens.refreshToken || '');
    if (isMobile) {
      const deepLink = `finance-flow://oauth?accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}`;
      return res.redirect(302, deepLink);
    }
    res.cookie(
      'accessToken',
      tokens.accessToken,
      this.cookieOpts(15 * 60 * 1000),
    );
    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.cookieOpts(7 * 24 * 60 * 60 * 1000),
    );
    const webLink = `${this.configService.get('WEB_URL', { infer: true })}/home`;
    return res.redirect(302, webLink);
  }
}
