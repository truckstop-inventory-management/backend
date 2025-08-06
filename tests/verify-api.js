// tests/verify-api.js
import axios from 'axios';

const BASE_URL = 'https://backend-nlxq.onrender.com'; // ✅ Corrected URL
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU0MDUzNTg4LCJleHAiOjE3NTQwNTcxODh9.TUptBuYoIaTkr5NFYqmDhwOYOiRoum5xeAGsyzIXMMk';

const headers = { Authorization: `Bearer ${TOKEN}` };

async function runTests() {
  try {
    // 1. GET all inventory
    const getRes = await axios.get(`${BASE_URL}/api/inventory`, { headers });
    console.log(`✅ GET /api/inventory - Status: ${getRes.status}`);
    console.log('Inventory:', getRes.data);

    // 2. POST new item
    const newItem = { name: 'Sample Item', quantity: 10 };
    const postRes = await axios.post(`${BASE_URL}/api/inventory`, newItem, { headers });
    console.log(`✅ POST /api/inventory - Status: ${postRes.status}`);
    console.log('Created Item:', postRes.data);
    const itemId = postRes.data._id;

    // 3. PUT update item
    const updatedItem = { name: 'Updated Item', quantity: 15 };
    const putRes = await axios.put(`${BASE_URL}/api/inventory/${itemId}`, updatedItem, { headers });
    console.log(`✅ PUT /api/inventory/${itemId} - Status: ${putRes.status}`);
    console.log('Updated Item:', putRes.data);

    // 4. DELETE item
    const deleteRes = await axios.delete(`${BASE_URL}/api/inventory/${itemId}`, { headers });
    console.log(`✅ DELETE /api/inventory/${itemId} - Status: ${deleteRes.status}`);
    console.log('Deleted:', deleteRes.data);

  } catch (error) {
    if (error.response) {
      console.error(`❌ Error: ${error.response.status}`, error.response.data);
    } else {
      console.error(`❌ Error:`, error.message);
    }
  }
}

runTests();