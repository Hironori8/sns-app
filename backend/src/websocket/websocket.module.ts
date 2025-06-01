import { Module } from '@nestjs/common';
import { WebsocketGatewayService } from './websocket.gateway.service';
import { WebSocketService } from './websocket.service';
import { WebSocketNotificationService } from './websocket.notification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WebsocketGatewayService, WebSocketService, WebSocketNotificationService],
  exports: [WebsocketGatewayService, WebSocketService, WebSocketNotificationService],
})
export class WebSocketModule {}