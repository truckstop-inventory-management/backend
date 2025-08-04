import axios from 'axios';

const BASE_URL = 'https://backend-nlxq.onrender.com/api';
const USERNAME = 'testuser';       // Use your test user
const PASSWORD = 'Test@1234'; // Use the correct password

async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    return response.data.token;
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function runCrudTests() {
  console.log('--- Starting CRUD tests ---');
  
  const token = await getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // CREATE
    const createRes = await axios.post(
      `${BASE_URL}/inventory`,
      {
        itemName: 'Automated Test Item',
        quantity: 5,
        price: 25.5,
        location: 'Test Warehouse',
      },
      { headers }
    );
    console.log('CREATE response:', createRes.data);

    const createdId = createRes.data._id;

    // READ ALL
    const readAllRes = await axios.get(`${BASE_URL}/inventory`, { headers });
    console.log('READ ALL response:', readAllRes.data);

    // READ ONE
    const readOneRes = await axios.get(`${BASE_URL}/inventory/${createdId}`, { headers });
    console.log('READ ONE response:', readOneRes.data);

    // UPDATE
    const updateRes = await axios.put(
      `${BASE_URL}/inventory/${createdId}`,
      {
        itemName: 'Automated Test Item',
        quantity: 10,
        price: 30,
        location: 'Updated Warehouse',
      },
      { headers }
    );
    console.log('UPDATE response:', updateRes.data);

    // DELETE
    const deleteRes = await axios.delete(`${BASE_URL}/inventory/${createdId}`, { headers });
    console.log('DELETE response:', deleteRes.data);

    console.log('--- CRUD tests completed successfully ---');
  } catch (err) {
    console.error('CRUD test error:', err.response?.data || err.message);
  }
}

runCrudTests();