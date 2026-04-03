const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  issueType: {
    type: String,
    required: [true, 'Issue type is required'],
    enum: ['fuel', 'tire', 'engine', 'battery', 'accident', 'other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 &&
                 coordinates[1] >= -90 && coordinates[1] <= 90;
        },
        message: 'Invalid coordinates. Format: [longitude, latitude]'
      }
    },
    address: {
      type: String,
      trim: true,
      required: [true, 'Address is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // AI Detection Results
  aiDetection: {
    imageAnalysis: {
      detected: {
        type: Boolean,
        default: false
      },
      issues: [{
        type: String,
        enum: ['flat_tire', 'smoke', 'damage', 'leak', 'normal']
      }],
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    audioAnalysis: {
      detected: {
        type: Boolean,
        default: false
      },
      engineStatus: {
        type: String,
        enum: ['normal', 'misfire', 'battery_issue', 'unknown'],
        default: 'unknown'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    prediction: {
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      recommendations: [String]
    }
  },
  // Media files
  images: [{
    type: String,
    url: String
  }],
  audioFile: {
    type: String,
    url: String
  },
  // Service details
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: null
  },
  // Timeline
  acceptedAt: {
    type: Date,
    default: null
  },
  arrivedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Provider location tracking
  providerLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  // Feedback
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  userFeedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    default: null
  },
  providerFeedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
requestSchema.index({ location: '2dsphere' });
requestSchema.index({ status: 1 });
requestSchema.index({ userId: 1 });
requestSchema.index({ providerId: 1 });
requestSchema.index({ createdAt: -1 });

// Virtual for time elapsed
requestSchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diff = now - created;
  return Math.floor(diff / (1000 * 60)); // minutes
});

// Virtual for formatted status
requestSchema.virtual('formattedStatus').get(function() {
  const statusMap = {
    pending: 'Waiting for Provider',
    accepted: 'Provider Accepted',
    on_the_way: 'On the Way',
    in_progress: 'Service in Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Method to update status with timestamp
requestSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  switch(newStatus) {
    case 'accepted':
      this.acceptedAt = new Date();
      break;
    case 'on_the_way':
      // Provider is on the way
      break;
    case 'in_progress':
      this.arrivedAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
  }
  
  return this.save();
};

module.exports = mongoose.model('Request', requestSchema);
