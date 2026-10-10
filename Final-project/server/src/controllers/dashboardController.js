const User = require('../models/User');
const Record = require('../models/Record');

/**
 * Admin Dashboard Statistics
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRecords,
      publishedRecords,
      draftRecords,
      archivedRecords,
      recentRecords,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Record.countDocuments(),
      Record.countDocuments({ status: 'Published' }),
      Record.countDocuments({ status: 'Draft' }),
      Record.countDocuments({ status: 'Archived' }),
      Record.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        records: {
          total: totalRecords,
          published: publishedRecords,
          draft: draftRecords,
          archived: archivedRecords,
        },
        recentRecords,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Dashboard Statistics
 */
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Available records: published AND (visibility: 'All active users' OR assignedTo contains userId)
    const availableFilter = {
      status: 'Published',
      $or: [
        { visibility: 'All active users' },
        { assignedTo: userId },
      ],
    };

    const [
      availableCount,
      assignedCount,
      createdCount,
      recentAvailableRecords,
      recentMyRecords,
    ] = await Promise.all([
      Record.countDocuments(availableFilter),
      Record.countDocuments({ assignedTo: userId, status: 'Published' }),
      Record.countDocuments({ createdBy: userId }),
      Record.find(availableFilter)
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5),
      Record.find({ createdBy: userId })
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          availableRecords: availableCount,
          assignedRecords: assignedCount,
          createdRecords: createdCount,
        },
        recentAvailableRecords,
        recentMyRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUserStats,
};
