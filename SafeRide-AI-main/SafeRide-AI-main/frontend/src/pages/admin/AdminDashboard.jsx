import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Wrench, 
  FileText, 
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { api } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalProviders: 0,
      totalRequests: 0,
      activeProviders: 0
    },
    requestStats: [],
    issueStats: [],
    recentRequests: [],
    activeProviders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data.data);
      setError('');
    } catch (error) {
      console.error('Dashboard data error:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and manage the DriveGuardian platform
        </p>
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
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData.stats.totalUsers.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Wrench className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData.stats.totalProviders.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Providers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData.stats.totalRequests.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Requests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-orange-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData.stats.activeProviders.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Providers</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Request Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Request Status Distribution
          </h2>
          
          <div className="space-y-3">
            {dashboardData.requestStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`status-badge status-${stat._id}`}>
                    {stat._id.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.count} requests
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(stat.count / dashboardData.stats.totalRequests) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((stat.count / dashboardData.stats.totalRequests) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Type Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Issue Type Distribution
          </h2>
          
          <div className="space-y-3">
            {dashboardData.issueStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {getIssueIcon(stat._id)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {stat._id.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                      ({stat.count})
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(stat.count / dashboardData.stats.totalRequests) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((stat.count / dashboardData.stats.totalRequests) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Requests
            </h2>
            <Link to="/app/admin/requests" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent requests</p>
              </div>
            ) : (
              dashboardData.recentRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {getIssueIcon(request.issueType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {request.issueType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.userId?.name} • {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge status-${request.status}`}>
                    {request.formattedStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Providers
            </h2>
            <Link to="/app/admin/users" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData.activeProviders.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active providers</p>
              </div>
            ) : (
              dashboardData.activeProviders.map((provider) => (
                <div key={provider._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {provider.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {provider.services?.length || 0} services • ⭐ {provider.rating || 5.0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span className="text-xs text-green-600 dark:text-green-400">Available</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/app/admin/users" className="btn btn-outline text-left">
            <Users className="w-4 h-4 mr-2 inline" />
            Manage Users
          </Link>
          
          <Link to="/app/admin/requests" className="btn btn-outline text-left">
            <FileText className="w-4 h-4 mr-2 inline" />
            View Requests
          </Link>
          
          <Link to="/app/admin/analytics" className="btn btn-outline text-left">
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Analytics
          </Link>
          
          <button
            onClick={fetchDashboardData}
            className="btn btn-outline text-left"
          >
            <TrendingUp className="w-4 h-4 mr-2 inline" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
