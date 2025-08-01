import express from 'express';
import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';

const router = express.Router();

router.post('/', createInventory);
router.get('/', getAllInventory);
router.get('/:id', getInventoryById);          // <-- Add this line for GET by ID
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;