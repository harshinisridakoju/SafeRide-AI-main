# 🚀 Deployment Guide

This comprehensive guide covers deploying DriveGuardian to production environments.

## 📋 Table of Contents

- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [Domain Configuration](#domain-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Security Hardening](#security-hardening)

---

## 🌐 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository
- React build configuration

### Step-by-Step Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Project Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
   ```

6. **Custom Domain (Optional)**
   ```bash
   vercel domains add yourdomain.com
   ```

### Vercel Configuration

Create `vercel.json` in frontend root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "functions": {
    "api/*.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 🖥️ Backend Deployment (Render)

### Prerequisites
- Render account
- GitHub repository
- MongoDB connection string

### Step-by-Step Deployment

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Create Web Service**
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure Service**
   ```yaml
   # Environment (render.yaml)
   services:
     - type: web
       name: driveguardian-api
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GOOGLE_MAPS_API_KEY=your_maps_api_key
   FRONTEND_URL=https://your-frontend-url.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on push to main branch

### Render Configuration

Create `render.yaml` in backend root:
```yaml
services:
  - type: web
    name: driveguardian-api
    runtime: node
    plan: free
    region: oregon
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_MAPS_API_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### Prerequisites
- MongoDB Atlas account
- Google Cloud account (for free tier)

### Step-by-Step Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Cluster"
   - Select "M0 Sandbox" (free)
   - Choose cloud provider and region
   - Cluster name: `driveguardian`

3. **Configure Security**
   ```bash
   # Add IP Address (0.0.0.0/0 for all access - not recommended for production)
   # Create Database User
   Username: driveguardian
   Password: your_secure_password
   ```

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Update with your database user and password

5. **Environment Variable**
   ```
   MONGODB_URI=mongodb+srv://driveguardian:your_password@cluster0.mongodb.net/driveguardian?retryWrites=true&w=majority
   ```

### Database Optimization

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ location: "2dsphere" });
db.requests.createIndex({ userId: 1 });
db.requests.createIndex({ providerId: 1 });
db.requests.createIndex({ status: 1 });
db.requests.createIndex({ location: "2dsphere" });
db.requests.createIndex({ createdAt: -1 });
```

---

## ⚙️ Environment Configuration

### Production Environment Variables

Create `.env.production` in backend:
```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/driveguardian

# Authentication
JWT_SECRET=your_super_secure_jwt_key_min_32_characters

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=uploads/

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment

Create `.env.production` in frontend:
```env
VITE_API_URL=https://your-api-domain.com
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

---

## 🌐 Domain Configuration

### Custom Domain Setup

#### Vercel (Frontend)
```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# A record: CNAME cname.vercel-dns.com
```

#### Render (Backend)
```bash
# Add custom domain
# In Render dashboard → Service → Settings → Custom Domains
# Add your domain: api.yourdomain.com

# Configure DNS
# A record: render.com's IP addresses
```

### DNS Configuration

```
# Example DNS records
yourdomain.com      A     76.76.21.21     # Vercel
api.yourdomain.com  A     34.117.59.81     # Render
www.yourdomain.com  CNAME yourdomain.com
```

---

## 🔒 SSL/HTTPS Setup

### Automatic SSL

Both Vercel and Render provide free SSL certificates:
- **Vercel**: Automatic HTTPS for all deployments
- **Render**: Automatic SSL for custom domains

### Manual SSL (if needed)

```bash
# Generate SSL certificate (Let's Encrypt)
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Configure nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Frontend (Vercel Analytics)
```javascript
// Vercel Analytics is automatic
// Add custom tracking if needed
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return <Analytics />;
}
```

#### Backend (Render Logs)
```javascript
// Custom logging middleware
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

### Error Tracking

```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
```

---

## ⚡ Performance Optimization

### Frontend Optimization

#### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          socket: ['socket.io-client']
        }
      }
    },
    minify: 'terser',
    sourcemap: false
  },
  server: {
    host: true
  }
});
```

#### Caching Strategy
```javascript
// Service worker for caching
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Backend Optimization

#### Database Indexing
```javascript
// Create compound indexes
db.requests.createIndex({ 
  status: 1, 
  createdAt: -1 
});

db.requests.createIndex({ 
  location: "2dsphere", 
  status: 1 
});
```

#### Caching Strategy
```javascript
// Redis caching (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache API responses
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.locals.cacheKey = key;
    res.locals.cacheDuration = duration;
    next();
  };
};
```

---

## 🔐 Security Hardening

### Environment Security

1. **Use environment-specific configs**
2. **Rotate secrets regularly**
3. **Use strong passwords**
4. **Enable 2FA on accounts**

### Application Security

```javascript
// Security headers middleware
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Database Security

```javascript
// Input validation
const validator = require('validator');

const validateInput = (req, res, next) => {
  const { email, phone } = req.body;
  
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (phone && !validator.isMobilePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  
  next();
};
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeyer/render-action@v0.6.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## 📱 Mobile Optimization

### Progressive Web App

Create `public/manifest.json`:
```json
{
  "name": "DriveGuardian",
  "short_name": "DriveGuardian",
  "description": "Smart Roadside Assistance",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

Create `public/sw.js`:
```javascript
const CACHE_NAME = 'driveguardian-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Deployment Issues
```bash
# Build fails
npm run build

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Vercel logs
vercel logs
```

#### Backend Deployment Issues
```bash
# Check Render logs
# In Render dashboard → Service → Logs

# Database connection
ping your-mongodb-cluster.mongodb.net

# Environment variables
printenv | grep MONGODB
```

#### Performance Issues
```bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s "https://api.yourdomain.com/health"

# Database performance
db.runCommand({ "profile": 1 })
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**
   - Use multiple backend instances
   - Configure load balancer

2. **Database Scaling**
   - Read replicas for read operations
   - Sharding for large datasets

3. **CDN Configuration**
   - Serve static assets via CDN
   - Cache API responses

### Monitoring Scaling

```javascript
// Performance metrics
const performanceMetrics = {
  responseTime: [],
  errorRate: [],
  activeUsers: [],
  databaseConnections: []
};

// Scaling triggers
if (activeUsers > 1000) {
  // Scale up backend instances
}
```

---

## 🎯 Production Checklist

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Performance testing completed

### Post-Deployment Checklist

- [ ] Verify all endpoints work
- [ ] Test real-time features
- [ ] Check mobile responsiveness
- [ ] Validate file uploads
- [ ] Test authentication flow
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test backup recovery

---

## 🆘 Support

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Render Support**: [render.com/support](https://render.com/support)
- **MongoDB Support**: [docs.mongodb.com/manual/support](https://docs.mongodb.com/manual/support)

### Community Resources

- **Discord Server**: [Join our community](https://discord.gg/driveguardian)
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/driveguardian/discussions)
- **Documentation**: [Full docs](https://docs.driveguardian.com)

---

## 🔄 Maintenance

### Regular Tasks

- **Weekly**: Update dependencies, check logs
- **Monthly**: Review performance metrics, backup database
- **Quarterly**: Security audit, scaling review

### Automation

```bash
# Automated backup script
#!/bin/bash
mongodump --uri="$MONGODB_URI" --out="/backups/$(date +%Y%m%d)"

# Dependency update script
npm audit fix
npm update
```

---

**🎉 Congratulations! Your DriveGuardian application is now deployed and ready to help drivers on the road!**
