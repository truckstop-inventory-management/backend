import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors({ origin: 'https://your-netlify-app.netlify.app' }));
app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;