import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare,
  Star,
  AlertCircle,
  Loader2,
  User,
  Wrench,
  Fuel,
  Battery
} from 'lucide-react';

const ResultPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const { connected, listenToEvent, sendMessage, startTyping, stopTyping } = useSocket();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerTyping, setProviderTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    if (!request) return;

    // Listen for real-time updates
    const cleanupStatus = listenToEvent('request_status_updated', (data) => {
      if (data.requestId === requestId) {
        fetchRequest(); // Refresh request data
      }
    });

    const cleanupMessage = listenToEvent('new_message', (data) => {
      if (data.requestId === requestId) {
        setMessages(prev => [...prev, data]);
        setProviderTyping(false);
      }
    });

    const cleanupTyping = listenToEvent('user_typing', (data) => {
      if (data.requestId === requestId && data.userId !== request.userId) {
        setProviderTyping(true);
      }
    });

    const cleanupStopTyping = listenToEvent('user_stop_typing', (data) => {
      if (data.requestId === requestId && data.userId !== request.userId) {
        setProviderTyping(false);
      }
    });

    return () => {
      cleanupStatus?.();
      cleanupMessage?.();
      cleanupTyping?.();
      cleanupStopTyping?.();
    };
  }, [request, requestId, listenToEvent]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/requests/${requestId}`);
      setRequest(response.data.data.request);
      setError('');
    } catch (error) {
      console.error('Fetch request error:', error);
      setError(error.response?.data?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !request?.providerId) return;

    sendMessage(requestId, newMessage);
    setMessages(prev => [...prev, {
      id: Date.now(),
      requestId,
      senderId: request.userId,
      senderName: 'You',
      senderRole: 'user',
      message: newMessage,
      timestamp: new Date()
    }]);
    setNewMessage('');
    stopTyping();
  };

  const handleTyping = () => {
    if (!isTyping) {
      startTyping(requestId);
      setIsTyping(true);
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      stopTyping();
      setIsTyping(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await api.put(`/user/requests/${requestId}/cancel`);
      await fetchRequest();
    } catch (error) {
      console.error('Cancel error:', error);
      setError(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await api.post(`/user/requests/${requestId}/feedback`, {
        rating: feedback.rating,
        feedback: feedback.comment
      });
      setShowFeedback(false);
      await fetchRequest();
    } catch (error) {
      console.error('Feedback error:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'on_the_way': return 'text-purple-600 bg-purple-100';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'fuel': return Fuel;
      case 'tire': return AlertCircle;
      case 'engine': return Wrench;
      case 'battery': return Battery;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Request not found'}</p>
          <Link to="/app/home" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const IssueIcon = getIssueIcon(request.issueType);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Request Details
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your roadside assistance request
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`issue-icon issue-${request.issueType} mr-3`}>
                  <IssueIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {request.issueType.replace('_', ' ')} Assistance
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Request #{request._id.slice(-8)}
                  </p>
                </div>
              </div>
              <span className={`status-badge status-${request.status}`}>
                {request.formattedStatus}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {request.timeElapsed} min elapsed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].map((status, index) => (
                  <React.Fragment key={status}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) >= index
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 4 && (
                      <div className={`flex-1 h-1 ${
                        ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].indexOf(request.status) > index
                          ? 'bg-primary'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Submitted</span>
                <span>Accepted</span>
                <span>On Way</span>
                <span>In Progress</span>
                <span>Completed</span>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Location:</span>
                <span className="text-gray-900 dark:text-white ml-2">{request.location.address}</span>
              </div>
              
              {request.description && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Description:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{request.description}</p>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Submitted:</span>
                <span className="text-gray-900 dark:text-white ml-2">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              {request.status === 'pending' && (
                <button
                  onClick={handleCancelRequest}
                  className="btn btn-danger"
                >
                  Cancel Request
                </button>
              )}
              
              {request.providerId && (
                <Link
                  to={`/app/map/${requestId}`}
                  className="btn btn-primary"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Provider
                </Link>
              )}
            </div>
          </div>

          {/* Provider Information */}
          {request.providerId && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Service Provider
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {request.providerId.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.providerId.name}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {request.providerId.rating || 5.0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {request.providerId.vehicleInfo && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Vehicle:</span> {request.providerId.vehicleInfo}
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          {request.providerId && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Chat with Provider
              </h3>
              
              {/* Messages */}
              <div className="h-64 overflow-y-auto mb-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderRole === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {providerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={handleTyping}
                  onBlur={handleStopTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="input flex-1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn btn-primary"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis Results */}
          {request.aiDetection && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Analysis Results
              </h3>
              
              {request.aiDetection.imageAnalysis?.detected && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Analysis</h4>
                  <div className="space-y-1">
                    {request.aiDetection.imageAnalysis.issues.map((issue, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                        • {issue.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Confidence: {request.aiDetection.imageAnalysis.confidence}%
                  </div>
                </div>
              )}
              
              {request.aiDetection.audioAnalysis?.detected && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Analysis</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Engine Status: {request.aiDetection.audioAnalysis.engineStatus.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Confidence: {request.aiDetection.audioAnalysis.confidence}%
                  </div>
                </div>
              )}
              
              {request.aiDetection.prediction && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Prediction</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Risk Level: <span className="font-medium capitalize">{request.aiDetection.prediction.riskLevel}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Media Files */}
          {(request.images?.length > 0 || request.audioFile) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Attached Media
              </h3>
              
              {request.images?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {request.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(image.url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {request.audioFile && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Recording</h4>
                  <audio controls className="w-full">
                    <source src={request.audioFile.url} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {request.status === 'completed' && !request.userRating && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Rate Your Service
              </h3>
              
              {!showFeedback ? (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="btn btn-primary w-full"
                >
                  Leave Feedback
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                          className="text-2xl"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= feedback.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">Comment (Optional)</label>
                    <textarea
                      value={feedback.comment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                      className="input resize-none"
                      rows={3}
                      placeholder="Share your experience..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="btn btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      className="btn btn-primary flex-1"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-2">
              <Link to="/app/home" className="btn btn-outline w-full">
                Back to Home
              </Link>
              <Link to="/app/requests" className="btn btn-outline w-full">
                View All Requests
              </Link>
              <Link to="/app/emergency" className="btn btn-danger w-full">
                Emergency SOS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
