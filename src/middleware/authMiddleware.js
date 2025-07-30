export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  // Verify token (e.g., with JWT)
  // jwt.verify(token, process.env.JWT_SECRET, ...)

  next();
};