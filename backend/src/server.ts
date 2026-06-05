import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Routes
import authRoutes from './routes/authRoutes';
import startupRoutes from './routes/startupRoutes';
import projectRoutes from './routes/projectRoutes';
import mentorRoutes from './routes/mentorRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import newsRoutes from './routes/newsRoutes';

// Load Env
dotenv.config();

// Create Express Server
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads statically
const uploadsPath = path.join(__dirname, '..', 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log(`Static file upload directory served from: ${uploadsPath}`);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/news', newsRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'StartupHub API is active and healthy.' });
});

// 404 Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Launch server
app.listen(PORT, () => {
  console.log(`[StartupHub Backend] running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
