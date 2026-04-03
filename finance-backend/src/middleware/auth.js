const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError('User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new ApiError('Your account has been deactivated.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token has expired. Please login again.', 401));
    }
    next(error);
  }
};

module.exports = authenticate;
