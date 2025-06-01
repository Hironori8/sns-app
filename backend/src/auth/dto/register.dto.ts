import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'ユーザー名は必須です' })
  @MinLength(3, { message: 'ユーザー名は3文字以上である必要があります' })
  @MaxLength(20, { message: 'ユーザー名は20文字以下である必要があります' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '表示名は必須です' })
  @MinLength(1, { message: '表示名は1文字以上である必要があります' })
  @MaxLength(50, { message: '表示名は50文字以下である必要があります' })
  displayName: string;

  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(6, { message: 'パスワードは6文字以上である必要があります' })
  @MaxLength(100, { message: 'パスワードは100文字以下である必要があります' })
  password: string;
}