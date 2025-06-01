import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [LikesModule],
  controllers: [UsersController],
})
export class UsersModule {}