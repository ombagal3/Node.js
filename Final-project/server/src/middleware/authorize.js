/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles ('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not possess the required permissions to perform this action.',
      });
    }

    next();
  };
};

module.exports = authorize;
