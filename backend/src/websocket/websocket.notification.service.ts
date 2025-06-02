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

interface CommentData {
  id: number;
  postId: number;
  content: string;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
  createdAt: Date;
}

@Injectable()
export class WebSocketNotificationService {
  private server: Server;

  setServer(server: Server) {
    if (!server) {
      console.error('Attempted to set null/undefined server in WebSocketNotificationService');
      return;
    }
    
    this.server = server;
    console.log('WebSocketNotificationService: Server instance set successfully');
    
    // Test the server instance
    if (typeof this.server.emit === 'function') {
      console.log('WebSocketNotificationService: Server emit function is available');
    } else {
      console.error('WebSocketNotificationService: Server instance has no emit function!');
    }
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
    if (!this.server) {
      console.error('Cannot notify post:liked - Server instance not available');
      return;
    }
    
    try {
      console.log(`Emitting post:liked event for postId: ${data.postId}`);
      this.server.emit('post:liked', data);
    } catch (error) {
      console.error('Error emitting post:liked event:', error);
    }
  }

  notifyPostUnliked(data: PostLikedData) {
    if (!this.server) {
      console.error('Cannot notify post:unliked - Server instance not available');
      return;
    }
    
    try {
      console.log(`Emitting post:unliked event for postId: ${data.postId}`);
      this.server.emit('post:unliked', data);
    } catch (error) {
      console.error('Error emitting post:unliked event:', error);
    }
  }

  // コメント作成通知
  notifyCommentCreated(data: CommentData) {
    if (!this.server) {
      console.error('Cannot notify comment:created - Server instance not available');
      return;
    }
    
    try {
      console.log(`Emitting comment:created event for postId: ${data.postId}, commentId: ${data.id}`);
      this.server.emit('comment:created', data);
    } catch (error) {
      console.error('Error emitting comment:created event:', error);
    }
  }

  // コメント削除通知
  notifyCommentDeleted(data: { id: number; postId: number }) {
    if (!this.server) {
      console.error('Cannot notify comment:deleted - Server instance not available');
      return;
    }
    
    try {
      console.log(`Emitting comment:deleted event for postId: ${data.postId}, commentId: ${data.id}`);
      this.server.emit('comment:deleted', data);
    } catch (error) {
      console.error('Error emitting comment:deleted event:', error);
    }
  }
}