import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

interface PostCreatedData {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    displayName: string;
  };
  createdAt: Date;
  likeCount: number;
}

interface PostLikedData {
  postId: number;
  userId: number;
  username: string;
  likeCount: number;
  isLiked: boolean;
}

@Injectable()
export class WebSocketNotificationService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  notifyPostCreated(data: PostCreatedData) {
    if (this.server) {
      this.server.emit('post:created', data);
    }
  }

  notifyPostDeleted(data: { id: number; authorId: number }) {
    if (this.server) {
      this.server.emit('post:deleted', data);
    }
  }

  notifyPostLiked(data: PostLikedData) {
    if (this.server) {
      this.server.emit('post:liked', data);
    }
  }

  notifyPostUnliked(data: PostLikedData) {
    if (this.server) {
      this.server.emit('post:unliked', data);
    }
  }
}