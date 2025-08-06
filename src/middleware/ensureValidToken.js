import { getValidToken } from '../utils/tokenManager.js';

export async function ensureValidToken(req, res, next) {
  try {
    const token = await getValidToken();
    req.token = token;
    next();
  } catch (err) {
    console.error('❌ Token refresh failed:', err.message);
    res.status(500).json({ message: 'Token refresh failed', error: err.message });
  }
}