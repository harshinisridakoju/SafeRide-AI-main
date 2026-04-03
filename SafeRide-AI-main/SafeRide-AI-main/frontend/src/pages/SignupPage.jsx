import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, AlertCircle, User, Wrench, Crown } from 'lucide-react';

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'user';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    // Provider specific
    vehicleInfo: '',
    services: [],
    // User agreement
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  
  const { signup, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const serviceOptions = [
    { id: 'fuel', label: 'Fuel Delivery', icon: '⛽' },
    { id: 'tire', label: 'Tire Change', icon: '🛞' },
    { id: 'engine', label: 'Engine Repair', icon: '🔧' },
    { id: 'battery', label: 'Battery Jump', icon: '🔋' },
    { id: 'towing', label: 'Towing Service', icon: '🚗' },
  ];

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.role === 'provider') {
      const newErrors = {};
      
      if (!formData.vehicleInfo) {
        newErrors.vehicleInfo = 'Vehicle information is required';
      }
      
      if (formData.services.length === 0) {
        newErrors.services = 'Please select at least one service';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };
    
    if (formData.role === 'provider') {
      submitData.vehicleInfo = formData.vehicleInfo;
      submitData.services = formData.services;
    }
    
    const result = await signup(submitData);
    
    if (result.success) {
      const redirectPath = formData.role === 'provider' 
        ? '/app/provider/dashboard' 
        : formData.role === 'admin'
        ? '/app/admin/dashboard'
        : '/app/home';
      
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join DriveGuardian and drive with confidence
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 ${
              step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* General Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="label">Account Type</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={formData.role === 'user'}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <div className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-colors ${
                        formData.role === 'user'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                        <User className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">User</span>
                      </div>
                    </label>
                    
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="provider"
                        checked={formData.role === 'provider'}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <div className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-colors ${
                        formData.role === 'provider'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                        <Wrench className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Provider</span>
                      </div>
                    </label>
                    
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={formData.role === 'admin'}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <div className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-colors ${
                        formData.role === 'admin'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                        <Crown className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Admin</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Create a password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
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

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:text-primary/80">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  Next Step
                </button>
              </div>
            )}

            {/* Step 2: Additional Information (for providers) */}
            {step === 2 && (
              <div className="space-y-6">
                {formData.role === 'provider' ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Provider Information
                    </h3>

                    {/* Vehicle Information */}
                    <div>
                      <label htmlFor="vehicleInfo" className="label">
                        Vehicle Information
                      </label>
                      <textarea
                        id="vehicleInfo"
                        name="vehicleInfo"
                        value={formData.vehicleInfo}
                        onChange={handleChange}
                        className={`input resize-none ${errors.vehicleInfo ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Describe your service vehicle (make, model, equipment, etc.)"
                        rows={3}
                        disabled={isLoading}
                      />
                      {errors.vehicleInfo && (
                        <p className="mt-1 text-sm text-red-500">{errors.vehicleInfo}</p>
                      )}
                    </div>

                    {/* Services Selection */}
                    <div>
                      <label className="label">Services Offered</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {serviceOptions.map(service => (
                          <label
                            key={service.id}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              formData.services.includes(service.id)
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              className="sr-only"
                              disabled={isLoading}
                            />
                            <div className="text-center">
                              <div className="text-2xl mb-1">{service.icon}</div>
                              <span className="text-xs font-medium">{service.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.services && (
                        <p className="mt-1 text-sm text-red-500">{errors.services}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Join!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      You're all set to create your {formData.role} account.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="btn btn-outline flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
