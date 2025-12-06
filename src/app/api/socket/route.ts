// src/app/api/socket/route.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextResponse } from 'next/server';

let io: SocketServer | null = null;

export async function GET(req: Request) {
  if (!io) {
    return NextResponse.json({ 
      error: 'WebSocket server not initialized. Please restart the dev server.' 
    }, { status: 503 });
  }

  return NextResponse.json({ 
    status: 'WebSocket server is running',
    connectedClients: io.engine.clientsCount 
  });
}

// Initialize socket server
export function initializeSocket(httpServer: HTTPServer) {
  if (io) {

    return io;
  }

  io = new SocketServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {


    // Handle user authentication
    socket.on('authenticate', (userId: string) => {
      if (userId) {
        socket.data.userId = userId;
        socket.join(`user:${userId}`);

      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {

    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });


  return io;
}

// Get the socket server instance
export function getSocketServer(): SocketServer | null {
  return io;
}
