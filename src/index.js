import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB (make sure your connection string is correct)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({ origin: 'https://your-netlify-frontend.netlify.app' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('Truckstop Inventory API is running'));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));