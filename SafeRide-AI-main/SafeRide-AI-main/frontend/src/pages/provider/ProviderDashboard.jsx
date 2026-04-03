import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp,
  Star,
  ToggleLeft,
  ToggleRight,
  Bell,
  Loader2,
  Wrench
} from 'lucide-react';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, toggleAvailability, updateLocation } = useSocket();
  
  const [stats, setStats] = useState({
    completedServices: 0,
    activeRequests: 0,
    totalServices: 0,
    rating: 5.0
  });
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Update location periodically
    const interval = setInterval(() => {
      if (isAvailable) {
        getCurrentLocation();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAvailable]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch provider profile with stats
      const response = await fetch('/api/provider/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
        setIsAvailable(data.data.provider.isAvailable);
      }
      
      // Fetch nearby requests
      await fetchNearbyRequests();
      
      setError('');
    } catch (error) {
      console.error('Dashboard data error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyRequests = async () => {
    try {
      if (!location.latitude || !location.longitude) return;
      
      const response = await fetch(`/api/provider/nearby-requests?latitude=${location.latitude}&longitude=${location.longitude}&radius=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNearbyRequests(data.data.requests);
      }
    } catch (error) {
      console.error('Nearby requests error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          updateLocation(newLocation.latitude, newLocation.longitude);
          fetchNearbyRequests();
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleAvailabilityToggle = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    toggleAvailability(newAvailability);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/provider/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Remove from nearby requests and refresh
        setNearbyRequests(prev => prev.filter(req => req.id !== requestId));
        fetchDashboardData();
        navigate(`/app/provider/requests`);
      }
    } catch (error) {
      console.error('Accept request error:', error);
      setError('Failed to accept request');
    }
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'fuel': return '⛽';
      case 'tire': return '🛞';
      case 'engine': return '🔧';
      case 'battery': return '🔋';
      case 'accident': return '🚨';
      default: return '❓';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your roadside assistance services
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Availability Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <button
                onClick={handleAvailabilityToggle}
                className={`p-1 rounded-lg transition-colors ${
                  isAvailable ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                {isAvailable ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {connected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completedServices}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Completed Services</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.activeRequests}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Active Requests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Rating</span>
          </div>
          <div className="flex items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
              {stats.rating.toFixed(1)}
            </h3>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(stats.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Customer Rating</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Wrench className="w-8 h-8 text-orange-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Services</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalServices}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Services</p>
        </div>
      </div>

      {/* Nearby Requests */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nearby Requests
            </h2>
            <button
              onClick={fetchNearbyRequests}
              className="btn btn-outline btn-sm"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {nearbyRequests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isAvailable ? 'No nearby requests' : 'You are currently unavailable'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {isAvailable 
                    ? 'New requests will appear here when they\'re nearby'
                    : 'Toggle availability to receive requests'
                  }
                </p>
              </div>
            ) : (
              nearbyRequests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${getPriorityColor(request.priority)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getIssueIcon(request.issueType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {request.issueType.replace('_', ' ')} Assistance
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.distance} km away
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`priority-badge priority-${request.priority}`}>
                        {request.priority}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {request.timeElapsed} min ago
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {request.description || 'No description provided'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {request.location.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold mr-2">
                        {request.user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.user.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="btn btn-primary"
                    >
                      Accept Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <Link
                to="/app/provider/requests"
                className="block w-full btn btn-outline text-left"
              >
                <Clock className="w-4 h-4 mr-2 inline" />
                View All Requests
              </Link>
              
              <Link
                to="/app/provider/profile"
                className="block w-full btn btn-outline text-left"
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Update Profile
              </Link>
              
              <button
                onClick={getCurrentLocation}
                className="block w-full btn btn-outline text-left"
              >
                <MapPin className="w-4 h-4 mr-2 inline" />
                Update Location
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            </div>
          </div>

          {/* Location Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Location Status
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                <span className={`text-sm font-medium ${location.latitude ? 'text-green-600' : 'text-gray-500'}`}>
                  {location.latitude ? 'Location Shared' : 'Location Unknown'}
                </span>
              </div>
              
              {location.latitude && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
