import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import screeningRoutes from './routes/screenings';
import bookingRoutes from './routes/bookings';
import counsellorRoutes from './routes/counsellors';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import adminExtendedRoutes from './routes/adminExtended';
import counsellorAuthRoutes from './routes/counsellor';
import counsellorExtendedRoutes from './routes/counsellorExtended';
import forumRoutes from './routes/forum';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting (more lenient for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.version,
  };
  
  res.json(healthStatus);
});

// Clear rate limit cache (for development)
app.post('/clear-rate-limit', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    // Clear rate limit cache
    limiter.resetKey(req.ip);
    res.json({ message: 'Rate limit cleared for IP: ' + req.ip });
  } else {
    res.status(403).json({ error: 'Not available in production' });
  }
});

// Detailed health check for monitoring
app.get('/health/detailed', (req, res) => {
  const detailedStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100 + ' MB',
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    },
    version: process.version,
    platform: process.platform,
    pid: process.pid,
  };
  
  res.json(detailedStatus);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/extended', adminExtendedRoutes);
app.use('/api/counsellor', counsellorAuthRoutes);
app.use('/api/counsellor/extended', counsellorExtendedRoutes);
app.use('/api/forum', forumRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    
    // MongoDB connection options for better stability
    const mongoOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    };
    
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('Connected to MongoDB');

    // Handle MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(startServer, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Run seed script if ALLOW_MINIMAL_SEED is true
    if (process.env.ALLOW_MINIMAL_SEED === 'true') {
      const { seedDatabase } = await import('./scripts/seed');
      const { seedUsers } = await import('./scripts/seedUsers');
      await seedDatabase();
      await seedUsers();
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit immediately, retry after 5 seconds
    setTimeout(startServer, 5000);
  }
};

startServer();

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Gracefully closing MongoDB connection...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Gracefully closing MongoDB connection...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

export default app;
