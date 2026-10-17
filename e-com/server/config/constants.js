/**
 * Application Constants
 */
module.exports = {
  LOW_STOCK_THRESHOLD: parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10),
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft'
  },
  CATEGORY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  },
  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },
  SORT_MAPPINGS: {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    updated: { updatedAt: -1 }
  }
};
