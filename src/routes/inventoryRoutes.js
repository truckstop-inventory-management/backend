import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  deleteAllInventory
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInventory);
router.get('/', protect, getAllInventory);        // Added route for GET all
router.get('/:id', protect, getInventoryById);
router.put('/:id', protect, updateInventory);
router.delete('/:id', protect, deleteAllInventory);
// router.deleteAllInventory('/', protect, deleteAllInventory);

export default router;