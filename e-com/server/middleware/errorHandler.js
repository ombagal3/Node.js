/**
 * Centralized Application Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error for server diagnostics
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with identifier of '${err.value}'`;
    return res.status(404).json({
      success: false,
      message
    });
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' entered for ${field}. It must be unique.`;
    return res.status(400).json({
      success: false,
      message,
      field
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please review the highlighted fields.',
      errors
    });
  }

  // JSON Web Token Error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }

  // Token Expired Error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Session has expired. Please sign in again.'
    });
  }

  // Default response
  const statusCode = error.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An unexpected internal server error occurred.'
  });
}

/**
 * 404 Not Found Middleware for unmatched routes
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.originalUrl}' does not exist on this server.`
  });
}

module.exports = { errorHandler, notFound };
