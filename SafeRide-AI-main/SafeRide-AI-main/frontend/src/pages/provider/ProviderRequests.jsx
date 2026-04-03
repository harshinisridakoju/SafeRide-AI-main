import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Fuel,
  Wrench,
  Battery,
  Loader2,
  Filter,
  Search
} from 'lucide-react';

const ProviderRequests = () => {
  const { api } = useAuth();
  const { updateRequestStatus, updateLocation } = useSocket();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchRequests();
    getCurrentLocation();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', 20);
      
      const response = await api.get(`/provider/requests?${params}`);
      setRequests(response.data.data.requests);
      setError('');
    } catch (error) {
      console.error('Fetch requests error:', error);
      setError(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
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
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus, location);
      await fetchRequests();
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update request status');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getIssueIcon = (type) => {
    switch (type) {
      case 'fuel': return Fuel;
      case 'tire': return AlertTriangle;
      case 'engine': return Wrench;
      case 'battery': return Battery;
      default: return AlertTriangle;
    }
  };

  const getStatusActions = (status, requestId) => {
    switch (status) {
      case 'accepted':
        return (
          <button
            onClick={() => handleStatusUpdate(requestId, 'on_the_way')}
            className="btn btn-primary btn-sm"
          >
            <Navigation className="w-4 h-4 mr-1" />
            On My Way
          </button>
        );
      case 'on_the_way':
        return (
          <button
            onClick={() => handleStatusUpdate(requestId, 'in_progress')}
            className="btn btn-primary btn-sm"
          >
            <Wrench className="w-4 h-4 mr-1" />
            Start Service
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => handleStatusUpdate(requestId, 'completed')}
            className="btn btn-success btn-sm"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Service Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and track your assistance requests
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requests..."
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="on_the_way">On the Way</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching requests' : 'No requests yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your accepted service requests will appear here'
              }
            </p>
            <Link to="/app/provider/dashboard" className="btn btn-primary">
              View Dashboard
            </Link>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const IssueIcon = getIssueIcon(request.issueType);
            
            return (
              <div
                key={request._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Issue Icon */}
                    <div className={`issue-icon issue-${request.issueType}`}>
                      <IssueIcon className="w-6 h-6" />
                    </div>
                    
                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {request.issueType.replace('_', ' ')} Assistance
                        </h3>
                        <span className={`status-badge status-${request.status}`}>
                          {request.formattedStatus}
                        </span>
                      </div>
                      
                      {request.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {request.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {request.location.address}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="mt-3 flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {request.userId.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.userId.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.userId.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    {getStatusActions(request.status, request._id)}
                    
                    <div className="flex space-x-2">
                      <button className="btn btn-outline btn-sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </button>
                      <button className="btn btn-outline btn-sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </button>
                      <Link
                        to={`/app/map/${request._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Navigate
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar for Active Requests */}
                {['accepted', 'on_the_way', 'in_progress'].includes(request.status) && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Service Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {request.timeElapsed} min elapsed
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {['accepted', 'on_the_way', 'in_progress', 'completed'].map((status, index) => (
                        <React.Fragment key={status}>
                          <div className={`h-2 flex-1 rounded-full ${
                            ['accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) >= index
                              ? 'bg-primary'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                          {index < 3 && (
                            <div className="w-1 h-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Accepted</span>
                      <span>On Way</span>
                      <span>In Progress</span>
                      <span>Complete</span>
                    </div>
                  </div>
                )}
                
                {/* Request Timeline */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Request created {formatDate(request.createdAt)}
                      </span>
                    </div>
                    
                    {request.acceptedAt && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Accepted {formatDate(request.acceptedAt)}
                        </span>
                      </div>
                    )}
                    
                    {request.arrivedAt && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Arrived {formatDate(request.arrivedAt)}
                        </span>
                      </div>
                    )}
                    
                    {request.completedAt && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Completed {formatDate(request.completedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProviderRequests;
