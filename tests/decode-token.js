import jwt from 'jsonwebtoken';

const token = 'PASTE_YOUR_TOKEN_HERE';
const decoded = jwt.decode(token);
console.log('Decoded Token:', decoded);