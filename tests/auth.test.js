import axios from 'axios';

const BASE_URL = 'https://backend-nlxq.onrender.com/api/auth';

async function runAuthTests() {
  try {
    console.log('--- Starting Auth tests ---');

    // Test registration
    const registerData = {
      username: 'testuser',
      password: 'Test@1234'
    };
    const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
    console.log('Register response:', registerResponse.data);

    // Test login
    const loginData = {
      username: 'testuser',
      password: 'Test@1234'
    };
    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('Login response:', loginResponse.data);

    console.log('--- Auth tests completed successfully ---');
  } catch (error) {
    console.error('Auth test error:', error.response?.data || error.message);
  }
}

runAuthTests();