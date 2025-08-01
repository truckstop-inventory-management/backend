import axios from 'axios';

// === CONFIGURATION ===
const BASE_URL = 'https://backend-nlxq.onrender.com/api/inventory';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU0MDU2OTQxLCJleHAiOjE3NTQwNjA1NDF9.EqyS84iz5ooUhgYADMgtL3iC3MaR0xuQGGBN6gYksrU';

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

function logStep(step, message, data = null) {
  console.log(`\n🔹 [${step}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

async function runCrudTests() {
  try {
    // ✅ 1. VERIFY TOKEN
    logStep('1', 'Verifying token and fetching inventory...');
    const readRes = await axios.get(BASE_URL, { headers });
    logStep('READ', 'Inventory fetched', readRes.data);

    // ✅ 2. CREATE ITEM
    logStep('2', 'Creating new item...');
    const newItem = { name: 'Test Brake Fluid', quantity: 25 };
    const createRes = await axios.post(BASE_URL, newItem, { headers });
    logStep('CREATE', 'Item created', createRes.data);

    const itemId = createRes.data.id; // ✅ FIXED: Use `id` instead of `_id`


    // ✅ 3. UPDATE ITEM
    logStep('3', `Updating item ${itemId}...`);
    const updatedItem = { quantity: 40 };
    const updateRes = await axios.put(`${BASE_URL}/${itemId}`, updatedItem, { headers });
    logStep('UPDATE', 'Item updated', updateRes.data);

    // ✅ 4. DELETE ITEM
    logStep('4', `Deleting item ${itemId}...`);
    const deleteRes = await axios.delete(`${BASE_URL}/${itemId}`, { headers });
    logStep('DELETE', 'Item deleted', deleteRes.data);

    // ✅ 5. FINAL READ
    logStep('5', 'Fetching inventory after CRUD...');
    const finalRead = await axios.get(BASE_URL, { headers });
    logStep('FINAL READ', 'Inventory now', finalRead.data);

    console.log('\n✅ CRUD Automation Completed Successfully!\n');
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:', error.response?.data || error.message);
    process.exit(1);
  }
}

runCrudTests();