import { IsOptional, IsString, IsNumberString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PostQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'ページは1以上である必要があります' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'ページサイズは1以上である必要があります' })
  @Max(50, { message: 'ページサイズは50以下である必要があります' })
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  userId?: number;
}
