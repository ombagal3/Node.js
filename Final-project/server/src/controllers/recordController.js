const mongoose = require('mongoose');
const Record = require('../models/Record');

/* ========================================================
   ADMIN RECORD CONTROLLERS
======================================================== */

/**
 * Admin: Get all records with server-side search, filters, sorting, and pagination
 */
const adminGetAllRecords = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      status,
      priority,
      visibility,
      assignedUser,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (visibility) query.visibility = visibility;
    if (assignedUser && mongoose.Types.ObjectId.isValid(assignedUser)) {
      query.assignedTo = assignedUser;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const allowedSortFields = ['title', 'category', 'status', 'priority', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [records, totalItems] = await Promise.all([
      Record.find(query)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Record.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      success: true,
      data: records,
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
 * Admin: Create record
 */
const adminCreateRecord = async (req, res, next) => {
  try {
    const { title, description, category, status, priority, visibility, assignedTo } = req.body;

    const record = await Record.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      status: status || 'Draft',
      priority: priority || 'Medium',
      visibility: visibility || 'Assigned users only',
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      createdBy: req.user._id,
    });

    const populated = await Record.findById(record._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Record created successfully.',
      data: {
        record: populated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single record by ID
 */
const adminGetRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update record
 */
const adminUpdateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    const { title, description, category, status, priority, visibility, assignedTo } = req.body;

    if (title) record.title = title.trim();
    if (description) record.description = description.trim();
    if (category) record.category = category;
    if (status) record.status = status;
    if (priority) record.priority = priority;
    if (visibility) record.visibility = visibility;
    if (Array.isArray(assignedTo)) record.assignedTo = assignedTo;

    await record.save();

    const populated = await Record.findById(record._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Record updated successfully.',
      data: {
        record: populated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete record
 */
const adminDeleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ========================================================
   USER RECORD CONTROLLERS
======================================================== */

/**
 * User: Get available records (published admin/global records assigned or open to all active users)
 */
const userGetAvailableRecords = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, category, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Strict visibility rules:
    // Only 'Published' records AND
    // (visibility === 'All active users' OR assignedTo includes user._id)
    const query = {
      status: 'Published',
      $or: [
        { visibility: 'All active users' },
        { assignedTo: req.user._id },
      ],
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [{ title: searchRegex }, { description: searchRegex }],
        },
      ];
    }

    if (category) query.category = category;
    if (priority) query.priority = priority;

    const allowedSortFields = ['title', 'category', 'priority', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [records, totalItems] = await Promise.all([
      Record.find(query)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Record.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      success: true,
      data: records,
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
 * User: Get own records (createdBy === req.user._id)
 */
const userGetMyRecords = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, category, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { createdBy: req.user._id };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const allowedSortFields = ['title', 'category', 'status', 'priority', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [records, totalItems] = await Promise.all([
      Record.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Record.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      success: true,
      data: records,
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
 * User: Create own record
 */
const userCreateMyRecord = async (req, res, next) => {
  try {
    const { title, description, category, status, priority } = req.body;

    const record = await Record.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      status: status || 'Draft',
      priority: priority || 'Medium',
      visibility: 'Assigned users only', // Regular users create private records
      assignedTo: [req.user._id],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Record created successfully.',
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Get own record by ID (Strict ownership check)
 */
const userGetMyRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    // Strict ownership verification
    if (!record.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own records.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Update own record by ID (Strict ownership check)
 */
const userUpdateMyRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    // Strict ownership verification
    if (!record.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own records.',
      });
    }

    const { title, description, category, status, priority } = req.body;

    if (title) record.title = title.trim();
    if (description) record.description = description.trim();
    if (category) record.category = category;
    if (status) record.status = status;
    if (priority) record.priority = priority;

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Record updated successfully.',
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Delete own record by ID (Strict ownership check)
 */
const userDeleteMyRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format.',
      });
    }

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    // Strict ownership verification
    if (!record.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own records.',
      });
    }

    await Record.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminGetAllRecords,
  adminCreateRecord,
  adminGetRecordById,
  adminUpdateRecord,
  adminDeleteRecord,
  userGetAvailableRecords,
  userGetMyRecords,
  userCreateMyRecord,
  userGetMyRecordById,
  userUpdateMyRecord,
  userDeleteMyRecord,
};
