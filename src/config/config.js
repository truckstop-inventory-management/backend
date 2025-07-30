import nano from 'nano';
import dotenv from 'dotenv';
dotenv.config();

const couch = nano(process.env.COUCHDB_URL); 
export default couch;