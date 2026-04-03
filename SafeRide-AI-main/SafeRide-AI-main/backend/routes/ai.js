const express = require('express');
const multer = require('multer');
const path = require('path');
const Request = require('../models/Request');
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

// @desc    Analyze image for vehicle issues
// @route   POST /api/ai/analyze-image
// @access  Private
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Dummy AI analysis - in production, this would use a real ML model
    const dummyAnalysis = analyzeImageDummy(req.file.filename);

    res.status(200).json({
      success: true,
      message: 'Image analysis completed',
      data: {
        imageUrl: `/uploads/${req.file.filename}`,
        analysis: dummyAnalysis
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing image'
    });
  }
});

// @desc    Analyze audio for engine issues
// @route   POST /api/ai/analyze-audio
// @access  Private
router.post('/analyze-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    // Dummy AI analysis - in production, this would use audio processing
    const dummyAnalysis = analyzeAudioDummy(req.file.filename);

    res.status(200).json({
      success: true,
      message: 'Audio analysis completed',
      data: {
        audioUrl: `/uploads/${req.file.filename}`,
        analysis: dummyAnalysis
      }
    });
  } catch (error) {
    console.error('Audio analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing audio'
    });
  }
});

// @desc    Predict vehicle breakdown risk
// @route   POST /api/ai/predict-risk
// @access  Private
router.post('/predict-risk', async (req, res) => {
  try {
    const { 
      fuelLevel, 
      lastServiceDate, 
      mileage, 
      vehicleAge, 
      issueHistory 
    } = req.body;

    // Validation
    if (fuelLevel === undefined || !lastServiceDate) {
      return res.status(400).json({
        success: false,
        message: 'Fuel level and last service date are required'
      });
    }

    // Dummy prediction logic - in production, this would use ML models
    const prediction = predictRiskDummy({
      fuelLevel,
      lastServiceDate,
      mileage,
      vehicleAge,
      issueHistory
    });

    res.status(200).json({
      success: true,
      message: 'Risk prediction completed',
      data: prediction
    });
  } catch (error) {
    console.error('Risk prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting risk'
    });
  }
});

// @desc    Process AI analysis for existing request
// @route   POST /api/ai/process-request/:requestId
// @access  Private
router.post('/process-request/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only process pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only process pending requests'
      });
    }

    // Process existing images and audio
    let imageAnalysis = { detected: false, issues: [], confidence: 0 };
    let audioAnalysis = { detected: false, engineStatus: 'unknown', confidence: 0 };

    if (request.images && request.images.length > 0) {
      imageAnalysis = analyzeImageDummy(request.images[0].url);
    }

    if (request.audioFile) {
      audioAnalysis = analyzeAudioDummy(request.audioFile.url);
    }

    // Update request with AI results
    request.aiDetection = {
      imageAnalysis,
      audioAnalysis,
      prediction: predictRiskDummy({
        fuelLevel: 50, // Default values for demo
        lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        mileage: 50000,
        vehicleAge: 3
      })
    };

    await request.save();

    res.status(200).json({
      success: true,
      message: 'AI processing completed',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Process request AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI analysis'
    });
  }
});

// Dummy AI functions (replace with real ML models in production)

function analyzeImageDummy(filename) {
  // Simulate different detections based on filename hash
  const hash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const confidence = 60 + (Math.abs(hash) % 40); // 60-99% confidence
  
  const possibleIssues = ['flat_tire', 'smoke', 'damage', 'leak', 'normal'];
  const detectedIssues = [];
  
  // Simulate detection based on hash
  if (Math.abs(hash) % 3 === 0) {
    detectedIssues.push('flat_tire');
  }
  if (Math.abs(hash) % 5 === 0) {
    detectedIssues.push('smoke');
  }
  if (Math.abs(hash) % 7 === 0) {
    detectedIssues.push('damage');
  }
  
  if (detectedIssues.length === 0) {
    detectedIssues.push('normal');
  }
  
  return {
    detected: detectedIssues.length > 0 && !detectedIssues.includes('normal'),
    issues: detectedIssues,
    confidence
  };
}

function analyzeAudioDummy(filename) {
  // Simulate engine sound analysis
  const hash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const confidence = 55 + (Math.abs(hash) % 45); // 55-99% confidence
  
  const statuses = ['normal', 'misfire', 'battery_issue'];
  const statusIndex = Math.abs(hash) % statuses.length;
  
  return {
    detected: statuses[statusIndex] !== 'normal',
    engineStatus: statuses[statusIndex],
    confidence
  };
}

function predictRiskDummy(params) {
  const { fuelLevel, lastServiceDate, mileage, vehicleAge, issueHistory } = params;
  
  // Calculate risk factors
  let riskScore = 0;
  const recommendations = [];
  
  // Fuel level risk
  if (fuelLevel < 20) {
    riskScore += 30;
    recommendations.push('Refuel soon - low fuel detected');
  } else if (fuelLevel < 40) {
    riskScore += 15;
    recommendations.push('Monitor fuel level');
  }
  
  // Service date risk
  const daysSinceService = Math.floor((Date.now() - new Date(lastServiceDate)) / (1000 * 60 * 60 * 24));
  if (daysSinceService > 180) {
    riskScore += 25;
    recommendations.push('Schedule maintenance - overdue service');
  } else if (daysSinceService > 90) {
    riskScore += 10;
    recommendations.push('Consider routine maintenance check');
  }
  
  // Mileage risk
  if (mileage > 100000) {
    riskScore += 20;
    recommendations.push('High mileage detected - increased breakdown risk');
  } else if (mileage > 75000) {
    riskScore += 10;
    recommendations.push('Monitor vehicle performance');
  }
  
  // Vehicle age risk
  if (vehicleAge > 10) {
    riskScore += 15;
    recommendations.push('Older vehicle - regular inspection recommended');
  } else if (vehicleAge > 5) {
    riskScore += 5;
  }
  
  // Issue history risk
  if (issueHistory && issueHistory.length > 0) {
    riskScore += Math.min(issueHistory.length * 5, 20);
    recommendations.push('Monitor recurring issues');
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  }
  
  // Add default recommendation if none
  if (recommendations.length === 0) {
    recommendations.push('Vehicle appears to be in good condition');
  }
  
  return {
    riskLevel,
    riskScore,
    recommendations,
    factors: {
      fuelLevel: fuelLevel < 40 ? 'elevated' : 'normal',
      serviceStatus: daysSinceService > 90 ? 'attention needed' : 'good',
      mileage: mileage > 75000 ? 'high' : 'normal',
      vehicleAge: vehicleAge > 5 ? 'older' : 'modern'
    }
  };
}

module.exports = router;
