import axios from 'axios';

const API_BASE = 'http://localhost:5050/api/inventory';  // adjust if needed

async function runCrudTests() {
  try {
    console.log('--- Starting CRUD tests ---');

    // 1. CREATE an inventory item
    const newItem = {
      itemName: 'Automated Test Item',
      quantity: 5,
      price: 25.5,
      location: 'Test Warehouse',
    };
    const createRes = await axios.post(API_BASE, newItem);
    console.log('CREATE response:', createRes.data);

    const createdId = createRes.data._id;
    if (!createdId) throw new Error('Create failed: No ID returned');

    // 2. READ all items
    const readAllRes = await axios.get(API_BASE);
    console.log('READ ALL response:', readAllRes.data);

    // 3. READ the created item by ID
    const readOneRes = await axios.get(`${API_BASE}/${createdId}`);
    console.log('READ ONE response:', readOneRes.data);

    // 4. UPDATE the created item
    const updatedData = {
      quantity: 10,
      price: 30.0,
      location: 'Updated Warehouse',
    };
    const updateRes = await axios.put(`${API_BASE}/${createdId}`, updatedData);
    console.log('UPDATE response:', updateRes.data);

    // 5. DELETE the created item
    const deleteRes = await axios.delete(`${API_BASE}/${createdId}`);
    console.log('DELETE response:', deleteRes.data);

    console.log('--- CRUD tests completed successfully ---');
  } catch (err) {
    console.error('CRUD test error:', err.response ? err.response.data : err.message);
  }
}

runCrudTests();