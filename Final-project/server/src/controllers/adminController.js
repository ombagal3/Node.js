const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Record = require('../models/Record');

/**
 * Get all users with server-side search, filtering, sorting, and pagination
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, status, role, fromDate, toDate, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Search query (name or email)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Filter by active status
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    // Filter by role
    if (role && ['admin', 'user'].includes(role)) {
      query.role = role;
    }

    // Filter by registration date
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Sorting
    const allowedSortFields = ['name', 'email', 'createdAt', 'role', 'isActive'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, totalItems] = await Promise.all([
      User.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates a new user (can assign role)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', isActive = true } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Get count of records assigned to or created by this user
    const [assignedCount, createdCount] = await Promise.all([
      Record.countDocuments({ assignedTo: id }),
      Record.countDocuments({ createdBy: id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          assignedRecords: assignedCount,
          createdRecords: createdCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to safeguard the last active administrator
 */
const ensureNotLastActiveAdmin = async (targetUserId) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return null;

  if (targetUser.role === 'admin' && targetUser.isActive) {
    const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (activeAdminCount <= 1) {
      return true; // Is the last active admin!
    }
  }
  return false;
};

/**
 * Edit user details
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      });
    }

    const user = await User.findById(id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Safeguard last active admin against deactivation or role downgrade
    if ((role === 'user' || isActive === false) && user.role === 'admin' && user.isActive) {
      const isLastAdmin = await ensureNotLastActiveAdmin(id);
      if (isLastAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied. Cannot demote or deactivate the last active administrator.',
        });
      }
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use by another account.',
        });
      }
      user.email = normalizedEmail;
    }

    if (name) user.name = name.trim();
    if (role && ['admin', 'user'].includes(role)) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    const updatedUser = await User.findById(id);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle or set user active status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean field is required.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Safeguard: protect last active admin
    if (!isActive && user.role === 'admin' && user.isActive) {
      const isLastAdmin = await ensureNotLastActiveAdmin(id);
      if (isLastAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied. Cannot deactivate the last active administrator.',
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (with protection of last admin and clean record reassignment/cleanup)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Safeguard: cannot delete last active administrator
    if (user.role === 'admin') {
      const isLastAdmin = await ensureNotLastActiveAdmin(id);
      if (isLastAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied. Cannot delete the last active administrator.',
        });
      }
    }

    // Clean up relations: remove deleted user from assignedTo in records
    await Record.updateMany({ assignedTo: id }, { $pull: { assignedTo: id } });

    // For records created by this user, reassign to current admin performing the deletion
    await Record.updateMany({ createdBy: id }, { $set: { createdBy: req.user._id } });

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully and related records reassigned cleanly.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};
