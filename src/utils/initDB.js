//src/utils/initDB.js

import nano from 'nano';
import dotenv from 'dotenv';
dotenv.config();

const couch = nano(process.env.COUCHDB_URL);

async function initDB() {
  try {
    await couch.db.create('inventory'); // Only creates if it doesn't exist
    console.log('✅ Inventory database ready.');
  } catch (err) {
    if (err.statusCode === 412) {
      console.log('ℹ️ Database already exists.');
    } else {
      console.error('❌ DB creation failed:', err);
    }
  }
}

initDB();