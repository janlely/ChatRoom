import WebSocket, { WebSocketServer } from 'ws';

interface WebSocketMessage {
  type: 'auth' | 'ping' | 'pong' | 'message' | 'auth_response';
  payload?: string;
  token?: string;
}

interface ClientInfo {
  id: string;
}

const wss = new WebSocketServer({ port: 8080 });
const authenticatedClients = new Map<WebSocket, ClientInfo>();

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // 心跳标记
  (ws as any).isAlive = true;
  ws.on('pong', () => {
    (ws as any).isAlive = true;
  });

  ws.on('message', (message: string) => {
    try {
      const data: WebSocketMessage = JSON.parse(message);

      // 身份认证
      if (data.type === 'auth') {
        const token = data.token;
        if (token === 'your-auth-token') {
          authenticatedClients.set(ws, { id: `client_${Math.random().toString(36).slice(2)}` });
          ws.send(JSON.stringify({ type: 'auth_response', payload: 'Authentication successful' }));
        } else {
          ws.send(JSON.stringify({ type: 'auth_response', payload: 'Authentication failed' }));
          ws.close();
        }
      }

      // 心跳处理
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }

      // 消息广播
      if (data.type === 'message' && authenticatedClients.has(ws) && data.payload) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && authenticatedClients.has(client)) {
            client.send(JSON.stringify({ type: 'message', payload: data.payload }));
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    authenticatedClients.delete(ws);
  });

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
    authenticatedClients.delete(ws);
  });
});

// 心跳检测
setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    if (!(ws as any).isAlive) {
      authenticatedClients.delete(ws);
      return ws.terminate();
    }
    (ws as any).isAlive = false;
    ws.ping();
  });
}, 30000);

console.log('WebSocket server running on ws://localhost:8080');