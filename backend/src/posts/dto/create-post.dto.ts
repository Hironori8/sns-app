import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '投稿内容は必須です' })
  @MinLength(1, { message: '投稿内容は1文字以上である必要があります' })
  @MaxLength(280, { message: '投稿内容は280文字以下である必要があります' })
  content: string;
}
