const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalRequests = await Request.countDocuments();
    
    // Get request status breakdown
    const requestStats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get issue type breakdown
    const issueStats = await Request.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent requests
    const recentRequests = await Request.find()
      .populate('userId', 'name phone')
      .populate('providerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get active providers
    const activeProviders = await User.find({ 
      role: 'provider', 
      isAvailable: true 
    }).select('name phone rating completedServices location');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProviders,
          totalRequests,
          activeProviders: activeProviders.length
        },
        requestStats,
        issueStats,
        recentRequests,
        activeProviders
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { 
      role, 
      page = 1, 
      limit = 20, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
router.get('/requests', async (req, res) => {
  try {
    const { 
      status, 
      issueType, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (issueType) {
      query.issueType = issueType;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const requests = await Request.find(query)
      .populate('userId', 'name phone')
      .populate('providerId', 'name phone rating')
      .sort(sort)
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

// @desc    Toggle user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating verification status'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Check if user has active requests
    const activeRequests = await Request.countDocuments({
      $or: [
        { userId: user._id, status: { $in: ['pending', 'accepted', 'on_the_way', 'in_progress'] } },
        { providerId: user._id, status: { $in: ['accepted', 'on_the_way', 'in_progress'] } }
      ]
    });

    if (activeRequests > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active requests'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Request trends over time
    const requestTrends = await Request.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User registration trends
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top providers by completed services
    const topProviders = await User.aggregate([
      { $match: { role: 'provider' } },
      {
        $lookup: {
          from: 'requests',
          localField: '_id',
          foreignField: 'providerId',
          as: 'completedRequests'
        }
      },
      {
        $addFields: {
          completedCount: {
            $size: {
              $filter: {
                input: '$completedRequests',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          }
        }
      },
      { $sort: { completedCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          rating: 1,
          completedServices: 1,
          completedCount: 1
        }
      }
    ]);

    // Issue type distribution
    const issueDistribution = await Request.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 },
          avgResponseTime: {
            $avg: {
              $cond: {
                if: { $ne: ['$acceptedAt', null] },
                then: { $subtract: ['$acceptedAt', '$createdAt'] },
                else: null
              }
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        requestTrends,
        userTrends,
        topProviders,
        issueDistribution
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// @desc    Send system notification
// @route   POST /api/admin/notifications
// @access  Private (Admin)
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, targetRole, priority = 'medium' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Build query for target users
    const query = targetRole ? { role: targetRole } : {};
    
    const targetUsers = await User.find(query).select('_id');
    
    // Create notifications for all target users
    const notifications = targetUsers.map(user => ({
      userId: user._id,
      type: 'system',
      title,
      message,
      priority
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification'
    });
  }
});

module.exports = router;
