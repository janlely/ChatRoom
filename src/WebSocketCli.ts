interface WebSocketMessage {
  msgId?: number;
  type: 'register' | 'login' | 'auth' | 'pingpong' | 'message' | 'getCurrentUser' | 'getAvailableUsers' | 'logout' | 'changeUser';
  payload?: any;
}

interface WebSocketClient {
  connect: (url: string) => Promise<ConnectedWebSocketClient>;
}

interface ConnectedWebSocketClient {
  sendMessage: (message: WebSocketMessage, callback?: MessageCallback) => void;
  disconnect: () => void;
}

let client: WebSocketClient | null = null;
let messageCallbackMap: Map<number, MessageCallback> = new Map();

export const getWebSocketClient = (): WebSocketClient => {
  if (!client) {
    client = createWebSocketClient();
  }
  return client;
};

type MessageCallback = (response: WebSocketMessage) => void;

const createWebSocketClient = (): WebSocketClient => {
  let ws: WebSocket | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let msgId = 0;

  const connect = async (url: string): Promise<ConnectedWebSocketClient> => {
    console.log('Before connect - messageCallbackMap:', messageCallbackMap);
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        resolve({
          sendMessage,
          disconnect
        });
        return;
      }
      ws = new WebSocket(url);
      ws.onopen = () => {
        console.log('WebSocket Connected');
        resolve({
          sendMessage,
          disconnect
        });
      };

      ws.onmessage = (event: WebSocketMessageEvent) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('Received message:', data);
          console.log('Current messageCallbackMap size:', messageCallbackMap.size);
          console.log('MessageCallbackMap entries:', Array.from(messageCallbackMap.entries()));
          let callback = messageCallbackMap.get(data.msgId!);
          console.log('Found callback for msgId', data.msgId, ':', callback ? 'yes' : 'no');
          if (callback) {
            callback(data);
            messageCallbackMap.delete(data.msgId!);
            console.log('After callback execution - messageCallbackMap size:', messageCallbackMap.size);
            console.log('MessageCallbackMap entries:', Array.from(messageCallbackMap.entries()));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error: Event) => {
        console.error('WebSocket Error:', error);
        reject(error);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
      };
    });
  };

  const sendMessage = (message: WebSocketMessage, callback?: MessageCallback) => {
    console.log('Before sendMessage - messageCallbackMap size:', messageCallbackMap.size);
    if (ws && ws.readyState === WebSocket.OPEN && message) {
      msgId++
      console.log('Current msgId:', msgId);
      if (callback) {
        messageCallbackMap.set(msgId, callback)
        console.log('After setting callback - messageCallbackMap size:', messageCallbackMap.size);
        console.log('MessageCallbackMap entries:', Array.from(messageCallbackMap.entries()));
      };
      ws.send(JSON.stringify({...message, msgId: msgId}));
    }
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

  return { connect };
};