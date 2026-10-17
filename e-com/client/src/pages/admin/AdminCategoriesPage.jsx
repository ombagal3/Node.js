import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import AdminHeader from '../../components/admin/AdminHeader';
import CategoryModal from '../../components/admin/CategoryModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/Badge';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function AdminCategoriesPage() {
  const { onToggleSidebar } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      showToast('Failed to load categories from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    setActionLoading(true);
    try {
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory._id, categoryData);
        if (res.success) {
          showToast(`Category "${res.data.name}" updated successfully.`);
          fetchCategories();
        }
      } else {
        const res = await categoryService.createCategory(categoryData);
        if (res.success) {
          showToast(`Category "${res.data.name}" created successfully.`);
          fetchCategories();
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (category) => {
    setDeletingCategory(category);
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setActionLoading(true);
    try {
      const res = await categoryService.deleteCategory(deletingCategory._id);
      if (res.success) {
        showToast(res.message);
        setIsDeleting(false);
        setDeletingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Safe delete category error:', err);
      showToast(err.response?.data?.message || 'Cannot delete category.', 'error');
      setIsDeleting(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Discipline & Category Management"
        subtitle="Manage product categories, relationships, and safe deletion boundaries"
        onToggleSidebar={onToggleSidebar}
        onRefresh={fetchCategories}
      />

      <div style={{ padding: '2rem' }}>
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Total Active Categories: <strong>{categories.length}</strong>
            </span>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {loading ? (
            <LoadingSpinner message="Querying category records..." />
          ) : categories.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <FolderTree size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>No Categories Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Create your first category discipline to organize products.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Category Discipline</th>
                    <th style={{ padding: '0.875rem 1rem' }}>URL Slug</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Scope / Description</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Products Count</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      className="admin-table-row"
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              backgroundColor: 'var(--bg-subtle)',
                              flexShrink: 0
                            }}
                          >
                            <ImageWithFallback
                              src={category.image}
                              alt={category.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            {category.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {category.slug}
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {category.description || '—'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          className={`badge ${category.productCount > 0 ? 'badge-accent' : 'badge-neutral'}`}
                        >
                          {category.productCount || 0} Products
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <StatusBadge status={category.status} />
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Link
                            to={`/products?category=${category.slug}`}
                            target="_blank"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="View Storefront Category"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => handleOpenEdit(category)}
                            title="Edit Category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--crimson)', borderColor: 'rgba(190, 18, 60, 0.2)' }}
                            onClick={() => handleOpenDelete(category)}
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Create / Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSaveCategory}
        category={editingCategory}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => {
          setIsDeleting(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category Discipline"
        message={
          deletingCategory?.productCount > 0
            ? `Notice: "${deletingCategory?.name}" has ${deletingCategory?.productCount} product(s) assigned. The server safety check will reject deletion until those products are reassigned.`
            : `Are you sure you want to delete the category "${deletingCategory?.name}"?`
        }
        confirmText="Attempt Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#F43F5E" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover {
          background-color: var(--bg-canvas);
        }
      `}</style>
    </div>
  );
}
