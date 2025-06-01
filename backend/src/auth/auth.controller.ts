// backend/src/auth/auth.controller.ts (推奨版)
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public, CurrentUser } from './decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // ユーザー登録
    const authResponse = await this.authService.register(registerDto);

    // JWTトークン生成
    const token = this.authService.generateJwtToken(authResponse.user);

    // httpOnly Cookieにトークンを設定
    this.setTokenCookie(response, token);

    return authResponse;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // ログイン認証
    const authResponse = await this.authService.login(loginDto);

    // JWTトークン生成
    const token = this.authService.generateJwtToken(authResponse.user);

    // httpOnly Cookieにトークンを設定
    this.setTokenCookie(response, token);

    return authResponse;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    // Cookieをクリア
    this.clearTokenCookie(response);

    return {
      message: 'ログアウトしました',
    };
  }

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user,
      message: 'ユーザー情報を取得しました',
    };
  }

  @Public()
  @Get('check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(@CurrentUser() user?: any) {
    return {
      isAuthenticated: !!user,
      user: user || null,
    };
  }

  // プライベートメソッド：Cookieにトークンを設定
  private setTokenCookie(response: Response, token: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
      path: '/',
    };

    response.cookie('access_token', token, cookieOptions);
  }

  // プライベートメソッド：Cookieをクリア
  private clearTokenCookie(response: Response): void {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    });
  }
}