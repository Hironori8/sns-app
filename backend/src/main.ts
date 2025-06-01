import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './adapters/redis.adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigServiceを取得
  const configService = app.get(ConfigService);

  // Cookie parser設定
  app.use(cookieParser());

  // CORS設定
  app.enableCors({
    origin: ['http://localhost:3000'], // Next.jsのURL
    credentials: true, // httpOnly cookieを含める
  });

  // バリデーションパイプ設定
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Redis Adapter設定（WebSocket用）- Redis接続に問題があれば一時的にコメントアウト
  // const redisIoAdapter = new RedisIoAdapter(configService);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);
  
  // 標準のWebSocketアダプタを使用
  const { IoAdapter } = require('@nestjs/platform-socket.io');
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3001);
  console.log('🚀 Backend server running on http://localhost:3001');
}
bootstrap();
