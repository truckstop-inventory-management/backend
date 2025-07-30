// src/controllers/inventoryController.js

// Example inventory data (you will replace with CouchDB later)
let inventory = [
  { id: 1, name: 'Tires', quantity: 50 },
  { id: 2, name: 'Oil', quantity: 30 }
];

// GET all inventory items
export const getInventory = (req, res) => {
  res.json(inventory);
};

// ADD a new inventory item
export const addItem = (req, res) => {
  const { name, quantity } = req.body;
  const newItem = { id: Date.now(), name, quantity };
  inventory.push(newItem);
  res.status(201).json(newItem);
};