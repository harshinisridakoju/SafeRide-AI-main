const express = require('express');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require provider role
router.use(protect);
router.use(authorize('provider'));

// @desc    Get nearby requests
// @route   GET /api/provider/nearby-requests
// @access  Private (Provider)
router.get('/nearby-requests', async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, // km
      page = 1, 
      limit = 10 
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Provider location (latitude, longitude) is required'
      });
    }

    const providerLat = parseFloat(latitude);
    const providerLng = parseFloat(longitude);
    const radiusInMeters = radius * 1000;

    // Pagination
    const skip = (page - 1) * limit;

    // Find nearby pending requests
    const requests = await Request.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [providerLng, providerLat]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('userId', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Calculate distance for each request
    const requestsWithDistance = requests.map(request => {
      const distance = calculateDistance(
        providerLat, 
        providerLng, 
        request.location.coordinates[1], 
        request.location.coordinates[0]
      );
      
      return {
        ...request.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    });

    const total = await Request.countDocuments({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [providerLng, providerLat]
          },
          $maxDistance: radiusInMeters
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        requests: requestsWithDistance,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get nearby requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby requests'
    });
  }
});

// @desc    Accept a request
// @route   PUT /api/provider/requests/:id/accept
// @access  Private (Provider)
router.put('/requests/:id/accept', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer available'
      });
    }

    // Update request
    request.providerId = req.user._id;
    await request.updateStatus('accepted');

    // Create notification for user
    await Notification.create({
      userId: request.userId,
      type: 'request_accepted',
      title: 'Provider Found!',
      message: `${req.user.name} has accepted your request and is on the way.`,
      requestId: request._id,
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting request'
    });
  }
});

// @desc    Get provider's accepted requests
// @route   GET /api/provider/requests
// @access  Private (Provider)
router.get('/requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { providerId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const requests = await Request.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get provider requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

// @desc    Update request status
// @route   PUT /api/provider/requests/:id/status
// @access  Private (Provider)
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { status, location } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['on_the_way', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await Request.findOne({
      _id: req.params.id,
      providerId: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Update provider location if provided
    if (location && location.latitude && location.longitude) {
      request.providerLocation = {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
      };
    }

    // Update status
    await request.updateStatus(status);

    // Create notifications based on status
    let notificationType, title, message;
    
    switch(status) {
      case 'on_the_way':
        notificationType = 'provider_on_way';
        title = 'Provider on the Way';
        message = `${req.user.name} is on the way to your location.`;
        break;
      case 'in_progress':
        notificationType = 'service_started';
        title = 'Service Started';
        message = `${req.user.name} has started working on your vehicle.`;
        break;
      case 'completed':
        notificationType = 'service_completed';
        title = 'Service Completed';
        message = `${req.user.name} has completed the service. Please provide feedback.`;
        break;
    }

    await Notification.create({
      userId: request.userId,
      type: notificationType,
      title,
      message,
      requestId: request._id,
      priority: status === 'completed' ? 'high' : 'medium'
    });

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request status'
    });
  }
});

// @desc    Update provider location
// @route   PUT /api/provider/location
// @access  Private (Provider)
router.put('/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Update provider's location in User model
    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location'
    });
  }
});

// @desc    Update provider availability
// @route   PUT /api/provider/availability
// @access  Private (Provider)
router.put('/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      isAvailable
    });

    res.status(200).json({
      success: false,
      message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
});

// @desc    Get provider profile
// @route   GET /api/provider/profile
// @access  Private (Provider)
router.get('/profile', async (req, res) => {
  try {
    const provider = await User.findById(req.user._id);
    
    // Get statistics
    const stats = await Request.aggregate([
      { $match: { providerId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const completedCount = stats.find(s => s._id === 'completed')?.count || 0;
    const activeCount = stats.find(s => ['accepted', 'on_the_way', 'in_progress'].includes(s._id))?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        provider: provider.profile,
        stats: {
          completedServices: completedCount,
          activeRequests: activeCount,
          totalServices: stats.reduce((acc, s) => acc + s.count, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

module.exports = router;
