# VideoStream - Video Streaming Platform

A full-stack video streaming platform built with the MERN stack, featuring video upload, streaming, user authentication, Redis caching, rate limiting, and real-time search functionality.

## 🚀 Features

### Backend Features
- **Express.js API** with RESTful endpoints
- **JWT-based Authentication** (register, login, protected routes)
- **Video Upload** with Multer (supports MP4, AVI, MOV, WMV, WebM)
- **MongoDB Integration** with Mongoose for data persistence
- **Redis Caching** for video metadata with TTL (60 seconds)
- **Rate Limiting** using Redis store:
  - Auth endpoints: 5 requests per 15 minutes
  - Video upload: 3 requests per minute
  - Video metadata: 10 requests per minute
- **Video Streaming** with range request support for seeking
- **File Management** with local storage simulation
- **Search Functionality** with MongoDB text indexing
- **Pagination** for video listings
- **Health Check** endpoints for monitoring

### Frontend Features
- **React.js** with TypeScript for type safety
- **React Router** for client-side routing
- **User Authentication** with JWT token management
- **Video Upload Form** with file validation and progress tracking
- **Video Player** using React Player library
- **Video Listing** with search, sorting, and pagination
- **Real-time Search** - Auto-search after 3 characters with debouncing
- **Responsive Design** with mobile-first approach
- **Loading States** and error handling
- **Cache Indicators** showing when data is served from Redis
- **User Dashboard** for managing uploaded videos

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend API | Express.js, Node.js | ^4.18.2 |
| Database | MongoDB with Mongoose | ^8.15.1 |
| Cache & Rate Limiting | Redis | ^5.1.1 |
| Authentication | JWT (JSON Web Tokens) | ^9.0.2 |
| File Upload | Multer | ^2.0.0 |
| Frontend | React.js with TypeScript | ^18.3.1 |
| Routing | React Router v6 | ^6.28.0 |
| Video Player | React Player | ^2.16.0 |
| HTTP Client | Axios | ^1.7.9 |
| Styling | CSS3 with responsive design | - |
| Containerization | Docker & Docker Compose | - |

## 📋 Prerequisites

### For Docker Setup (Recommended)
- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)

### For Manual Setup
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### Option 1: Docker Setup (Recommended) 🐳

The easiest way to run the entire application with all dependencies.

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd video-streaming-platform

# Start all services (Production mode)
docker-compose up -d

# Or start in development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

**That's it!** 🎉 The application will be available at:

**Production Mode:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

**Development Mode:**
- **Frontend**: http://localhost:3000 (with hot reload)
- **Backend API**: http://localhost:5001 (with hot reload)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

#### Docker Commands
```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild containers after code changes
docker-compose up --build

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

#### Docker Services Configuration

**Production Environment (`docker-compose.yml`):**
- **MongoDB**: Pre-configured with admin user and database initialization
- **Redis**: Configured with password authentication and persistence
- **Backend**: Optimized production build with health checks
- **Frontend**: Nginx-served optimized React build with API proxy

**Development Environment (`docker-compose.dev.yml`):**
- **MongoDB**: Same as production but with dev-specific volumes
- **Redis**: Same as production but with dev-specific volumes
- **Backend**: Hot reload with nodemon, source code mounted as volume
- **Frontend**: React development server with hot reload and polling

#### Environment Variables (Docker)
The Docker setup includes pre-configured environment variables:

**Production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/video-streaming-platform?authSource=admin
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
```

**Development:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:password123@mongodb:27017/video-streaming-platform?authSource=admin
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=dev-jwt-secret-key-2024
JWT_EXPIRE=7d
REACT_APP_API_URL=http://localhost:5001/api
```

### Option 2: Manual Setup

For developers who prefer to run services individually.

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd video-streaming-platform
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-streaming-platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

#### 4. Start Services

##### Start MongoDB
```bash
# Using MongoDB service (Linux/macOS)
sudo systemctl start mongod

# Or using MongoDB directly
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

