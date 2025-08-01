import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5050';
const USERNAME = 'admin';
const PASSWORD = 'password123';

let token = '';
let itemId = '';

async function checkHealth() {
  console.log('🔍 Checking CouchDB connection...');
  const res = await fetch(`${BASE_URL}/api/db-check`);
  const data = await res.json();
  console.log(data.message === 'Connected to CouchDB' ? '✅ CouchDB Connected' : '❌ CouchDB Connection Failed');
}

async function login() {
  console.log('🔑 Logging in...');
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const data = await res.json();
  token = data.token;
  console.log(token ? '✅ Login Successful' : '❌ Login Failed');
}

async function addItem() {
  console.log('➕ Adding inventory item...');
  const res = await fetch(`${BASE_URL}/api/inventory`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Brake Pads', quantity: 50 }),
  });
  const data = await res.json();
  itemId = data.id || data._id;
  console.log(itemId ? `✅ Item Added (ID: ${itemId})` : '❌ Add Item Failed');
}

async function getItems() {
  console.log('📦 Fetching inventory...');
  const res = await fetch(`${BASE_URL}/api/inventory`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(Array.isArray(data) ? `✅ Retrieved ${data.length} items` : '❌ Fetch Items Failed');
}

async function updateItem() {
  console.log('✏️ Updating item...');
  const res = await fetch(`${BASE_URL}/api/inventory/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Brake Pads - Updated', quantity: 75 }),
  });
  const data = await res.json();
  console.log(data.updatedAt ? '✅ Item Updated' : '❌ Update Failed');
}

async function deleteItem() {
  console.log('🗑️ Deleting item...');
  const res = await fetch(`${BASE_URL}/api/inventory/${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data.message === 'Item deleted successfully' ? '✅ Item Deleted' : '❌ Delete Failed');
}

async function runTests() {
  await checkHealth();
  await login();
  if (!token) return;
  await addItem();
  await getItems();
  await updateItem();
  await deleteItem();
  console.log('🎉 Verification Completed');
}

runTests();