const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  location: { type: String, required: true },

  // LWW timestamp (server truth)
  lastUpdated: { type: Date, required: true, default: () => new Date() },
}, { timestamps: false, versionKey: '__v' });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);