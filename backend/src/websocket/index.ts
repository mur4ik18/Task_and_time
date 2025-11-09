import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyAccessToken } from '../utils/jwt';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export const setupWebSocket = (server: Server): void => {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection');

    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        // Authenticate user
        if (data.type === 'auth' && data.token) {
          try {
            const decoded = verifyAccessToken(data.token);
            ws.userId = decoded.id;
            ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid token' }));
            ws.close();
          }
        }

        // Handle timer sync
        if (data.type === 'timer-sync' && ws.userId) {
          broadcast(wss, ws.userId, {
            type: 'timer-sync',
            sessionId: data.sessionId,
            elapsedTime: data.elapsedTime,
            isRunning: data.isRunning,
          });
        }

        // Handle session updates
        if (data.type === 'session-update' && ws.userId) {
          broadcast(wss, ws.userId, {
            type: 'session-update',
            action: data.action,
            session: data.session,
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

// Broadcast message to all clients of a specific user
const broadcast = (wss: WebSocketServer, userId: number, message: any): void => {
  wss.clients.forEach((client: AuthenticatedWebSocket) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

