const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const authMiddleware = async (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the company by id
    const company = await Company.findById(decoded.id).select('-password');
    if (!company) {
      return res.status(401).json({ message: 'Company not found' });
    }

    // Check if the company is verified
    if (!company.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to access this resource' });
    }

    // Attach the company to the request object
    req.user = company;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = authMiddleware;