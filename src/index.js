import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import { getValidToken } from './utils/tokenManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// CORS allowed origins
const allowedOrigins = [
  'https://truckstop-inventory-management.netlify.app',
  'capacitor://localhost',
  'capacitor://localhost:5173',
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1',
];

// CORS middleware with dynamic origin check ignoring trailing slash
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // Allow requests like Postman or server-to-server

      const originNoSlash = origin.replace(/\/$/, ''); // Remove trailing slash if any

      if (allowedOrigins.includes(originNoSlash)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI
    || 'mongodb+srv://admin:admin@truckstop-inventory-clu.ioozj2k.mongodb.net/?retryWrites=true&w=majority&appName=truckstop-inventory-cluster',
  )
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/', (req, res) => res.send('Truckstop Inventory API is running'));

app.get('/test', (req, res) => {
  console.log('/test hit');
  res.send('Test route working');
});

// Database check route
app.get('/api/db-check', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.json({ message: 'Connected to MongoDB' });
    } else {
      res.status(500).json({ message: 'MongoDB connection not ready', state: dbState });
    }
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ message: 'MongoDB connection failed', error: err.message });
  }
});

getValidToken()
  .then(() => console.log('🔑 Initial token fetched and ready'))
  .catch((err) => console.error('❌ Failed to fetch initial token:', err.message));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import {
  ingestMetrics,
  getMetricsHealth,
} from '../controllers/metricsController.js';

const router = express.Router();

// GET  /api/metrics/lookup   → health/info
router.get('/lookup', getMetricsHealth);

// POST /api/metrics/lookup   → ingest metrics batch
router.post('/lookup', ingestMetrics);

export default router;