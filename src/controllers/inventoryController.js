import Inventory from '../models/inventoryModel.js';

// Create
export const createInventory = async (req, res) => {
  try {
    const { itemName, location, quantity, price } = req.body;

    if (!itemName || !location) {
      return res.status(400).json({ message: "itemName and location are required" });
    }

    // 🔍 Check for existing item with same name + location
    const existing = await Inventory.findOne({ itemName, location });
    if (existing) {
      return res.status(409).json({ message: "Item already exists, please update instead" });
    }

    const body = {
      itemName,
      location,
      quantity: typeof quantity === "number" ? quantity : 0,
      price: typeof price === "number" ? price : 0,
      lastUpdated: req.body.lastUpdated ? new Date(req.body.lastUpdated) : new Date(),
    };

    const newItem = new Inventory(body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all
export const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get by ID
export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update with Last-Write-Wins
export const updateInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const serverDoc = await Inventory.findById(id);
    if (!serverDoc) return res.status(404).json({ message: 'Item not found' });

    const clientTs = req.body.lastUpdated ? new Date(req.body.lastUpdated).getTime() : 0;
    const serverTs = new Date(serverDoc.lastUpdated).getTime();

    // If client is older → reject with 409 + server copy
    if (clientTs < serverTs) {
      return res.status(409).json({
        message: 'Conflict: client is older than server',
        server: serverDoc.toObject(),
      });
    }

    // Accept update (newer or equal)
    serverDoc.itemName = req.body.itemName ?? serverDoc.itemName;
    serverDoc.quantity = typeof req.body.quantity === 'number' ? req.body.quantity : serverDoc.quantity;
    serverDoc.price = typeof req.body.price === 'number' ? req.body.price : serverDoc.price;
    serverDoc.location = req.body.location ?? serverDoc.location;
    serverDoc.lastUpdated = req.body.lastUpdated ? new Date(req.body.lastUpdated) : new Date();

    const updatedItem = await serverDoc.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete one
export const deleteInventory = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all
export const deleteAllInventory = async (req, res) => {
  try {
    await Inventory.deleteMany({ user: req.user._id });
    res.status(200).json({ message: 'All inventory items deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete inventory', error: err.message });
  }
};