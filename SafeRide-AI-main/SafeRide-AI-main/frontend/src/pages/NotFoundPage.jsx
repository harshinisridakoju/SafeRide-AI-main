import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-primary opacity-20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <Link to="/" className="btn btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Home Page
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Login
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/signup" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Sign Up
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