##### Start Redis
```bash
# Using Redis service (Linux/macOS)
sudo systemctl start redis

# Or using Redis directly
redis-server

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

##### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

##### Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
video-streaming-platform/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB & Redis connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── videoController.js   # Video management logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── rateLimiter.js       # Redis-based rate limiting
│   │   └── upload.js            # Multer file upload configuration
│   ├── models/
│   │   ├── User.js              # User schema with validation
│   │   └── Video.js             # Video schema with text indexing
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── videos.js            # Video CRUD routes
│   ├── uploads/                 # Video file storage directory
│   ├── .env                     # Environment variables
│   ├── .dockerignore           # Docker ignore file
│   ├── Dockerfile              # Production Docker image
│   ├── Dockerfile.dev          # Development Docker image
│   ├── healthcheck.js          # Health check script
│   ├── package.json            # Dependencies and scripts
│   └── server.js               # Express server entry point
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation component
│   │   │   ├── VideoCard.tsx    # Video display component
│   │   │   ├── SearchBar.tsx    # Real-time search component
│   │   │   ├── Pagination.tsx   # Pagination component
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Video listing with search/sort
│   │   │   ├── Login.tsx        # User login form
│   │   │   ├── Register.tsx     # User registration form
│   │   │   ├── VideoPlayer.tsx  # Video playback page
│   │   │   ├── VideoUpload.tsx  # Video upload form
│   │   │   └── MyVideos.tsx     # User's video management
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Authentication state management
│   │   ├── services/
│   │   │   └── api.ts           # API service layer with interceptors
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main application component
│   │   ├── App.css              # Global styles
│   │   ├── index.tsx            # React entry point
│   │   └── index.css            # Base styles
│   ├── .dockerignore           # Docker ignore file
│   ├── Dockerfile              # Production Docker image
│   ├── Dockerfile.dev          # Development Docker image
│   ├── nginx.conf              # Nginx configuration for production
│   └── package.json            # Dependencies and scripts
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── mongo-init.js               # MongoDB initialization script
├── .gitignore                  # Git ignore file
└── README.md                   # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Videos
- `GET /api/videos` - Get all videos (with pagination, search, sorting)
- `GET /api/videos/:id` - Get video metadata (cached with Redis)
- `GET /api/videos/:id/stream` - Stream video file with range support
- `POST /api/videos/upload` - Upload video (protected, rate limited)
- `GET /api/videos/my-videos` - Get user's videos (protected)
- `DELETE /api/videos/:id` - Delete video (protected)

### Health Check
- `GET /api/health` - Server health status
- `GET /health` - Frontend health check (Docker)

## 🎯 Key Features Explained

### Real-time Search
- **Auto-search**: Triggers automatically after typing 3 characters
- **Debouncing**: 300ms delay to prevent excessive API calls
- **Manual search**: Still allows search button for queries under 3 characters
- **Clear functionality**: Easy search reset with visual feedback

### Redis Caching
- Video metadata cached for 60 seconds
- Cache hit/miss indicators in the frontend
- Automatic cache invalidation on video updates
- Redis-based rate limiting with IP tracking

### Rate Limiting
- IP-based rate limiting using Redis store
- Different limits for different endpoints:
  - Authentication: 5 requests per 15 minutes
  - Video upload: 3 requests per minute
  - Video metadata: 10 requests per minute
- Graceful error handling with retry suggestions

### Video Streaming
- Range request support for video seeking
- Multiple video format support (MP4, AVI, MOV, WMV, WebM)
- Efficient file serving with proper headers
- Progress tracking during upload

### Authentication & Security
- JWT-based stateless authentication
- Password hashing with bcrypt (12 rounds)
- Protected routes and middleware
- CORS configuration for cross-origin requests
- Input validation and sanitization

### File Upload
- File type validation with MIME type checking
- File size limits (100MB default)
- Unique filename generation to prevent conflicts
- Error handling for invalid files
- Progress tracking with visual feedback

## 🧪 Testing the Application

### 1. Using Docker (Recommended)
```bash
# Start the application
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

### 2. User Registration & Login
1. Navigate to `http://localhost:3000/register`
2. Create a new account with valid email and password
3. Login with your credentials
4. Verify JWT token is stored and user is authenticated

### 3. Video Upload
1. Go to the Upload page (`/upload`)
2. Fill in video details (title, description, tags)
3. Select a video file (MP4, AVI, MOV, WMV, WebM)
4. Monitor upload progress
5. Verify video appears in your videos list

### 4. Video Streaming & Search
1. Browse videos on the home page (`/`)
2. Test real-time search by typing 3+ characters
3. Click on a video to watch
4. Test video seeking and controls
5. Check for cache indicators (Redis hits/misses)

### 5. Search Functionality
1. Type in the search bar (auto-search after 3 characters)
2. Test different search terms
3. Verify debouncing (no excessive API calls)
4. Test manual search with search button
5. Use clear button to reset search

