import { Module, OnModuleInit } from '@nestjs/common';
import { WebsocketGatewayService } from './websocket.gateway.service';
import { WebSocketService } from './websocket.service';
import { WebSocketNotificationService } from './websocket.notification.service';
import { AuthModule } from '../auth/auth.module';

// Service to initialize the WebSocket notification service with the server instance
import { Injectable } from '@nestjs/common';

@Injectable()
class WebSocketInitService implements OnModuleInit {
  constructor(
      private readonly gatewayService: WebsocketGatewayService,
      private readonly notificationService: WebSocketNotificationService,
  ) {}

  async onModuleInit() {
    console.log('Starting WebSocket server initialization...');
    
    // AfterInit完了まで十分な時間を待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      if (!this.gatewayService) {
        throw new Error('Gateway service is not available');
      }
      
      console.log('Gateway service found, checking for server...');
      
      // サーバーが初期化されているか確認
      if (!this.gatewayService.server) {
        throw new Error('Server not initialized in gateway service');
      }
      
      // Notificationサービスにサーバーインスタンスを設定
      this.notificationService.setServer(this.gatewayService.server);
      console.log('✅ WebSocket notification service successfully initialized with server instance');
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket notification service:', error.message);
    }
  }
}

@Module({
  imports: [AuthModule],
  providers: [
    WebsocketGatewayService,
    WebSocketService,
    WebSocketNotificationService,
    WebSocketInitService
  ],
  exports: [WebsocketGatewayService, WebSocketService, WebSocketNotificationService],
})
export class WebSocketModule {}