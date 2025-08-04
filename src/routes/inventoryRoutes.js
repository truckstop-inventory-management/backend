import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInventory);
router.get('/:id', protect, getInventoryById);
router.put('/:id', protect, updateInventory);
router.delete('/:id', protect, deleteInventory);

export default router;