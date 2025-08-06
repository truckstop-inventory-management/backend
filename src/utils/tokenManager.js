import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

let token = null;
let expiresAt = null;

const CREDENTIALS = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};

export async function fetchToken() {
  const res = await axios.post(`${process.env.BACKEND_URL}/api/auth/login`, CREDENTIALS);
  token = res.data.token;

  console.log('Fetched token:', token);
  const decoded = jwt.decode(token);
  console.log('Decoded payload:', decoded);

  if (decoded?.exp) {
    expiresAt = decoded.exp * 1000;
    console.log('✅ Token fetched. Expires at:', new Date(expiresAt).toLocaleString());
  } else {
    expiresAt = null;
    console.log('⚠️ Token fetched but no exp found');
  }

  return token;
}

export async function getValidToken() {
  const now = Date.now();
  if (!token || !expiresAt || now >= expiresAt - 60000) {
    console.log('🔄 Refreshing token...');
    await fetchToken();
  }
  // ❌ Remove any log about expiry here to avoid duplicate Invalid Date
  return token;
}