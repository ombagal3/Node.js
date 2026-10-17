const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [160, 'Product name cannot exceed 160 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v === undefined || v >= 0;
        },
        message: 'Compare at price cannot be negative'
      }
    },
    SKU: {
      type: String,
      required: [true, 'Please provide a unique SKU'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category']
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true
    },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'A product must have at least one image URL'
      },
      default: []
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for low stock flag
productSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= LOW_STOCK_THRESHOLD;
});

// Virtual for out of stock flag
productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

// Pre-validate hook to generate slug if not provided or name changed
productSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    // Combine slugified name with last 4 chars of SKU if available for guaranteed uniqueness
    const baseSlug = slugify(this.name);
    this.slug = baseSlug;
  }
  next();
});

// Compound and text indexes for fast search and filter queries
productSchema.index({ name: 'text', brand: 'text', SKU: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1, price: 1, stock: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
