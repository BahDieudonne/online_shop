/**
 * Role-Based Access Control middleware
 * Roles: super_admin > admin > manager > staff > customer_support > customer
 */
const ROLE_HIERARCHY = {
  super_admin: 6,
  admin: 5,
  manager: 4,
  staff: 3,
  customer_support: 2,
  customer: 1,
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] || 0));
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

// Convenience aliases
const isAdmin = authorize('admin');
const isManager = authorize('manager');
const isStaff = authorize('staff');
const isSupport = authorize('customer_support');

module.exports = { authorize, isAdmin, isManager, isStaff, isSupport };
