interface WebSocketMessage {
  type: 'auth' | 'ping' | 'pong' | 'message' | 'auth_response';
  payload?: string;
  token?: string;
}

interface WebSocketClient {
  connect: (url: string, token: string) => void;
  sendMessage: (message: string) => void;
  onMessage: (callback: (message: string) => void) => void;
  disconnect: () => void;
}

let client: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!client) {
    client = createWebSocketClient();
  }
  return client;
};

const createWebSocketClient = (): WebSocketClient => {
  let ws: WebSocket | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let messageCallback: ((message: string) => void) | null = null;

  const connect = (url: string, token: string) => {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      // 发送身份认证消息
      const authMessage: WebSocketMessage = { type: 'auth', token };
      ws?.send(JSON.stringify(authMessage));

      // 启动心跳机制
      heartbeatInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === 'pong') {
          console.log('Received pong');
        } else if (data.type === 'message' && data.payload) {
          messageCallback?.(data.payload);
        } else if (data.type === 'auth_response') {
          console.log('Auth response:', data.payload);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    };
  };

  const sendMessage = (message: string) => {
    if (ws && ws.readyState === WebSocket.OPEN && message) {
      const msg: WebSocketMessage = { type: 'message', payload: message };
      ws.send(JSON.stringify(msg));
    }
  };

  const onMessage = (callback: (message: string) => void) => {
    messageCallback = callback;
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

  return { connect, sendMessage, onMessage, disconnect };
};