### 6. Pagination & Sorting
1. Navigate through video pages
2. Test different sorting options:
   - Newest/Oldest first
   - Most/Least viewed
   - Title A-Z/Z-A
3. Verify pagination works with search results

### 7. Rate Limiting
1. Make multiple rapid requests to test limits
2. Check error messages and retry suggestions
3. Verify different limits for different endpoints

## 🔒 Security Features

- **JWT Authentication** with secure token handling and expiration
- **Password Hashing** using bcrypt with salt rounds
- **File Type Validation** to prevent malicious uploads
- **Rate Limiting** to prevent abuse and DDoS attacks
- **Input Validation** and sanitization for all endpoints
- **CORS Configuration** for secure cross-origin requests
- **Environment Variables** for sensitive configuration
- **Docker Security** with non-root users and minimal images

## 🚀 Production Deployment

### Docker Production Deployment
```bash
# Build and start production containers
docker-compose up -d --build

# Monitor logs
docker-compose logs -f

# Scale services if needed
docker-compose up -d --scale backend=2
```

### Environment Variables for Production
Update your production environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db-url
REDIS_URL=redis://your-production-redis-url
JWT_SECRET=your-very-secure-production-secret-minimum-32-characters
JWT_EXPIRE=7d
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Process Management (Non-Docker)
Consider using PM2 for production:
```bash
npm install -g pm2
pm2 start backend/server.js --name "video-streaming-api"
pm2 startup
pm2 save
```

### Nginx Configuration (Non-Docker)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Development

### Hot Reload Development
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Or manually
cd backend && npm run dev
cd frontend && npm start
```

### Code Structure Guidelines
- **Backend**: Follow MVC pattern with clear separation of concerns
- **Frontend**: Component-based architecture with TypeScript
- **Styling**: CSS modules or styled-components for component isolation
- **API**: RESTful design with consistent error handling
- **Database**: Proper indexing and validation schemas

### Adding New Features
1. Create feature branch from main
2. Implement backend API endpoints first
3. Add frontend components and pages
4. Update TypeScript types
5. Add proper error handling
6. Test with both Docker and manual setup
7. Update documentation

## 🐛 Troubleshooting

### Common Issues

**Docker Issues:**
```bash
# Clean up Docker resources
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose up --build
```

**Port Conflicts:**
- Check if ports 3000, 5000, 27017, 6379 are available
- Modify port mappings in docker-compose files if needed

**MongoDB Connection:**
- Verify MongoDB is running and accessible
- Check connection string format
- Ensure database permissions are correct

**Redis Connection:**
- Verify Redis is running
- Check Redis password configuration
- Test Redis connectivity with `redis-cli`

**File Upload Issues:**
- Check file size limits (100MB default)
- Verify supported file types
- Ensure uploads directory has write permissions

## 📊 Performance Optimization

### Backend Optimizations
- Redis caching for frequently accessed data
- Database indexing for search queries
- Rate limiting to prevent abuse
- Efficient video streaming with range requests
- Connection pooling for database connections

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Debounced search to reduce API calls
- Pagination to limit data transfer
- Service worker for caching (future enhancement)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## 📝 Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct.

## 🔒 Security

If you discover any security related issues, please email [your-email] instead of using the issue tracker.
For more information, please read our [SECURITY.md](SECURITY.md) file.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

* [React.js](https://reactjs.org/) - Frontend Framework
* [Node.js](https://nodejs.org/) - Backend Runtime
* [Express.js](https://expressjs.com/) - Backend Framework
* [MongoDB](https://www.mongodb.com/) - Database
* [Redis](https://redis.io/) - Caching & Rate Limiting
* [Docker](https://www.docker.com/) - Containerization

## ⚠️ Known Issues

- Video processing might take longer for large files
- Mobile upload is currently limited to 100MB
- Safari browser has limited video format support

## 🗺️ Roadmap

- [ ] Add video processing queue with Bull
- [ ] Implement WebSocket for real-time notifications
- [ ] Add video quality selection
- [ ] Support for live streaming
- [ ] Add user profiles and social features

## 📊 Project Status

This project is actively maintained and in development. We welcome contributions and feedback.

## 📞 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/your_username/video-streaming-platform](https://github.com/your_username/video-streaming-platform)

---

**Happy Streaming! 🎬✨**

*Built with ❤️ using the MERN stack and modern development practices.*
