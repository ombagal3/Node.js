const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const {
  LOW_STOCK_THRESHOLD,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SORT_MAPPINGS
} = require('../config/constants');

/**
 * @desc    Get all products with server-side search, filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public (Storefront & Admin)
 */
async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      stockStatus,
      status,
      sort = 'newest',
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      featured
    } = req.query;

    const query = {};

    // 1. Status Filter
    // If status is specifically provided (e.g. admin requesting 'all', 'draft', 'inactive')
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Default to active products for public customer view
      query.status = 'active';
    }

    // 2. Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // 3. Search query: case-insensitive match across name, SKU, brand, description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { SKU: searchRegex },
        { brand: searchRegex },
        { description: searchRegex }
      ];
    }

    // 4. Category Filter (by ObjectId or Slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          // If category slug not found, return empty results
          return res.status(200).json({
            success: true,
            data: [],
            pagination: {
              total: 0,
              totalPages: 0,
              currentPage: Number(page),
              limit: Number(limit),
              hasNextPage: false,
              hasPrevPage: false
            }
          });
        }
      }
    }

    // 5. Price Range Filter
    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== '') {
      const parsedMin = parseFloat(minPrice);
      if (!isNaN(parsedMin) && parsedMin >= 0) {
        priceFilter.$gte = parsedMin;
      }
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const parsedMax = parseFloat(maxPrice);
      if (!isNaN(parsedMax) && parsedMax >= 0) {
        priceFilter.$lte = parsedMax;
      }
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }

    // 6. Stock Status Filter
    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in_stock') {
        query.stock = { $gt: 0 };
      } else if (stockStatus === 'low_stock') {
        query.stock = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
      } else if (stockStatus === 'out_of_stock') {
        query.stock = 0;
      }
    }

    // 7. Sorting
    const sortCriteria = SORT_MAPPINGS[sort] || SORT_MAPPINGS.newest;

    // 8. Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .populate('category', 'name slug image')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    // Format virtual properties for lean documents
    const formattedProducts = products.map((prod) => ({
      ...prod,
      isLowStock: prod.stock > 0 && prod.stock <= LOW_STOCK_THRESHOLD,
      isOutOfStock: prod.stock === 0
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single product by ID or slug with related products
 * @route   GET /api/products/:id
 * @access  Public
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug description');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug description');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Fetch related products from the same category
    let relatedProducts = [];
    if (product.category && product.category._id) {
      relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        status: 'active'
      })
        .populate('category', 'name slug')
        .limit(4)
        .lean();
    }

    const productObj = product.toObject({ virtuals: true });

    res.status(200).json({
      success: true,
      data: productObj,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
async function createProduct(req, res, next) {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      SKU,
      category,
      brand,
      images,
      stock,
      status,
      isFeatured
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'The selected category does not exist.'
      });
    }

    // Verify SKU uniqueness
    const existingSKU = await Product.findOne({ SKU: SKU.toUpperCase().trim() });
    if (existingSKU) {
      return res.status(400).json({
        success: false,
        message: `Product SKU '${SKU}' is already in use.`
      });
    }

    // Base slug
    let slug = slugify(name);
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${SKU.toLowerCase()}`;
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice: compareAtPrice || null,
      SKU: SKU.toUpperCase().trim(),
      category,
      brand,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
      stock: parseInt(stock, 10) || 0,
      status: status || 'active',
      isFeatured: !!isFeatured
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      compareAtPrice,
      SKU,
      category,
      brand,
      images,
      stock,
      status,
      isFeatured
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // If category is changing, verify new category exists
    if (category && category.toString() !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'The selected category does not exist.'
        });
      }
      product.category = category;
    }

    // If SKU is changing, verify uniqueness
    if (SKU && SKU.toUpperCase().trim() !== product.SKU) {
      const existingSKU = await Product.findOne({
        SKU: SKU.toUpperCase().trim(),
        _id: { $ne: id }
      });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: `Product SKU '${SKU}' is already in use.`
        });
      }
      product.SKU = SKU.toUpperCase().trim();
    }

    // If name is changing, regenerate slug
    if (name && name !== product.name) {
      let newSlug = slugify(name);
      const duplicateSlug = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicateSlug) {
        newSlug = `${newSlug}-${(SKU || product.SKU).toLowerCase()}`;
      }
      product.name = name;
      product.slug = newSlug;
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice === '' || compareAtPrice === null ? null : Number(compareAtPrice);
    if (brand !== undefined) product.brand = brand;
    if (images !== undefined && Array.isArray(images) && images.length > 0) product.images = images;
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (status !== undefined) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = !!isFeatured;

    await product.save();

    const updated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' (SKU: ${product.SKU}) was successfully deleted.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
