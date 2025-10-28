import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private clientId: string;

  constructor() {
    this.clientId = Math.random().toString(36).substring(7);
  }

  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(`${WS_URL}/ws/prices/${this.clientId}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'price_update') {
          const symbol = data.symbol;
          const callbacks = this.subscribers.get(symbol);
          
          if (callbacks) {
            callbacks.forEach(callback => callback(data.data));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscribers.clear();
    }
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    
    this.subscribers.get(symbol)!.add(callback);

    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        type: 'subscribe',
        symbol
      }));
    }
  }

  unsubscribe(symbol: string, callback?: (data: any) => void) {
    if (callback) {
      this.subscribers.get(symbol)?.delete(callback);
    } else {
      this.subscribers.delete(symbol);
    }

    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        type: 'unsubscribe',
        symbol
      }));
    }
  }

  sendPing() {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify({
        type: 'ping'
      }));
    }
  }
}

export const websocketService = new WebSocketService();

