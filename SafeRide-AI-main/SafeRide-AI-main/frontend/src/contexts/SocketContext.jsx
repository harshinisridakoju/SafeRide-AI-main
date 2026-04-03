import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      // Notification events
      newSocket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.ico',
          });
        }
      });

      // Request events
      newSocket.on('new_request_alert', (data) => {
        console.log('New request alert:', data);
      });

      newSocket.on('request_status_updated', (data) => {
        console.log('Request status updated:', data);
      });

      newSocket.on('provider_location_update', (data) => {
        console.log('Provider location update:', data);
      });

      // Emergency events
      newSocket.on('emergency_alert', (data) => {
        console.log('Emergency alert:', data);
        // Could trigger special UI for emergency alerts
      });

      // Chat events
      newSocket.on('new_message', (data) => {
        console.log('New message:', data);
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Disconnect socket when not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  // Socket event emitters
  const emitEvent = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  // Listen to specific socket event
  const listenToEvent = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Return cleanup function
      return () => {
        socket.off(event, callback);
      };
    }
  };

  // Send location update (for providers)
  const updateLocation = (latitude, longitude) => {
    emitEvent('update_location', { latitude, longitude });
  };

  // Toggle availability (for providers)
  const toggleAvailability = (isAvailable) => {
    emitEvent('toggle_availability', { isAvailable });
  };

  // Update request status
  const updateRequestStatus = (requestId, status, location = null) => {
    emitEvent('request_status_update', { requestId, status, location });
  };

  // Send message
  const sendMessage = (requestId, message) => {
    emitEvent('send_message', { requestId, message });
  };

  // Send emergency SOS
  const sendEmergencySOS = (location, address, description) => {
    emitEvent('emergency_sos', { location, address, description });
  };

  // Typing indicators
  const startTyping = (requestId) => {
    emitEvent('typing_start', { requestId });
  };

  const stopTyping = (requestId) => {
    emitEvent('typing_stop', { requestId });
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const value = {
    socket,
    connected,
    notifications,
    emitEvent,
    listenToEvent,
    updateLocation,
    toggleAvailability,
    updateRequestStatus,
    sendMessage,
    sendEmergencySOS,
    startTyping,
    stopTyping,
    clearNotifications,
    markNotificationRead,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
