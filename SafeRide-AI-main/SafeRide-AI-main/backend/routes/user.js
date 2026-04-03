const express = require('express');
const multer = require('multer');
const path = require('path');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and audio files
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  }
});

// All routes are protected
router.use(protect);

// @desc    Create help request
// @route   POST /api/user/request-help
// @access  Private (User)
router.post('/request-help', upload.array('files', 5), async (req, res) => {
  try {
    const {
      issueType,
      description,
      location,
      address,
      priority = 'medium'
    } = req.body;

    // Validation
    if (!issueType || !location || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide issue type, location, and address'
      });
    }

    // Parse location coordinates
    let coordinates;
    try {
      const [lng, lat] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lng) || isNaN(lat)) {
        throw new Error('Invalid coordinates');
      }
      coordinates = [lng, lat];
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format. Use: longitude,latitude'
      });
    }

    // Process uploaded files
    const images = [];
    const audioFile = null;

    if (req.files) {
      req.files.forEach(file => {
        if (file.mimetype.startsWith('image/')) {
          images.push({
            type: 'image',
            url: `/uploads/${file.filename}`
          });
        } else if (file.mimetype.startsWith('audio/')) {
          audioFile = {
            type: 'audio',
            url: `/uploads/${file.filename}`
          };
        }
      });
    }

    // Create request
    const request = await Request.create({
      userId: req.user._id,
      issueType,
      description,
      location: {
        type: 'Point',
        coordinates,
        address
      },
      priority,
      images,
      audioFile,
      // AI Detection will be processed separately
      aiDetection: {
        imageAnalysis: {
          detected: false,
          issues: [],
          confidence: 0
        },
        audioAnalysis: {
          detected: false,
          engineStatus: 'unknown',
          confidence: 0
        },
        prediction: {
          riskLevel: 'medium',
          recommendations: []
        }
      }
    });

    // Create notification for user
    await Notification.create({
      userId: req.user._id,
      type: 'system',
      title: 'Request Submitted',
      message: `Your ${issueType} assistance request has been submitted. We're finding nearby providers.`,
      requestId: request._id,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Help request submitted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Request help error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting help request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's requests
// @route   GET /api/user/requests
// @access  Private (User)
router.get('/requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const requests = await Request.find(query)
      .populate('providerId', 'name phone rating vehicleInfo')
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
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

// @desc    Get single request
// @route   GET /api/user/requests/:id
// @access  Private (User)
router.get('/requests/:id', async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('providerId', 'name phone rating vehicleInfo');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching request'
    });
  }
});

// @desc    Cancel request
// @route   PUT /api/user/requests/:id/cancel
// @access  Private (User)
router.put('/requests/:id/cancel', async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Can only cancel pending or accepted requests
    if (!['pending', 'accepted'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel request in current status'
      });
    }

    await request.updateStatus('cancelled');

    // Create notification
    if (request.providerId) {
      await Notification.create({
        userId: request.providerId,
        type: 'system',
        title: 'Request Cancelled',
        message: 'User has cancelled the assistance request',
        requestId: request._id,
        priority: 'medium'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request'
    });
  }
});

// @desc    Get user notifications
// @route   GET /api/user/notifications
// @access  Private
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (unread === 'true') {
      query.isRead = false;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/user/notifications/:id/read
// @access  Private
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
});

// @desc    Submit feedback for completed request
// @route   POST /api/user/requests/:id/feedback
// @access  Private (User)
router.post('/requests/:id/feedback', async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'completed'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Completed request not found'
      });
    }

    // Update request with feedback
    request.userRating = rating;
    request.userFeedback = feedback;
    await request.save();

    // Update provider's rating
    if (request.providerId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(request.providerId, {
        $inc: { completedServices: 1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
});

module.exports = router;
