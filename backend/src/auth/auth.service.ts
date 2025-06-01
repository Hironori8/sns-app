import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { AuthResponse, JwtPayload } from '../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ユーザー登録
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, displayName, email, password } = registerDto;

    // ユーザー名の重複確認
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('このユーザー名は既に使用されています');
    }

    // メールアドレスの重複確認
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // パスワードハッシュ化
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    try {
      // ユーザー作成
      const user = await this.prisma.user.create({
        data: {
          username,
          displayName,
          email,
          passwordHash,
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          createdAt: true,
        },
      });

      return {
        user,
        message: 'ユーザー登録が完了しました',
      };
    } catch (error) {
      throw new BadRequestException('ユーザー登録に失敗しました');
    }
  }

  // ログイン
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { identifier, password } = loginDto;

    // ユーザー検索（ユーザー名またはメールアドレス）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザー名またはパスワードが正しくありません');
    }

    // パスワード確認
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('ユーザー名またはパスワードが正しくありません');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: 'ログインに成功しました',
    };
  }

  // JWTトークン生成
  generateJwtToken(user: { id: number; username: string; email: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  // JWTトークン検証
  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('無効なトークンです');
    }

    return user;
  }

  // ユーザー情報取得
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    return user;
  }

  // 下位互換用メソッド（既存のコードとの互換性のため）
  async validateUser(usernameOrEmail: string, password: string) {
    // ユーザー名またはメールアドレスでユーザーを検索
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザー名またはパスワードが正しくありません');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ユーザー名またはパスワードが正しくありません');
    }

    // パスワードを除いたユーザー情報を返す
    const { passwordHash, ...result } = user;
    return result;
  }
}