import express from 'express';
import { getInventory, addItem, updateItem, deleteItem } from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js'; // ✅ Import middleware

const router = express.Router();

//Apply `protect` so only authenticated users can access these endpoints
router.get('/', protect, getInventory);
router.post('/', protect, addItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;