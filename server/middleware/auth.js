import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    const token = req.cookies.token || bearerToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

export const employerOnly = (req, res, next) => {
  if (req.userRole !== 'employer') {
    return res.status(403).json({ message: 'Employer access only' });
  }
  next();
};
