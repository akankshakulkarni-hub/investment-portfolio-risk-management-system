import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket(eventHandlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(eventHandlers);

  // Keep handlers ref current without re-running the effect
  useEffect(() => {
    handlersRef.current = eventHandlers;
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Wrap each handler so it always calls the latest version
    const wrappedHandlers = {};
    Object.keys(handlersRef.current).forEach((event) => {
      wrappedHandlers[event] = (...args) => handlersRef.current[event]?.(...args);
      socket.on(event, wrappedHandlers[event]);
    });

    return () => {
      Object.entries(wrappedHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, []); // runs once — stable socket lifetime
}