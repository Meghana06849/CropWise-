import { io } from 'socket.io-client';

const realtimeEnabled =
  import.meta.env.VITE_ENABLE_REALTIME !== 'false' &&
  (import.meta.env.DEV || Boolean(import.meta.env.VITE_SOCKET_URL));

const socketUrl = realtimeEnabled
  ? import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)
  : null;

export const isRealtimeEnabled = Boolean(socketUrl);

export const socket = socketUrl
  ? io(socketUrl, {
      autoConnect: false,
      transports: ['websocket']
    })
  : null;
