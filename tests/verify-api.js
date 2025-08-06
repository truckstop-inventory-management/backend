import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://backend-nlxq.onrender.com';
const CREDENTIALS = { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD };

const logFile = path.join('./tests', 'api-test-results.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = `[${new Date().toISOString()}] ${message}`;
  console.log(timestamp);
  logStream.write(timestamp + '\n');
}

// 🔑 Fetch fresh token each time
async function getToken() {
  log('🔑 Logging in to fetch token...');
  const res = await axios.post(`${BASE_URL}/api/auth/login`, CREDENTIALS);
  log('✅ Token fetched successfully.');
  return res.data.token;
}

// 🔍 Run tests
async function runTests() {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // 1️⃣ GET inventory
    const getRes = await axios.get(`${BASE_URL}/api/inventory`, { headers });
    log(`✅ GET /api/inventory - ${getRes.status}`);
    log(`Inventory: ${JSON.stringify(getRes.data)}`);

    // 2️⃣ POST new item (all required fields)
    const newItem = { 
      itemName: 'Sample Item', 
      quantity: 10, 
      price: 12.99, 
      location: 'Main Warehouse' 
    };
    const postRes = await axios.post(`${BASE_URL}/api/inventory`, newItem, { headers });
    log(`✅ POST /api/inventory - ${postRes.status}`);
    log(`Created: ${JSON.stringify(postRes.data)}`);
    const itemId = postRes.data._id;

    // 3️⃣ PUT update item (update all fields properly)
    const updatedItem = { 
      itemName: 'Updated Item', 
      quantity: 15, 
      price: 14.99, 
      location: 'Front Store' 
    };
    const putRes = await axios.put(`${BASE_URL}/api/inventory/${itemId}`, updatedItem, { headers });
    log(`✅ PUT /api/inventory/${itemId} - ${putRes.status}`);
    log(`Updated: ${JSON.stringify(putRes.data)}`);

    // 4️⃣ DELETE item
    const deleteRes = await axios.delete(`${BASE_URL}/api/inventory/${itemId}`, { headers });
    log(`✅ DELETE /api/inventory/${itemId} - ${deleteRes.status}`);
    log(`Deleted: ${JSON.stringify(deleteRes.data)}`);

  } catch (error) {
    if (error.response) {
      log(`❌ Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      log(`❌ Error: ${error.message}`);
    }
  } finally {
    logStream.end();
  }
}

runTests();