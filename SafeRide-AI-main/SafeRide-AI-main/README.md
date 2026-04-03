# DriveGuardian – Smart Roadside Assistance System

<div align="center">

![DriveGuardian Logo](https://img.shields.io/badge/DriveGuardian-AI%20Powered-blue?style=for-the-badge&logo=shield)

**AI-powered roadside assistance platform with real-time provider matching**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-6+-green.svg)](https://www.mongodb.com/)

[Live Demo](#) • [Documentation](#documentation) • [Report Bug](#issues) • [Request Feature](#issues/new)

</div>

## 🚀 Overview

DriveGuardian is a comprehensive roadside assistance platform that leverages AI to predict vehicle issues, detect problems through image and audio analysis, and connect users with nearby service providers in real-time. Our 3-stage workflow ensures quick and efficient assistance: **Predict → Detect → Act**.

### ✨ Key Features

- **🧠 AI-Powered Diagnostics**: Image and audio analysis for instant issue detection
- **📍 Real-Time Tracking**: Live provider location tracking and ETA updates
- **📱 Multi-Platform**: Responsive web app for users, providers, and administrators
- **🔔 Smart Notifications**: Real-time alerts and status updates via Socket.io
- **🗺️ Map Integration**: Location-based provider matching and navigation
- **⚡ Emergency SOS**: One-tap emergency assistance with priority routing
- **📊 Analytics Dashboard**: Comprehensive insights for platform management
- **👥 Role-Based Access**: Separate interfaces for users, providers, and admins

---

## 🏗️ Architecture

### System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│   Node.js API   │◄──►│   MongoDB       │
│                 │    │                 │    │                 │
│ - User Dashboard │    │ - REST APIs     │    │ - Users         │
│ - Provider App  │    │ - Socket.io     │    │ - Requests      │
│ - Admin Panel   │    │ - File Upload   │    │ - Notifications │
│ - AI Features   │    │ - AI Services   │    │ - Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   Google Maps   │    │   Cloud Storage │
│                 │    │                 │    │                 │
│ - Real-time     │    │ - Geocoding     │    │ - Image Files   │
│ - Notifications │    │ - Directions   │    │ - Audio Files   │
│ - Location      │    │ - Maps Display  │    │ - File CDN      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18+** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Axios** for API communication
- **Socket.io Client** for real-time features
- **Lucide React** for beautiful icons

#### Backend
- **Node.js 18+** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **JWT** for authentication
- **bcryptjs** for password hashing

#### External Services
- **Google Maps API** for location services
- **Cloudinary/Firebase Storage** for file storage
- **AI Services** (placeholder for ML models)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- Google Maps API key (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/driveguardian.git
   cd driveguardian
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB Atlas (recommended)
   # Update MONGODB_URI in .env

   # Or local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend (in another terminal)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/driveguardian

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=uploads/
```

---

## 📱 Features Deep Dive

### 🔮 AI Prediction System

Our dummy AI system analyzes vehicle data to predict potential issues:

```javascript
// Risk factors considered:
- Fuel level (< 20% = high risk)
- Days since last service (> 180 days = elevated risk)
- Mileage (> 100k miles = increased risk)
- Vehicle age (> 10 years = higher risk)
```

### 📸 Image Detection

Upload photos of your vehicle for instant AI analysis:

- **Flat tire detection**
- **Smoke/leak identification**
- **Damage assessment**
- **Confidence scoring**

### 🎤 Audio Analysis

Record engine sounds for diagnostic insights:

- **Normal operation**
- **Engine misfire detection**
- **Battery issue identification**
- **Audio confidence metrics**

### 🗺️ Real-Time Tracking

- **Provider location sharing**
- **Live ETA calculations**
- **Route optimization**
- **Geofencing for service areas**

---

## 👥 User Roles

### 🚗 User (Customer)
- Submit assistance requests
- Track provider location
- View service history
- Rate and review providers

### 🔧 Service Provider
- View nearby requests
- Accept/reject jobs
- Update service status
- Manage availability
- Track earnings and ratings

### 👑 Administrator
- Manage users and providers
- View platform analytics
- Handle disputes
- System configuration

---

## 📊 API Documentation

### Authentication Endpoints

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
```

### User Endpoints

```http
POST /api/user/request-help
GET  /api/user/requests
GET  /api/user/requests/:id
PUT  /api/user/requests/:id/cancel
```

### Provider Endpoints

```http
GET  /api/provider/nearby-requests
PUT  /api/provider/requests/:id/accept
GET  /api/provider/requests
PUT  /api/provider/requests/:id/status
```

### Admin Endpoints

```http
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/admin/requests
GET  /api/admin/analytics
```

### AI Endpoints

```http
POST /api/ai/analyze-image
POST /api/ai/analyze-audio
POST /api/ai/predict-risk
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

### Backend Deployment (Render)

1. **Create Render account**
2. **Connect GitHub repository**
3. **Configure Web Service**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables from `.env`

### Database Setup

**MongoDB Atlas (Recommended)**
1. Create free cluster
2. Configure network access
3. Update `MONGODB_URI` in environment

**Local MongoDB**
```bash
# Install MongoDB
brew install mongodb-community

# Start service
brew services start mongodb-community
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

- Unit tests for API endpoints
- Integration tests for user flows
- Component testing for React components
- Socket.io connection testing

---

## 🔧 Development

### Project Structure

```
driveguardian/
├── backend/                 # Node.js API server
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── uploads/             # File upload directory
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   └── hooks/           # Custom hooks
│   └── public/              # Static assets
└── docs/                    # Documentation
```

### Code Style

- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **TypeScript** ready (can be upgraded)

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📈 Performance

### Optimization Techniques

- **Lazy loading** for React components
- **Image optimization** with WebP support
- **API response caching**
- **Database indexing** for queries
- **Socket.io room management**
- **File compression** for uploads

### Monitoring

- **Response time tracking**
- **Error logging**
- **User analytics**
- **System health checks**

---

## 🔒 Security

### Security Measures

- **JWT authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Rate limiting** for API endpoints
- **CORS configuration**
- **Input validation** and sanitization
- **File upload restrictions**
- **SQL injection prevention**

### Best Practices

- Environment variable protection
- Regular security audits
- Dependency vulnerability scanning
- Secure file storage
- API access logging

---

## 🤝 Support

### Getting Help

- 📖 [Documentation](#documentation)
- 🐛 [Report Issues](https://github.com/yourusername/driveguardian/issues)
- 💬 [Discussions](https://github.com/yourusername/driveguardian/discussions)
- 📧 [Email Support](mailto:support@driveguardian.com)

### FAQ

**Q: How do I get a Google Maps API key?**
A: Visit [Google Cloud Console](https://console.cloud.google.com/) and enable the Maps JavaScript API.

**Q: Can I use my own AI models?**
A: Yes! Replace the dummy AI functions in `/backend/routes/ai.js` with your ML models.

**Q: How do I add new issue types?**
A: Update the issue types array in frontend components and backend validation.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **MongoDB** for the flexible database
- **Socket.io** for real-time communication
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/driveguardian&type=Date)](https://star-history.com/#yourusername/driveguardian&Date)

---

<div align="center">

**Made with ❤️ by the DriveGuardian Team**

[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/driveguardian)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=LinkedIn&logoColor=white)](https://linkedin.com/company/driveguardian)

</div>
