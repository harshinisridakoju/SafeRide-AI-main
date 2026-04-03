import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Settings,
  Camera,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, changePassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      const result = await updateUser(profileData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    // Validation
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences
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
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400'}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Profile Information
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'security'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role} Account
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="input pl-10"
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="label">Account Type</label>
                  <input
                    type="text"
                    value={user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                    className="input"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Contact support to change account type
                  </p>
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
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Choose a strong password with at least 6 characters
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className={`input pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className={`input pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
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
                      Updating...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Receive updates about your requests
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Receive real-time updates on your device
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Location Services</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Allow app to access your location for better service
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
