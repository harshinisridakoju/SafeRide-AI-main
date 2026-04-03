import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MapPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const { connected, listenToEvent } = useSocket();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerLocation, setProviderLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const providerMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    fetchRequest();
    initializeMap();
  }, [requestId]);

  useEffect(() => {
    if (!request) return;

    // Listen for provider location updates
    const cleanupLocation = listenToEvent('provider_location_update', (data) => {
      if (data.requestId === requestId) {
        setProviderLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timestamp: data.timestamp
        });
        updateProviderMarker(data.location.latitude, data.location.longitude);
      }
    });

    return () => {
      cleanupLocation?.();
    };
  }, [request, requestId, listenToEvent]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/requests/${requestId}`);
      const requestData = response.data.data.request;
      setRequest(requestData);
      
      // Set initial locations
      setUserLocation({
        latitude: requestData.location.coordinates[1],
        longitude: requestData.location.coordinates[0]
      });
      
      if (requestData.providerLocation) {
        setProviderLocation({
          latitude: requestData.providerLocation.coordinates[1],
          longitude: requestData.providerLocation.coordinates[0]
        });
      }
      
      setError('');
    } catch (error) {
      console.error('Fetch request error:', error);
      setError(error.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    // This is a placeholder for Google Maps integration
    // In a real app, you would initialize Google Maps here
    setTimeout(() => {
      setMapLoaded(true);
      console.log('Map initialized (placeholder)');
    }, 1000);
  };

  const updateProviderMarker = (lat, lng) => {
    // This would update the provider marker on the map
    console.log('Updating provider marker:', lat, lng);
  };

  const getETA = () => {
    if (!providerLocation || !userLocation) return 'Calculating...';
    
    // Simple distance calculation (would use real routing API)
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      providerLocation.latitude,
      providerLocation.longitude
    );
    
    const avgSpeed = 50; // km/h
    const etaMinutes = Math.ceil((distance / avgSpeed) * 60);
    
    return `${etaMinutes} min`;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'on_the_way': return 'text-purple-600 bg-purple-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Request not found'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-3"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Track Provider
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Request #{requestId.slice(-8)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {connected ? 'Live Tracking' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center">
              <span className={`status-badge status-${request.status} mr-3`}>
                {request.formattedStatus}
              </span>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4 mr-1" />
                ETA: {getETA()}
              </div>
            </div>
            
            {request.providerId && (
              <div className="flex space-x-2">
                <button className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full map-container">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map Placeholder */}
          {mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Google Maps Integration
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  User and provider locations would be displayed here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Navigation className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        {/* Location Markers (Placeholder) */}
        {userLocation && (
          <div 
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
            style={{
              top: '40%',
              left: '30%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        
        {providerLocation && (
          <div 
            className="absolute w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse"
            style={{
              top: '60%',
              left: '70%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Navigation className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Bottom Sheet - Provider Info */}
      {request.providerId && (
        <div className="bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {request.providerId.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {request.providerId.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.providerId.vehicleInfo || 'Service Provider'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">Distance</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {providerLocation && userLocation 
                    ? `${Math.round(calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        providerLocation.latitude,
                        providerLocation.longitude
                      ) * 10) / 10} km`
                    : 'Calculating...'
                  }
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-4">
              {['Accepted', 'On Way', 'Arrived', 'Complete'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    ['accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) >= index
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-1 ${
                      ['accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) > index
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="btn btn-outline flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </button>
              <button className="btn btn-outline flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </button>
              <button 
                onClick={() => navigate(`/app/result/${requestId}`)}
                className="btn btn-primary flex-1"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
