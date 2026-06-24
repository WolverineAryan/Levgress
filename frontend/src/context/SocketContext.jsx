import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { SOCKET_URL } from '../config/env';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.io server
    const socketInstance = io(SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected E2E:', socketInstance.id);
      // Join user's personal notification room
      socketInstance.emit('join', user._id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
