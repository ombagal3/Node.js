import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Package
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import AdminHeader from '../../components/admin/AdminHeader';
import ProductModal from '../../components/admin/ProductModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StockBadge, StatusBadge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function AdminProductsPage() {
  const { onToggleSidebar } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Categories for dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: selectedStatus, // 'all', 'active', 'inactive', 'draft'
        sort: 'newest'
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStock !== 'all') params.stockStatus = selectedStock;

      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      showToast('Failed to fetch products from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, selectedStock, selectedStatus, currentPage]);

  // Create or Update Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct._id, productData);
        if (res.success) {
          showToast(`Object "${res.data.name}" was successfully updated.`);
          fetchProducts();
        }
      } else {
        const res = await productService.createProduct(productData);
        if (res.success) {
          showToast(`New object "${res.data.name}" created and saved to MongoDB.`);
          fetchProducts();
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleOpenDelete = (product) => {
    setDeletingProduct(product);
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      const res = await productService.deleteProduct(deletingProduct._id);
      if (res.success) {
        showToast(res.message);
        setIsDeleting(false);
        setDeletingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Delete product failed:', err);
      showToast(err.response?.data?.message || 'Delete operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Product Inventory Management"
        subtitle="Complete catalog CRUD, stock monitoring, and database management"
        onToggleSidebar={onToggleSidebar}
        onRefresh={fetchProducts}
      />

      <div style={{ padding: '2rem' }}>
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.75rem',
              width: '100%',
              maxWidth: '320px'
            }}
          >
            <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                paddingLeft: '0.5rem',
                width: '100%'
              }}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action: Create New Product */}
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add New Object</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}
        >
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Stock:</span>
            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (Available)</option>
              <option value="low_stock">Low Stock (5 or fewer)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {(selectedCategory !== 'all' || selectedStock !== 'all' || selectedStatus !== 'all' || searchInput) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStock('all');
                setSelectedStatus('all');
                setSearchInput('');
                setCurrentPage(1);
              }}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--crimson)',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Table */}
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
            <LoadingSpinner message="Querying MongoDB product records..." />
          ) : products.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No products match the selected criteria or search term.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Product Object</th>
                    <th style={{ padding: '0.875rem 1rem' }}>SKU</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Inventory</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      className="admin-table-row"
                    >
                      {/* Product Thumbnail & Title */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              backgroundColor: 'var(--bg-subtle)',
                              flexShrink: 0
                            }}
                          >
                            <ImageWithFallback
                              src={product.images && product.images[0]}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {product.SKU}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-neutral">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        {formatCurrency(product.price)}
                      </td>

                      {/* Inventory / Stock */}
                      <td style={{ padding: '1rem' }}>
                        <StockBadge stock={product.stock} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem' }}>
                        <StatusBadge status={product.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            target="_blank"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="View on Storefront"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => handleOpenEdit(product)}
                            title="Edit Object"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--crimson)', borderColor: 'rgba(190, 18, 60, 0.2)' }}
                            onClick={() => handleOpenDelete(product)}
                            title="Delete Product"
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

          {/* Pagination */}
          <div style={{ padding: '0 1.25rem' }}>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => {
          setIsDeleting(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product Record"
        message={`Are you sure you want to permanently remove "${deletingProduct?.name}" (SKU: ${deletingProduct?.SKU}) from MongoDB? This action cannot be undone.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
      />

      {/* Floating Toast Notification */}
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
