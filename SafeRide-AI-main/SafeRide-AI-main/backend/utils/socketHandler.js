const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Request = require('../models/Request');
const Notification = require('../models/Notification');

module.exports = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ ${socket.user.name} connected (${socket.user.role})`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join providers to provider room
    if (socket.user.role === 'provider') {
      socket.join('providers');
      
      // Update provider availability
      socket.on('update_location', async (data) => {
        try {
          const { latitude, longitude } = data;
          
          if (!latitude || !longitude) {
            return socket.emit('error', 'Invalid location data');
          }

          // Update provider location
          await User.findByIdAndUpdate(socket.user._id, {
            location: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
          });

          // Broadcast to nearby users if provider is on a request
          const activeRequest = await Request.findOne({
            providerId: socket.user._id,
            status: { $in: ['accepted', 'on_the_way', 'in_progress'] }
          }).populate('userId');

          if (activeRequest) {
            // Update provider location on request
            activeRequest.providerLocation = {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
            await activeRequest.save();

            // Send location update to user
            io.to(`user_${activeRequest.userId._id}`).emit('provider_location_update', {
              requestId: activeRequest._id,
              location: {
                latitude,
                longitude
              },
              timestamp: new Date()
            });
          }

          socket.emit('location_updated', { success: true });
        } catch (error) {
          console.error('Location update error:', error);
          socket.emit('error', 'Failed to update location');
        }
      });

      socket.on('toggle_availability', async (data) => {
        try {
          const { isAvailable } = data;
          
          if (typeof isAvailable !== 'boolean') {
            return socket.emit('error', 'Invalid availability data');
          }

          await User.findByIdAndUpdate(socket.user._id, {
            isAvailable
          });

          // Broadcast availability to all providers
          io.to('providers').emit('provider_availability_update', {
            providerId: socket.user._id,
            isAvailable,
            timestamp: new Date()
          });

          socket.emit('availability_updated', { isAvailable });
        } catch (error) {
          console.error('Availability update error:', error);
          socket.emit('error', 'Failed to update availability');
        }
      });
    }

    // Handle new request notification
    socket.on('new_request', async (data) => {
      try {
        const { requestId } = data;
        
        const request = await Request.findById(requestId)
          .populate('userId', 'name phone');

        if (!request) {
          return socket.emit('error', 'Request not found');
        }

        // Broadcast to all providers
        io.to('providers').emit('new_request_alert', {
          request: {
            id: request._id,
            issueType: request.issueType,
            location: request.location,
            address: request.location.address,
            priority: request.priority,
            user: request.userId,
            createdAt: request.createdAt,
            timeElapsed: request.timeElapsed
          },
          timestamp: new Date()
        });

      } catch (error) {
        console.error('New request notification error:', error);
        socket.emit('error', 'Failed to send request notification');
      }
    });

    // Handle request status updates
    socket.on('request_status_update', async (data) => {
      try {
        const { requestId, status, location } = data;
        
        const request = await Request.findById(requestId)
          .populate('userId', 'name phone')
          .populate('providerId', 'name phone');

        if (!request) {
          return socket.emit('error', 'Request not found');
        }

        // Update request status
        await request.updateStatus(status);

        // Update provider location if provided
        if (location && socket.user.role === 'provider') {
          request.providerLocation = {
            type: 'Point',
            coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
          };
          await request.save();
        }

        // Send notification to user
        io.to(`user_${request.userId._id}`).emit('request_status_updated', {
          requestId: request._id,
          status: request.status,
          provider: request.providerId,
          timestamp: new Date()
        });

        // Send confirmation to provider
        if (socket.user.role === 'provider') {
          socket.emit('status_update_confirmed', {
            requestId: request._id,
            status: request.status
          });
        }

      } catch (error) {
        console.error('Status update error:', error);
        socket.emit('error', 'Failed to update request status');
      }
    });

    // Handle real-time chat (optional feature)
    socket.on('send_message', async (data) => {
      try {
        const { requestId, message } = data;
        
        const request = await Request.findById(requestId)
          .populate('userId', 'name phone')
          .populate('providerId', 'name phone');

        if (!request) {
          return socket.emit('error', 'Request not found');
        }

        // Validate sender
        const isUser = socket.user._id.toString() === request.userId._id.toString();
        const isProvider = socket.user._id.toString() === request.providerId._id.toString();

        if (!isUser && !isProvider) {
          return socket.emit('error', 'Not authorized to send message');
        }

        const messageData = {
          id: new Date().getTime(),
          requestId,
          senderId: socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          message,
          timestamp: new Date()
        };

        // Send to both user and provider
        io.to(`user_${request.userId._id}`).emit('new_message', messageData);
        
        if (request.providerId) {
          io.to(`user_${request.providerId._id}`).emit('new_message', messageData);
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle emergency SOS
    socket.on('emergency_sos', async (data) => {
      try {
        const { location, address, description } = data;
        
        // Create emergency request
        const emergencyRequest = await Request.create({
          userId: socket.user._id,
          issueType: 'accident',
          description: description || 'Emergency SOS request',
          location: {
            type: 'Point',
            coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
            address
          },
          priority: 'urgent'
        });

        // Notify all providers immediately
        io.to('providers').emit('emergency_alert', {
          request: {
            id: emergencyRequest._id,
            issueType: emergencyRequest.issueType,
            location: emergencyRequest.location,
            address: emergencyRequest.location.address,
            priority: 'urgent',
            user: socket.user.profile,
            createdAt: emergencyRequest.createdAt
          },
          timestamp: new Date()
        });

        // Confirm to user
        socket.emit('sos_confirmed', {
          requestId: emergencyRequest._id,
          message: 'Emergency request sent to all nearby providers'
        });

      } catch (error) {
        console.error('Emergency SOS error:', error);
        socket.emit('error', 'Failed to send emergency request');
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { requestId } = data;
      socket.broadcast.emit('user_typing', {
        requestId,
        userId: socket.user._id,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { requestId } = data;
      socket.broadcast.emit('user_stop_typing', {
        requestId,
        userId: socket.user._id
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ ${socket.user.name} disconnected`);
      
      // Update provider availability to offline
      if (socket.user.role === 'provider') {
        User.findByIdAndUpdate(socket.user._id, { isAvailable: false })
          .catch(err => console.error('Error updating provider availability:', err));
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle server-side notifications
  const sendNotification = async (userId, notificationData) => {
    try {
      const notification = await Notification.create({
        userId,
        ...notificationData
      });

      // Send real-time notification
      io.to(`user_${userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        requestId: notification.requestId,
        timestamp: notification.createdAt
      });

      return notification;
    } catch (error) {
      console.error('Send notification error:', error);
    }
  };

  // Make sendNotification available globally
  io.sendNotification = sendNotification;

  console.log('📡 Socket.io server configured');
};
