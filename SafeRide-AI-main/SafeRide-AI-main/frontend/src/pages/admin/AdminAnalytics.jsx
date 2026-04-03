import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Calendar,
  MapPin,
  Clock,
  Star,
  Activity,
  Loader2,
  Download
} from 'lucide-react';

const AdminAnalyticsPage = () => {
  const { api } = useAuth();
  
  const [analyticsData, setAnalyticsData] = useState({
    requestTrends: [],
    userTrends: [],
    topProviders: [],
    issueDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?period=${period}`);
      setAnalyticsData(response.data.data);
      setError('');
    } catch (error) {
      console.error('Analytics data error:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Placeholder for data export functionality
    alert('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Platform performance and usage insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          {/* Export Button */}
          <button
            onClick={exportData}
            className="btn btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
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

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Request Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Request Trends
          </h2>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Request volume chart would be displayed here
              </p>
              <div className="mt-4 space-y-2">
                {analyticsData.requestTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{trend._id}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{trend.count} requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Registration Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Registration Trends
          </h2>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                User growth chart would be displayed here
              </p>
              <div className="mt-4 space-y-2">
                {analyticsData.userTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{trend._id}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{trend.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Providers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Top Performing Providers
          </h2>
          
          <div className="space-y-4">
            {analyticsData.topProviders.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No provider data available</p>
              </div>
            ) : (
              analyticsData.topProviders.map((provider, index) => (
                <div key={provider._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider.name}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {provider.rating} • {provider.completedServices} services
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {provider.completedCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">completed</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issue Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Issue Type Distribution
          </h2>
          
          <div className="space-y-4">
            {analyticsData.issueDistribution.map((issue, index) => (
              <div key={issue._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    {getIssueIcon(issue._id)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {issue._id.replace('_', ' ')}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {issue.avgResponseTime ? 
                        `Avg response: ${Math.round(issue.avgResponseTime / 60000)} min` : 
                        'No response data'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {issue.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">requests</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.requestTrends.reduce((sum, t) => sum + t.count, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Requests</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.userTrends.reduce((sum, t) => sum + t.count, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">New Users</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.issueDistribution.length > 0 ? 
              Math.round(analyticsData.issueDistribution.reduce((sum, issue) => {
                return sum + (issue.avgResponseTime || 0)
              }, 0) / analyticsData.issueDistribution.length / 60000) : 0
            } min
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsData.topProviders.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Active Providers</div>
        </div>
      </div>
    </div>
  );
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

export default AdminAnalyticsPage;
