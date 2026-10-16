import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socketInstance = null;

export function getSocket() {
  return socketInstance;
}

export function useSocket() {
  const { user, accessToken } = useAuthStore();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Not logged in → disconnect
    if (!user) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setConnected(false);
      }
      return;
    }

    // No token yet (still loading login) → wait for next render
    if (!accessToken) return;

    // Already connected with the same token → skip
    if (socketInstance?.connected) {
      setConnected(true);
      return;
    }

    // Reconnect if token changed
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socketInstance = io(url, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));
    socketInstance.on('connect_error', (err) => {
      console.warn('[socket] connect_error:', err.message);
      setConnected(false);
    });

    return () => { cancelled = true; };
  }, [user, accessToken]);

  return { socket: socketInstance, connected };
}