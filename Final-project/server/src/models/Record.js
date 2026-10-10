const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Record description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Operations', 'Security', 'Compliance', 'Engineering', 'Finance', 'General'],
      default: 'General',
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['Assigned users only', 'All active users'],
      default: 'Assigned users only',
      index: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
recordSchema.index({ title: 'text', description: 'text' });

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
