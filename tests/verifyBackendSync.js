import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `${process.env.BACKEND_URL}/api/inventory`;

async function getToken() {
  try {
    const res = await axios.post(`${process.env.BACKEND_URL}/api/auth/login`, {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    });

    console.log('🔐 Token fetched successfully');
    return res.data.token;
  } catch (err) {
    console.error('❌ Failed to fetch token:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function clearBackendInventory(token) {
  try {
    const res = await axios.delete(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('🧹 Cleared backend inventory:', res.data.message);
  } catch (err) {
    console.error('❌ Failed to clear inventory:', err.response?.data || err.message);
  }
}

async function addAndVerifyItems(token) {
  const testItems = [
  {
    itemName: 'Wrench',
    quantity: 12,
    unit: 'pcs',
    location: 'Garage',
    price: 15.99
  },
  {
    itemName: 'Motor Oil',
    quantity: 4,
    unit: 'liters',
    location: 'Shelf A',
    price: 22.5
  },
  {
    itemName: 'Brake Fluid',
    quantity: 6,
    unit: 'bottles',
    location: 'Shelf B',
    price: 9.99
  }
];


  for (const item of testItems) {
    const res = await axios.post(BASE_URL, item, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`➕ Added item: ${item.itemName} (${item.quantity} ${item.unit})`);
  }

  const { data: items } = await axios.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log(`📦 Total items in backend: ${items.length}`);
  
  items.forEach(i => console.log(`   - ${i.itemName}: ${i.quantity} @ $${i.price} (${i.location})`));


}

(async () => {
  const token = await getToken();
  await clearBackendInventory(token);
  await addAndVerifyItems(token);
})();