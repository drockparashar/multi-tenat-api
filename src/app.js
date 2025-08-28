import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import router from './routes/index.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// JSON parsing
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 60000,
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
});
app.use(limiter);

// Main API routes
app.use('/api', router);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant API is running.' });
});

export default app;

