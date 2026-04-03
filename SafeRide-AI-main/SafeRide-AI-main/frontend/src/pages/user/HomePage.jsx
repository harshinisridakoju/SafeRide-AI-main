import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  Zap, 
  Camera, 
  Mic, 
  AlertTriangle, 
  MapPin, 
  Clock,
  TrendingUp,
  Shield,
  Battery,
  Fuel,
  Wrench
} from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [vehicleData, setVehicleData] = useState({
    fuelLevel: 75,
    lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    mileage: 45000,
    vehicleAge: 3
  });
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    // Simulate risk prediction
    const predictRisk = () => {
      const { fuelLevel, lastServiceDate, mileage, vehicleAge } = vehicleData;
      
      let riskScore = 0;
      const recommendations = [];
      
      if (fuelLevel < 20) {
        riskScore += 30;
        recommendations.push('Refuel soon - low fuel detected');
      }
      
      const daysSinceService = Math.floor((Date.now() - new Date(lastServiceDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceService > 180) {
        riskScore += 25;
        recommendations.push('Schedule maintenance - overdue service');
      }
      
      if (mileage > 100000) {
        riskScore += 20;
        recommendations.push('High mileage detected - increased breakdown risk');
      }
      
      if (vehicleAge > 10) {
        riskScore += 15;
        recommendations.push('Older vehicle - regular inspection recommended');
      }
      
      let riskLevel = 'low';
      if (riskScore >= 60) {
        riskLevel = 'high';
      } else if (riskScore >= 30) {
        riskLevel = 'medium';
      }
      
      setRiskPrediction({
        riskLevel,
        riskScore,
        recommendations: recommendations.length > 0 ? recommendations : ['Vehicle appears to be in good condition']
      });
    };

    predictRisk();
  }, [vehicleData]);

  const issueTypes = [
    { id: 'fuel', label: 'Fuel Delivery', icon: Fuel, color: 'blue', description: 'Run out of fuel? We\'ll bring it to you.' },
    { id: 'tire', label: 'Flat Tire', icon: AlertTriangle, color: 'gray', description: 'Quick tire change service.' },
    { id: 'engine', label: 'Engine Trouble', icon: Wrench, color: 'red', description: 'Diagnose and fix engine issues.' },
    { id: 'battery', label: 'Battery Jump', icon: Battery, color: 'yellow', description: 'Jump-start your dead battery.' },
    { id: 'accident', label: 'Accident', icon: AlertTriangle, color: 'red', description: 'Emergency accident assistance.' },
    { id: 'other', label: 'Other Issue', icon: AlertTriangle, color: 'purple', description: 'Custom assistance for your needs.' },
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your vehicle health and roadside assistance dashboard
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {connected ? 'Connected to DriveGuardian' : 'Connection lost'}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Risk Prediction Card */}
      {riskPrediction && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Vehicle Risk Assessment
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskPrediction.riskLevel)} text-white`}>
                {riskPrediction.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Score</span>
                    <span>{riskPrediction.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${riskPrediction.riskScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Fuel className="w-4 h-4 mr-2" />
                    Fuel Level: {vehicleData.fuelLevel}%
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Days since service: {Math.floor((Date.now() - new Date(vehicleData.lastServiceDate)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Mileage: {vehicleData.mileage.toLocaleString()} miles
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Recommendations:</h3>
                <ul className="space-y-1 text-sm">
                  {riskPrediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <Shield className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/app/scan"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <Camera className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Scan Issue</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered diagnosis</p>
          </Link>
          
          <Link
            to="/app/emergency"
            className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center border border-red-200 dark:border-red-800"
          >
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-medium text-red-700 dark:text-red-300 mb-1">Emergency SOS</h3>
            <p className="text-sm text-red-600 dark:text-red-400">Immediate assistance</p>
          </Link>
          
          <Link
            to="/app/requests"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">My Requests</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">View history</p>
          </Link>
          
          <Link
            to="/app/profile"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Profile</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage account</p>
          </Link>
        </div>
      </div>

      {/* Issue Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What issue are you facing?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {issueTypes.map((issue) => {
            const Icon = issue.icon;
            return (
              <Link
                key={issue.id}
                to={`/app/scan?issue=${issue.id}`}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-primary/20"
              >
                <div className={`issue-icon issue-${issue.id} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{issue.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent requests</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Your assistance requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`issue-icon issue-${request.issueType} mr-4`}>
                      <request.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{request.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{request.date}</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
