import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail', // username または email
    });
  }

  async validate(usernameOrEmail: string, password: string): Promise<any> {
    try {
      return await this.authService.validateUser(usernameOrEmail, password);
    } catch (error) {
      throw new UnauthorizedException(
        'ユーザー名またはパスワードが正しくありません',
      );
    }
  }
}
