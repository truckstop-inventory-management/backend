import nano from 'nano';
import dotenv from 'dotenv';
dotenv.config();

// Connect to CouchDB using URL from .env (Render -> Environment Variables)
const couch = nano(process.env.COUCHDB_URL);

// Use 'inventory' database
export const inventoryDB = couch.db.use('inventory');