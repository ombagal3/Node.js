const Product = require('../models/Product');
const Category = require('../models/Category');
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

/**
 * @desc    Get dashboard statistics derived from live MongoDB records
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
async function getDashboardStats(req, res, next) {
  try {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      recentProducts,
      categoryDistribution,
      inventorySummary
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      Product.countDocuments({ status: 'draft' }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      Category.countDocuments(),
      Product.find()
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        { $unwind: '$categoryDetails' },
        {
          $project: {
            _id: 1,
            name: '$categoryDetails.name',
            slug: '$categoryDetails.slug',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 2] }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalInventoryUnits: { $sum: '$stock' },
            totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ])
    ]);

    const inventoryStats = inventorySummary[0] || {
      totalInventoryUnits: 0,
      totalInventoryValue: 0
    };

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        draftProducts,
        outOfStockProducts,
        lowStockProducts,
        totalCategories,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        totalInventoryUnits: inventoryStats.totalInventoryUnits,
        totalInventoryValue: Math.round(inventoryStats.totalInventoryValue * 100) / 100,
        recentProducts: recentProducts.map((p) => ({
          ...p,
          isLowStock: p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD,
          isOutOfStock: p.stock === 0
        })),
        categoryDistribution
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
