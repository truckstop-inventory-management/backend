import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { inventoryDB } from './config/config.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Import auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({ origin: 'https://your-netlify-frontend.netlify.app' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);        //Add this line
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('Truckstop Inventory API is running'));

app.get('/test', (req, res) => {
  console.log("/test hit");
  res.send('Test route working');
});

app.listen(PORT, ('0.0.0.0'), () => console.log(`Server running on port ${PORT}`));
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/api/db-check', async (req, res) => {
  console.log("/api/db-check hit"); // Debug log
  try {
    const info = await inventoryDB.info();
    console.log("CouchDB info:", info); // Debug log
    res.json({ message: 'Connected to CouchDB', db: info });
  } catch (err) {
    console.error("DB connection failed:", err.message); // Debug log
    res.status(500).json({ message: 'CouchDB connection failed', error: err.message });
  }
});