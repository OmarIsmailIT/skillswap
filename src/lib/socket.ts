// src/lib/socket.ts
/**
 * Emit a credit update event to a specific user
 */
export function emitCreditUpdate(userId: string, credits: { current: number; reserved: number }) {
  // @ts-ignore - io is set globally by server.mjs
  const io = global.io;
  
  if (!io) {
    console.warn('⚠️ Socket.io server not available');
    return;
  }

  io.to(`user:${userId}`).emit('credit-updated', credits);

}

/**
 * Emit a booking update event to specific users
 */
export function emitBookingUpdate(userIds: string[], booking: any) {
  // @ts-ignore - io is set globally by server.mjs
  const io = global.io;
  
  if (!io) {
    console.warn('⚠️ Socket.io server not available');
    return;
  }

  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('booking-updated', booking);

  });
}

/**
 * Emit a notification to a specific user
 */
export function emitNotification(userId: string, notification: {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
}) {
  // @ts-ignore - io is set globally by server.mjs
  const io = global.io;
  
  if (!io) {
    console.warn('⚠️ Socket.io server not available');
    return;
  }

  io.to(`user:${userId}`).emit('notification', notification);

}

/**
 * Broadcast a general event to all connected clients
 */
export function broadcastEvent(event: string, data: any) {
  // @ts-ignore - io is set globally by server.mjs
  const io = global.io;
  
  if (!io) {
    console.warn('⚠️ Socket.io server not available');
    return;
  }

  io.emit(event, data);

}
