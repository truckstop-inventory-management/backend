import { inventoryDB } from '../config/config.js';

// GET all inventory items
export const getInventory = async (req, res) => {
  try {
    const result = await inventoryDB.list({ include_docs: true });
    const items = result.rows.map(row => row.doc);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

// ADD new item
export const addItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const newItem = { name, quantity, createdAt: new Date().toISOString() };
    const response = await inventoryDB.insert(newItem);
    res.status(201).json({ id: response.id, ...newItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item', details: err.message });
  }
};

// UPDATE existing item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity } = req.body;

    const doc = await inventoryDB.get(id);
    const updatedItem = { ...doc, name, quantity, updatedAt: new Date().toISOString() };

    const response = await inventoryDB.insert(updatedItem);
    res.json({ id: response.id, ...updatedItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
};

// DELETE item (ensure this is present and correctly exported)
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await inventoryDB.get(id);
    await inventoryDB.destroy(doc._id, doc._rev);
    res.json({ message: 'Item deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
};