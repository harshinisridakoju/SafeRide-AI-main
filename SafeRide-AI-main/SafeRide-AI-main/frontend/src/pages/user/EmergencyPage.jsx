import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Shield, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendEmergencySOS, connected } = useSocket();
  
  const [location, setLocation] = useState({ latitude: '', longitude: '', address: '' });
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get user location immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location (Emergency)'
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Emergency services need your location.');
        }
      );
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isSending && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isSending) {
      triggerEmergencySOS();
    }
    
    return () => clearInterval(interval);
  }, [isSending, countdown]);

  const triggerEmergencySOS = async () => {
    if (!location.latitude || !location.longitude) {
      setError('Location is required for emergency assistance');
      setIsSending(false);
      setCountdown(5);
      return;
    }

    try {
      setIsSending(true);
      
      // Send emergency SOS via socket
      sendEmergencySOS(
        { latitude: location.latitude, longitude: location.longitude },
        location.address,
        description
      );
      
      // Simulate emergency request creation
      const mockRequest = {
        id: 'EMERGENCY_' + Date.now(),
        issueType: 'accident',
        priority: 'urgent',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        status: 'pending',
        createdAt: new Date(),
        description: description || 'Emergency assistance requested'
      };
      
      setEmergencyRequest(mockRequest);
      setSosSent(true);
      
      // In a real app, this would create an actual request via API
      setTimeout(() => {
        navigate(`/app/result/${mockRequest.id}`);
      }, 3000);
      
    } catch (error) {
      console.error('Emergency SOS error:', error);
      setError('Failed to send emergency request. Please call emergency services directly.');
      setIsSending(false);
      setCountdown(5);
    }
  };

  const handleEmergencySOS = () => {
    setIsSending(true);
    setCountdown(5);
  };

  const cancelEmergency = () => {
    setIsSending(false);
    setCountdown(5);
  };

  const callEmergencyServices = () => {
    // In a real app, this would call the actual emergency number
    window.open('tel:911');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-2">
            Emergency SOS
          </h1>
          <p className="text-red-600 dark:text-red-300 text-lg">
            Immediate roadside assistance
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-600 text-white rounded-xl p-6 mb-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">
            Emergency Mode Activated
          </h2>
          <p className="text-red-100">
            This will send an immediate alert to all nearby service providers
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SOS Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Send Emergency SOS
            </h3>
            
            {!sosSent ? (
              <div className="text-center">
                {isSending ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-4xl font-bold text-white">{countdown}</span>
                      </div>
                      <div className="absolute inset-0 w-32 h-32 mx-auto bg-red-500 rounded-full animate-ping opacity-20" />
                    </div>
                    
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      Sending emergency alert...
                    </p>
                    
                    <button
                      onClick={cancelEmergency}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleEmergencySOS}
                      className="w-full h-32 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-all transform hover:scale-105"
                    >
                      <AlertTriangle className="w-12 h-12 mr-3" />
                      SOS
                    </button>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Press and hold to send emergency alert to all nearby providers
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {sosSent && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h4 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Emergency Alert Sent!
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  All nearby providers have been notified
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Redirecting to request tracking...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call Emergency Services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Call Emergency Services
            </h3>
            
            <div className="text-center space-y-4">
              <button
                onClick={callEmergencyServices}
                className="w-full h-32 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-all transform hover:scale-105"
              >
                <Phone className="w-12 h-12 mr-3" />
                911
              </button>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Call emergency services directly for immediate medical or police assistance
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Important:</strong> For life-threatening emergencies, always call 911 first
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Emergency Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="label">Your Location</label>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-500" />
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
                  GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>
            
            <div>
              <label className="label">Emergency Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Describe the emergency situation..."
              />
            </div>
          </div>
        </div>

        {/* Emergency Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
            Emergency Safety Tips
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Turn on hazard lights and move to a safe location if possible
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Stay inside your vehicle if it's safer than outside
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Keep your phone charged and available for communication
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Don't attempt repairs on busy highways
                </p>
              </div>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Be cautious of strangers offering help
                </p>
              </div>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Follow instructions from emergency services
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {connected ? 'Connected to DriveGuardian' : 'Connection lost - call emergency services'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;
