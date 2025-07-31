const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const connectMongoDB = require('./config/mongodb');
const connectRedis = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const loanRoutes = require('./routes/loans');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    messageAr: 'عدد كبير من الطلبات من هذا العنوان، يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tunisian Postal Bank API is running',
    messageAr: 'واجهة برمجة تطبيقات البنك البريدي التونسي تعمل بنجاح',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Tunisian Postal Bank API',
    nameAr: 'واجهة برمجة تطبيقات البنك البريدي التونسي',
    version: '1.0.0',
    description: 'Secure REST API for banking operations',
    descriptionAr: 'واجهة برمجة تطبيقات آمنة للعمليات المصرفية',
    endpoints: {
      auth: '/api/auth',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      loans: '/api/loans',
      notifications: '/api/notifications',
      users: '/api/users',
      admin: '/api/admin'
    },
    documentation: '/api/docs',
    health: '/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', authMiddleware, accountRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/loans', authMiddleware, loanRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their notification room`);
  });
  
  // Handle real-time transaction updates
  socket.on('transaction_update', (data) => {
    socket.to(`user_${data.userId}`).emit('transaction_updated', data);
  });
  
  // Handle loan status updates
  socket.on('loan_update', (data) => {
    socket.to(`user_${data.userId}`).emit('loan_updated', data);
  });
  
  // Handle account balance updates
  socket.on('balance_update', (data) => {
    socket.to(`user_${data.userId}`).emit('balance_updated', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('socketio', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    errorAr: 'نقطة النهاية غير موجودة',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler);

// Database connections
const initializeConnections = async () => {
  try {
    await connectDB();
    await connectMongoDB();
    await connectRedis();
    logger.info('All database connections established successfully');
  } catch (error) {
    logger.error('Failed to establish database connections:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, async () => {
  await initializeConnections();
  
  logger.info(`
    🏛️  Tunisian Postal Bank API Server Started
    📍 URL: http://${HOST}:${PORT}
    🌍 Environment: ${process.env.NODE_ENV}
    🔒 Security: Enhanced with Helmet & Rate Limiting
    🚀 Real-time: Socket.IO enabled
    📊 Monitoring: Winston Logger active
    
    البنك البريدي التونسي - الخادم يعمل بنجاح ✅
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };