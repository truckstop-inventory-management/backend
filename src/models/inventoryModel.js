//src/models/inventoryModel.js

import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  location: { type: String, required: true },
  lastUpdated: { type: Date, required: true, default: () => new Date() },
}, { timestamps: false, versionKey: '__v' });

export default mongoose.model('InventoryItem', InventoryItemSchema);