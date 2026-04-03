import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  Camera, 
  Mic, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  AlertTriangle,
  Fuel,
  Wrench,
  Battery
} from 'lucide-react';

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedIssue = searchParams.get('issue');
  
  const navigate = useNavigate();
  const { api } = useAuth();
  const { connected } = useSocket();
  
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState(preselectedIssue || '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '', address: '' });
  const [priority, setPriority] = useState('medium');
  const [images, setImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const issueTypes = [
    { id: 'fuel', label: 'Fuel Delivery', icon: Fuel, color: 'blue' },
    { id: 'tire', label: 'Flat Tire', icon: AlertTriangle, color: 'gray' },
    { id: 'engine', label: 'Engine Trouble', icon: Wrench, color: 'red' },
    { id: 'battery', label: 'Battery Jump', icon: Battery, color: 'yellow' },
    { id: 'accident', label: 'Accident', icon: AlertTriangle, color: 'red' },
    { id: 'other', label: 'Other Issue', icon: AlertTriangle, color: 'purple' },
  ];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          
          // Reverse geocoding to get address (simplified)
          fetchAddress(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter it manually.');
        }
      );
    }
  }, []);

  const fetchAddress = async (lat, lng) => {
    // This would typically use a geocoding API
    // For demo purposes, we'll use a placeholder
    setLocation(prev => ({
      ...prev,
      address: 'Current Location (Address would be fetched here)'
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      setError('Only image files are allowed');
      return;
    }
    
    if (images.length + validFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(audioFile);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const analyzeFiles = async () => {
    if (images.length === 0 && !audioFile) {
      setError('Please upload images or record audio for analysis');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const results = {};
      
      // Analyze images
      if (images.length > 0) {
        const formData = new FormData();
        formData.append('image', images[0]);
        
        const imageResponse = await api.post('/ai/analyze-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        results.image = imageResponse.data.data.analysis;
      }
      
      // Analyze audio
      if (audioFile) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        
        const audioResponse = await api.post('/ai/analyze-audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        results.audio = audioResponse.data.data.analysis;
      }
      
      setAnalysisResult(results);
      setStep(3);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitRequest = async () => {
    if (!issueType || !location.address) {
      setError('Please select an issue type and provide location');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('issueType', issueType);
      formData.append('description', description);
      formData.append('location', `${location.longitude},${location.latitude}`);
      formData.append('address', location.address);
      formData.append('priority', priority);
      
      // Add files
      images.forEach((image, index) => {
        formData.append(`files`, image);
      });
      
      if (audioFile) {
        formData.append('files', audioFile);
      }
      
      const response = await api.post('/user/request-help', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const requestId = response.data.data.request._id;
      navigate(`/app/result/${requestId}`);
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIssueIcon = (type) => {
    const issue = issueTypes.find(i => i.id === type);
    return issue ? issue.icon : AlertTriangle;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Vehicle Issue Detection
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Use AI to detect issues and request roadside assistance
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNum ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Step 1: Issue Selection */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Your Issue
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {issueTypes.map((issue) => {
              const Icon = issue.icon;
              return (
                <button
                  key={issue.id}
                  onClick={() => setIssueType(issue.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    issueType === issue.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`issue-icon issue-${issue.id} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{issue.label}</h3>
                </button>
              );
            })}
          </div>
          
          <div className="mb-6">
            <label className="label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Describe your issue in more detail..."
            />
          </div>
          
          <div className="mb-6">
            <label className="label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <button
            onClick={() => setStep(2)}
            disabled={!issueType}
            className="btn btn-primary btn-lg w-full"
          >
            Next Step
          </button>
        </div>
      )}

      {/* Step 2: Media Upload */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Capture Evidence
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Image Upload */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Photos
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {images.length === 0 ? (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Take photos of your vehicle
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm"
                    >
                      Add More Photos
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Audio Recording */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Engine Sound
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="hidden"
                />
                
                {!audioFile ? (
                  <div>
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Record engine sound for analysis
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`btn ${isRecording ? 'btn-danger' : 'btn-outline'} w-full`}
                      >
                        {isRecording ? (
                          <>
                            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Record Sound
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="btn btn-outline btn-sm w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Audio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 dark:text-green-300">Audio recorded</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAudioFile(null)}
                      className="btn btn-outline btn-sm"
                    >
                      Remove Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              className="btn btn-outline flex-1"
            >
              Back
            </button>
            <button
              onClick={analyzeFiles}
              disabled={images.length === 0 && !audioFile || isAnalyzing}
              className="btn btn-primary flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze with AI'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Analysis Results */}
      {step === 3 && analysisResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            AI Analysis Results
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {analysisResult.image && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Image Analysis
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Issues Detected:</span>
                    <span className="text-sm font-medium">
                      {analysisResult.image.detected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {analysisResult.image.issues.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Detected Issues:</span>
                      <ul className="mt-1 space-y-1">
                        {analysisResult.image.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                            • {issue.replace('_', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                    <span className="text-sm font-medium">{analysisResult.image.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {analysisResult.audio && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center">
                  <Mic className="w-5 h-5 mr-2" />
                  Audio Analysis
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Engine Status:</span>
                    <span className="text-sm font-medium capitalize">
                      {analysisResult.audio.engineStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Issues Detected:</span>
                    <span className="text-sm font-medium">
                      {analysisResult.audio.detected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                    <span className="text-sm font-medium">{analysisResult.audio.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setStep(2)}
              className="btn btn-outline flex-1"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn btn-primary flex-1"
            >
              Continue to Location
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Location and Submit */}
      {step === 4 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Confirm Location
          </h2>
          
          <div className="mb-6">
            <label className="label">Your Location</label>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary" />
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                className="input flex-1"
                placeholder="Enter your location"
              />
            </div>
            {location.latitude && location.longitude && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
          
          {/* Request Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Request Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-24">Issue:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {issueTypes.find(i => i.id === issueType)?.label}
                </span>
              </div>
              {description && (
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-24">Description:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{description}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-24">Priority:</span>
                <span className={`priority-badge priority-${priority}`}>
                  {priority}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-24">Media:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {images.length} photo(s), {audioFile ? '1' : '0'} audio
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setStep(3)}
              className="btn btn-outline flex-1"
            >
              Back
            </button>
            <button
              onClick={submitRequest}
              disabled={!location.address || isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
