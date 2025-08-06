import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://backend-nlxq.onrender.com';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU0MDUzNTg4LCJleHAiOjE3NTQwNTcxODh9.TUptBuYoIaTkr5NFYqmDhwOYOiRoum5xeAGsyzIXMMk';
const headers = { Authorization: `Bearer ${TOKEN}` };

const logFile = path.join('./tests', 'api-test-results.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamped = `[${new Date().toISOString()}] ${message}`;
  console.log(timestamped);
  logStream.write(timestamped + '\n');
}

async function runTests() {
  try {
    // 1. GET all inventory
    const getRes = await axios.get(`${BASE_URL}/api/inventory`, { headers });
    log(`✅ GET /api/inventory - Status: ${getRes.status}`);
    log('Inventory: ' + JSON.stringify(getRes.data));

    // 2. POST new item
    const newItem = { name: 'Sample Item', quantity: 10 };
    const postRes = await axios.post(`${BASE_URL}/api/inventory`, newItem, { headers });
    log(`✅ POST /api/inventory - Status: ${postRes.status}`);
    log('Created Item: ' + JSON.stringify(postRes.data));
    const itemId = postRes.data._id;

    // 3. PUT update item
    const updatedItem = { name: 'Updated Item', quantity: 15 };
    const putRes = await axios.put(`${BASE_URL}/api/inventory/${itemId}`, updatedItem, { headers });
    log(`✅ PUT /api/inventory/${itemId} - Status: ${putRes.status}`);
    log('Updated Item: ' + JSON.stringify(putRes.data));

    // 4. DELETE item
    const deleteRes = await axios.delete(`${BASE_URL}/api/inventory/${itemId}`, { headers });
    log(`✅ DELETE /api/inventory/${itemId} - Status: ${deleteRes.status}`);
    log('Deleted: ' + JSON.stringify(deleteRes.data));

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