import api from './api';

export const productService = {
  /**
   * Fetch products with query params: search, category, minPrice, maxPrice, stockStatus, status, sort, page, limit
   */
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Fetch single product by ID or slug
   */
  async getProductById(idOrSlug) {
    const response = await api.get(`/products/${idOrSlug}`);
    return response.data;
  },

  /**
   * Create new product (Admin)
   */
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Update product by ID (Admin)
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product by ID (Admin)
   */
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
