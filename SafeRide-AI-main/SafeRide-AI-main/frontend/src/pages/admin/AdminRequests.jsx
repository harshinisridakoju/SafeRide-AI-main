import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Filter,
  MapPin,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  Fuel,
  Battery,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical
} from 'lucide-react';

const AdminRequestsPage = () => {
  const { api } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, issueFilter, searchTerm, sortBy, sortOrder]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (issueFilter !== 'all') params.append('issueType', issueFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', 20);
      
      const response = await api.get(`/admin/requests?${params}`);
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

  const getIssueIcon = (type) => {
    switch (type) {
      case 'fuel': return Fuel;
      case 'tire': return AlertTriangle;
      case 'engine': return Wrench;
      case 'battery': return Battery;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'on_the_way': return 'text-purple-600 bg-purple-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.providerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesIssue = issueFilter === 'all' || request.issueType === issueFilter;
    
    return matchesSearch && matchesStatus && matchesIssue;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Request Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and manage all assistance requests
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
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
          <div className="lg:w-48">
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
          
          {/* Issue Filter */}
          <div className="lg:w-48">
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Issues</option>
              <option value="fuel">Fuel</option>
              <option value="tire">Tire</option>
              <option value="engine">Engine</option>
              <option value="battery">Battery</option>
              <option value="accident">Accident</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order);
              }}
              className="input"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">High Priority</option>
              <option value="priority-asc">Low Priority</option>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm || statusFilter !== 'all' || issueFilter !== 'all' ? 'No matching requests' : 'No requests found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm || statusFilter !== 'all' || issueFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Requests will appear here when users need assistance'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const IssueIcon = getIssueIcon(request.issueType);
                  
                  return (
                    <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`issue-icon issue-${request.issueType} mr-3`}>
                            <IssueIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {request.issueType.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {request._id.slice(-8)}
                            </div>
                            {request.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                                {request.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                            {request.userId?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.userId?.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {request.userId?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.providerId ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                              {request.providerId?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.providerId?.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ⭐ {request.providerId?.rating || 5.0}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge status-${request.status}`}>
                          {request.formattedStatus}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`priority-badge priority-${request.priority}`}>
                          {request.priority}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDuration(request.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/app/result/${request._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </Link>
                          
                          {request.providerId && (
                            <Link
                              to={`/app/map/${request._id}`}
                              className="btn btn-outline btn-sm"
                            >
                              Map
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {requests.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {requests.filter(r => ['accepted', 'on_the_way', 'in_progress'].includes(r.status)).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {requests.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {requests.filter(r => r.priority === 'urgent').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Urgent</div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
