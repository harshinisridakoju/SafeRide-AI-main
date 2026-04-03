import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  MapPin, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Phone,
  Camera,
  Mic,
  AlertTriangle
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-primary" />
            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">DriveGuardian</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Roadside Assistance
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Smart Companion for
            <span className="text-primary"> Road Safety</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Predict vehicle issues, detect problems with AI, and connect with nearby service providers in real-time. 
            Get help when you need it most, faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How DriveGuardian Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our 3-stage workflow ensures you get help quickly and efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Predict</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI analyzes your vehicle data to predict potential issues before they become problems
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Detect</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Capture images and sounds of your vehicle for instant AI-powered diagnosis
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Act</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with nearby service providers and track their arrival in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Everything You Need for Road Safety
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Diagnostics</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Advanced computer vision and audio analysis detect issues instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-Time Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Watch your service provider's journey to your location on a live map
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency SOS</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      One-tap emergency assistance sends alerts to all nearby providers
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Verified Providers</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      All service providers are background-checked and rated by users
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <Phone className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Round-the-clock assistance whenever you need it
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <Camera className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Analysis</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Photo-based issue detection with AI
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <Mic className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sound Detection</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Audio analysis for engine problems
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <AlertTriangle className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Prediction</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Preventive maintenance alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Drivers Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "DriveGuardian saved me when I had a flat tire on the highway. Help arrived in just 15 minutes!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  JD
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daily Commuter</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "The AI detection feature is amazing! It identified my battery issue before I even knew what was wrong."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Sarah Miller</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Road Trip Enthusiast</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "As a service provider, DriveGuardian helps me find customers quickly. The platform is reliable and efficient."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  MJ
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Mike Johnson</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Service Provider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Drive with Confidence?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of drivers who trust DriveGuardian for their roadside assistance needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/signup?role=provider" className="btn btn-outline btn-lg">
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <span className="ml-2 text-xl font-bold">DriveGuardian</span>
              </div>
              <p className="text-gray-400">
                Your smart companion for safe and confident driving.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 DriveGuardian. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
