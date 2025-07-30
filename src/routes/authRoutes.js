import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Temporary static login (replace with DB user check later)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // For now, simple check (later: connect to CouchDB users)
  if (username === 'admin' && password === 'password123') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

export default router;