import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'ユーザー名またはメールアドレスは必須です' })
  identifier: string; // username or email

  @IsString()
  @IsNotEmpty({ message: 'パスワードは必須です' })
  password: string;
}
