import { io, Socket } from 'socket.io-client';

type EventCallback = (data?: any) => void;

class NativeWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectTimer: any = null;
  private reconnectDelay = 2000;
  private shouldReconnect = true;
  public connected = false;

  constructor(targetUrl: string) {
    // Konversi http(s):// menjadi ws(s)://
    let wsUrl = targetUrl.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');

    // Pastikan mengarah ke endpoint /ws di backend Go
    if (!wsUrl.endsWith('/ws')) {
      wsUrl = wsUrl.replace(/\/+$/, '') + '/ws';
    }

    this.url = wsUrl;
    this.connect();
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectDelay = 2000;
        console.log(`[WebSocket Go] Connected to ${this.url}`);
        this.emitLocal('connect');
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.event) {
            this.emitLocal(payload.event, payload.data);
          } else {
            this.emitLocal('QUEUE_UPDATED', payload);
          }
        } catch {
          this.emitLocal('message', event.data);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.emitLocal('disconnect');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket Go] Connection error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.error('[WebSocket Go] Init error:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
      this.connect();
    }, this.reconnectDelay);
  }

  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback?: EventCallback): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      this.listeners.get(event)!.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  public emit(event: string, data?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  private emitLocal(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[WebSocket] Error in handler for event "${event}":`, err);
        }
      });
    }
  }
}

const rawUrl =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

// Jika mengarah ke Go backend (:8080): gunakan NativeWebSocketClient (/ws)
// Jika mengarah ke Express backend (:3000): gunakan io() Socket.IO client
const isGoBackend = rawUrl.includes(':8080') || rawUrl.endsWith('/ws');

export const socket: Socket | any = isGoBackend
  ? new NativeWebSocketClient(rawUrl)
  : io(rawUrl, { autoConnect: true });
