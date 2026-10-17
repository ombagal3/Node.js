import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  categories = [],
  isLoading = false
}) {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    SKU: '',
    category: '',
    brand: '',
    images: [''],
    stock: '0',
    status: 'active',
    isFeatured: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Pre-fill form when editing or resetting on create
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        compareAtPrice: product.compareAtPrice !== null && product.compareAtPrice !== undefined ? product.compareAtPrice.toString() : '',
        SKU: product.SKU || '',
        category: typeof product.category === 'object' ? product.category?._id : product.category || '',
        brand: product.brand || '',
        images: product.images && product.images.length > 0 ? product.images : [''],
        stock: product.stock?.toString() || '0',
        status: product.status || 'active',
        isFeatured: !!product.isFeatured
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        SKU: '',
        category: categories.length > 0 ? categories[0]._id : '',
        brand: '',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        stock: '10',
        status: 'active',
        isFeatured: false
      });
    }
    setErrors({});
    setServerError('');
  }, [product, categories, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleAddImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.SKU.trim()) newErrors.SKU = 'SKU is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand name is required';
    if (!formData.category) newErrors.category = 'Category selection is required';

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price must be a valid positive number or 0';
    }

    if (formData.compareAtPrice !== '') {
      const compareNum = parseFloat(formData.compareAtPrice);
      if (isNaN(compareNum) || compareNum < 0) {
        newErrors.compareAtPrice = 'Original price must be positive';
      }
    }

    const stockNum = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Stock must be an integer of 0 or greater';
    }

    const validImages = formData.images.filter((img) => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.images = 'At least one valid image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const cleanPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice !== '' ? parseFloat(formData.compareAtPrice) : null,
        SKU: formData.SKU.trim().toUpperCase(),
        category: formData.category,
        brand: formData.brand.trim(),
        images: formData.images.filter((img) => img.trim() !== ''),
        stock: parseInt(formData.stock, 10),
        status: formData.status,
        isFeatured: formData.isFeatured
      };

      await onSubmit(cleanPayload);
      onClose();
    } catch (err) {
      console.error('Submit product error:', err);
      setServerError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Object: ${product?.name}` : 'Catalog New Architectural Object'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        {serverError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--crimson-subtle)',
              border: '1px solid rgba(190, 18, 60, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--crimson-text)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Name and SKU */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Koto Curved Lounge Chair"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              SKU (Stock Keeping Unit) <span className="required">*</span>
            </label>
            <input
              type="text"
              name="SKU"
              value={formData.SKU}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., FUR-KTO-001"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.SKU && <span className="form-error">{errors.SKU}</span>}
          </div>
        </div>

        {/* Category and Brand */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Brand / Maker Studio <span className="required">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Verve Studio"
            />
            {errors.brand && <span className="form-error">{errors.brand}</span>}
          </div>
        </div>

        {/* Price, CompareAtPrice, Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Price ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              placeholder="890.00"
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Compare At Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="compareAtPrice"
              value={formData.compareAtPrice}
              onChange={handleChange}
              className="form-input"
              placeholder="Optional original price"
            />
            {errors.compareAtPrice && <span className="form-error">{errors.compareAtPrice}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Stock Units <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-input"
              placeholder="0"
            />
            {errors.stock && <span className="form-error">{errors.stock}</span>}
          </div>
        </div>

        {/* Status and Featured Flag */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group">
            <label className="form-label">Catalog Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="active">Active (Visible in Storefront)</option>
              <option value="inactive">Inactive (Hidden from Customers)</option>
              <option value="draft">Draft (Work in Progress)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isFeatured" style={{ fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
              Feature in Storefront Carousel
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Description & Material Details <span className="required">*</span>
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Describe material provenance, tactile qualities, and dimensions..."
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        {/* Image URLs Strategy */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Image URLs <span className="required">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddImage}
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Plus size={14} />
              Add Another Image
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {formData.images.map((url, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-subtle)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <ImageWithFallback src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  style={{ flex: 1 }}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ color: 'var(--crimson)', cursor: 'pointer', padding: '4px' }}
                    aria-label="Remove image URL"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.images && <span className="form-error">{errors.images}</span>}
        </div>

        {/* Modal Submit Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving Record...' : isEdit ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
