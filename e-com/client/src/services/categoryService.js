import api from './api';

export const categoryService = {
  /**
   * Fetch all categories
   */
  async getCategories(params = {}) {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  /**
   * Fetch category by ID or slug
   */
  async getCategoryById(idOrSlug) {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response.data;
  },

  /**
   * Create category (Admin)
   */
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Update category (Admin)
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Delete category (Admin)
   */
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};
