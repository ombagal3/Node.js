const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('../utils/slugify');

/**
 * @desc    Get all categories with active product count
 * @route   GET /api/categories
 * @access  Public
 */
async function getCategories(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    // Attach product counts to each category
    const categoryIds = categories.map((cat) => cat._id);
    const productCounts = await Product.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    let category;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    const productCount = await Product.countDocuments({ category: category._id });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
async function createCategory(req, res, next) {
  try {
    const { name, description, image, status } = req.body;

    const slug = slugify(name);
    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists.'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    if (name && name !== category.name) {
      const newSlug = slugify(name);
      const duplicate = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists.'
        });
      }
      category.name = name;
      category.slug = newSlug;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = status;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete category safely (prevents deleting categories in use)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    // Safety check: prevent deleting if products belong to this category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}'. There are ${productCount} product(s) assigned to it. Please reassign or delete these products first.`
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Category '${category.name}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
