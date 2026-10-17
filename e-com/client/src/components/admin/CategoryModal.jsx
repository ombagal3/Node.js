import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { AlertCircle } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  isLoading = false
}) {
  const isEdit = !!category;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        status: category.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        status: 'active'
      });
    }
    setErrors({});
    setServerError('');
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        status: formData.status
      });
      onClose();
    } catch (err) {
      console.error('Submit category error:', err);
      setServerError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Category: ${category?.name}` : 'Create New Discipline Category'}
      maxWidth="540px"
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

        <div className="form-group">
          <label className="form-label">
            Category Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Architectural Lighting"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Describe the category scope..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Featured Image URL</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                flexShrink: 0
              }}
            >
              <ImageWithFallback src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

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
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
