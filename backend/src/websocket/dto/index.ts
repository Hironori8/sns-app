// backend/src/websocket/dto/index.ts
export * from './websocket.dto';

// 型定義のみをエクスポート（よく使用されるもの）
export type {
  PostCreatedData,
  PostDeletedData,
  PostLikedData,
  UserConnectedData,
  UserDisconnectedData,
  OnlineUsersData,
  TypingData,
  ServerToClientEvents,
  ClientToServerEvents,
  WebSocketError,
  ConnectionStatus,
  WebSocketStats,
  RoomInfo,
} from './websocket.dto';

// DTOクラスのエクスポート（バリデーション用）
export {
  JoinRoomDto,
  LeaveRoomDto,
  TypingStartDto,
  TypingStopDto,
} from './websocket.dto';