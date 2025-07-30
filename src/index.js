import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'https://your-netlify-frontend.netlify.app' }));
app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('Truckstop Inventory API is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));