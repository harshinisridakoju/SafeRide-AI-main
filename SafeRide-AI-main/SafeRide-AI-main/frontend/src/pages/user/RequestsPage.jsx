import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Fuel,
  Wrench,
  Battery,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Search
} from 'lucide-react';

const RequestsPage = () => {
  const { api } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 10);
      
      const response = await api.get(`/user/requests?${params}`);
      setRequests(response.data.data.requests);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('Fetch requests error:', error);
      setError(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'fuel': return Fuel;
      case 'tire': return AlertTriangle;
      case 'engine': return Wrench;
      case 'battery': return Battery;
      default: return AlertTriangle;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString()}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString()}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
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
          My Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and track your roadside assistance requests
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
              <option value="pending">Pending</option>
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
                : 'Your roadside assistance requests will appear here'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/app/scan" className="btn btn-primary">
                Create Your First Request
              </Link>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            const IssueIcon = getIssueIcon(request.issueType);
            
            return (
              <Link
                key={request._id}
                to={`/app/result/${request._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow block"
              >
                <div className="flex items-start justify-between">
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
                        <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
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
                      
                      {/* Provider Info */}
                      {request.providerId && (
                        <div className="mt-3 flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {request.providerId.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.providerId.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.providerId.rating ? `★ ${request.providerId.rating}` : 'Service Provider'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-5 h-5 ${
                      request.status === 'completed' ? 'text-green-500' :
                      request.status === 'cancelled' ? 'text-red-500' :
                      'text-blue-500'
                    }`} />
                  </div>
                </div>
                
                {/* Progress Bar for Active Requests */}
                {['pending', 'accepted', 'on_the_way', 'in_progress'].includes(request.status) && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {request.timeElapsed} min elapsed
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].map((status, index) => (
                        <React.Fragment key={status}>
                          <div className={`h-2 flex-1 rounded-full ${
                            ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) >= index
                              ? 'bg-primary'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                          {index < 4 && (
                            <div className="w-1 h-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={pagination.current === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.current} of {pagination.total}
          </span>
          
          <button
            onClick={() => setPage(prev => Math.min(pagination.total, prev + 1))}
            disabled={pagination.current === pagination.total}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
