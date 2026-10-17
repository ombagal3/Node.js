const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('../scripts/seed');
const Product = require('../models/Product');
const Category = require('../models/Category');

describe('E-Commerce Full Backend Test Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let sampleCategoryId = '';
  let sampleProductId = '';

  before(async () => {
    await connectDB();
    await seedDatabase();

    // Login as Admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@verveatelier.com', password: 'Admin@123456' });
    assert.strictEqual(adminLoginRes.status, 200);
    adminToken = adminLoginRes.body.token;

    // Login as Customer
    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@verveatelier.com', password: 'Customer@123456' });
    assert.strictEqual(customerLoginRes.status, 200);
    customerToken = customerLoginRes.body.token;

    // Grab a category and a product
    const cat = await Category.findOne();
    sampleCategoryId = cat._id.toString();
    const prod = await Product.findOne();
    sampleProductId = prod._id.toString();
  });

  after(async () => {
    await disconnectDB();
  });

  // 1. Health Check
  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  // 2. Authentication & Authorization
  describe('Authentication & Authorization', () => {
    it('GET /api/auth/me should succeed for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.email, 'admin@verveatelier.com');
      assert.strictEqual(res.body.user.role, 'admin');
    });

    it('GET /api/auth/me should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.strictEqual(res.status, 401);
    });

    it('Non-admin user should be forbidden from creating products', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Chair',
          description: 'Test',
          price: 100,
          SKU: 'UNAUTH-001',
          category: sampleCategoryId,
          brand: 'Hacked',
          images: ['https://example.com/img.jpg'],
          stock: 10
        });
      assert.strictEqual(res.status, 403);
    });
  });

  // 3. Products API: Search, Filters, Sorting, Pagination
  describe('Product Search, Filters, Sorting, Pagination', () => {
    it('GET /api/products should return paginated products', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length <= 6);
      assert.ok(res.body.pagination.total > 0);
    });

    it('Search filter should find matching products by name or SKU', async () => {
      const res = await request(app).get('/api/products?search=turntable');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.data[0].name.toLowerCase().includes('turntable'));
    });

    it('Category filter should filter products by category slug', async () => {
      const res = await request(app).get('/api/products?category=furniture-living');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length > 0);
      res.body.data.forEach((p) => {
        assert.strictEqual(p.category.slug, 'furniture-living');
      });
    });

    it('Price range filter should filter products by minPrice and maxPrice', async () => {
      const res = await request(app).get('/api/products?minPrice=100&maxPrice=300');
      assert.strictEqual(res.status, 200);
      res.body.data.forEach((p) => {
        assert.ok(p.price >= 100 && p.price <= 300);
      });
    });

    it('Stock status filter should filter in_stock and low_stock', async () => {
      const res = await request(app).get('/api/products?stockStatus=low_stock');
      assert.strictEqual(res.status, 200);
      res.body.data.forEach((p) => {
        assert.ok(p.stock > 0 && p.stock <= 5);
      });
    });

    it('Sorting by price ascending should order products lowest to highest', async () => {
      const res = await request(app).get('/api/products?sort=price_asc&limit=10');
      assert.strictEqual(res.status, 200);
      const prices = res.body.data.map((p) => p.price);
      for (let i = 0; i < prices.length - 1; i++) {
        assert.ok(prices[i] <= prices[i + 1]);
      }
    });

    it('GET /api/products/:id should return single product and related products', async () => {
      const res = await request(app).get(`/api/products/${sampleProductId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, sampleProductId);
      assert.ok(Array.isArray(res.body.relatedProducts));
    });

    it('GET /api/products/:id with non-existent ID should return 404', async () => {
      const res = await request(app).get('/api/products/6530a0000000000000000000');
      assert.strictEqual(res.status, 404);
    });
  });

  // 4. Product CRUD
  describe('Product CRUD Operations (Admin)', () => {
    let createdProductId = '';
    const testSKU = 'TEST-PRD-999';

    it('POST /api/products should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Handcrafted Minimalist Stool',
          description: 'A versatile low stool crafted from natural Douglas fir.',
          price: 180,
          compareAtPrice: 210,
          SKU: testSKU,
          category: sampleCategoryId,
          brand: 'Verve Studio',
          images: ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80'],
          stock: 15,
          status: 'active'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.SKU, testSKU);
      createdProductId = res.body.data._id;
    });

    it('POST /api/products with duplicate SKU should be rejected', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate SKU Stool',
          description: 'Should fail',
          price: 150,
          SKU: testSKU,
          category: sampleCategoryId,
          brand: 'Verve Studio',
          images: ['https://example.com/img.jpg'],
          stock: 5
        });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes('already in use'));
    });

    it('PUT /api/products/:id should update product details', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 195,
          stock: 12
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.price, 195);
      assert.strictEqual(res.body.data.stock, 12);
    });

    it('DELETE /api/products/:id should delete product', async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Verify it's gone
      const verifyRes = await request(app).get(`/api/products/${createdProductId}`);
      assert.strictEqual(verifyRes.status, 404);
    });
  });

  // 5. Category Safety & CRUD
  describe('Category Management & Safe Deletion', () => {
    it('GET /api/categories should return all categories with product counts', async () => {
      const res = await request(app).get('/api/categories');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data[0].productCount !== undefined);
    });

    it('DELETE /api/categories/:id should PREVENT deleting category that has active products', async () => {
      const res = await request(app)
        .delete(`/api/categories/${sampleCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes('Cannot delete category'));
    });

    it('POST, PUT, and DELETE an unused category should succeed safely', async () => {
      // Create empty category
      const createRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Temporary Empty Category',
          description: 'To test safe deletion'
        });
      assert.strictEqual(createRes.status, 201);
      const catId = createRes.body.data._id;

      // Update
      const updateRes = await request(app)
        .put(`/api/categories/${catId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated empty category description' });
      assert.strictEqual(updateRes.status, 200);

      // Delete (safe because no products are assigned to it)
      const deleteRes = await request(app)
        .delete(`/api/categories/${catId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(deleteRes.status, 200);
    });
  });

  // 6. Dashboard Stats
  describe('Dashboard Analytics', () => {
    it('GET /api/dashboard/stats should return real database metrics for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.stats.totalProducts > 0);
      assert.ok(res.body.stats.totalCategories > 0);
      assert.ok(res.body.stats.lowStockProducts >= 0);
      assert.ok(res.body.stats.outOfStockProducts >= 0);
      assert.ok(Array.isArray(res.body.stats.recentProducts));
      assert.ok(Array.isArray(res.body.stats.categoryDistribution));
    });
  });
});
