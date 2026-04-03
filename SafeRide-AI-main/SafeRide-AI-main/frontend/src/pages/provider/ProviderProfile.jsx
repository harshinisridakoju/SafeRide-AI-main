import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  Wrench,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Settings,
  Camera,
  Save,
  Loader2
} from 'lucide-react';

const ProviderProfile = () => {
  const { user, api } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    vehicleInfo: user?.vehicleInfo || '',
    services: user?.services || []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    completedServices: 0,
    activeRequests: 0,
    totalServices: 0,
    rating: 5.0
  });

  const serviceOptions = [
    { id: 'fuel', label: 'Fuel Delivery', icon: '⛽' },
    { id: 'tire', label: 'Tire Change', icon: '🛞' },
    { id: 'engine', label: 'Engine Repair', icon: '🔧' },
    { id: 'battery', label: 'Battery Jump', icon: '🔋' },
    { id: 'towing', label: 'Towing Service', icon: '🚗' },
  ];

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const response = await api.get('/provider/profile');
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Profile stats error:', error);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        vehicleInfo: profileData.vehicleInfo,
        services: profileData.services
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Provider Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your service provider information
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            <CheckCircle className={`w-5 h-5 mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400'}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Profile Information
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role} • {stats.rating.toFixed(1)} ⭐
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Business Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      className="input pl-10"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <label className="label">Service Vehicle Details</label>
                <textarea
                  value={profileData.vehicleInfo}
                  onChange={(e) => setProfileData(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                  className="input resize-none"
                  rows={3}
                  placeholder="Describe your service vehicle (make, model, equipment, tools, etc.)"
                />
              </div>

              {/* Services Offered */}
              <div>
                <label className="label">Services Offered</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {serviceOptions.map((service) => (
                    <label
                      key={service.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        profileData.services.includes(service.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profileData.services.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-1">{service.icon}</div>
                        <span className="text-xs font-medium">{service.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Stats & Info Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.completedServices}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.activeRequests}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wrench className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.totalServices}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900 dark:text-white mr-1">
                    {stats.rating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(stats.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Availability
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Currently Available
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You're receiving requests from nearby users
              </p>
            </div>
          </div>

          {/* Service Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Service Area
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>10 km radius</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Wrench className="w-4 h-4 mr-2" />
                <span>{profileData.services.length} services offered</span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Location is updated automatically when you're active
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            
            <div className="space-y-2">
              <a href="/app/provider/dashboard" className="block w-full btn btn-outline text-left">
                Dashboard
              </a>
              <a href="/app/provider/requests" className="block w-full btn btn-outline text-left">
                My Requests
              </a>
              <a href="/app/profile" className="block w-full btn btn-outline text-left">
                Account Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
