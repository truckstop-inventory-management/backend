import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// MongoDB Connection
// MongoDB Connection
mongoose.connect('mongodb+srv://admin:admin@truckstop-inventory-clu.ioozj2k.mongodb.net/?retryWrites=true&w=majority&appName=truckstop-inventory-cluster')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
//app.use(cors({ origin: 'https://your-netlify-frontend.netlify.app' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);       
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('Truckstop Inventory API is running'));

app.get('/test', (req, res) => {
  console.log("/test hit");
  res.send('Test route working');
});

// Database check route (MongoDB version)
app.get('/api/db-check', async (req, res) => {
  console.log("/api/db-check hit");
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.json({ message: 'Connected to MongoDB' });
    } else {
      res.status(500).json({ message: 'MongoDB connection not ready', state: dbState });
    }
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ message: 'MongoDB connection failed', error: err.message });
  }
});

app.get('/api/db-check', async (req, res) => {
  console.log("/api/db-check hit");
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.json({ message: '✅ Connected to MongoDB' });
    } else {
      res.status(500).json({ message: 'MongoDB connection not ready', state: dbState });
    }
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ message: 'MongoDB connection failed', error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));