import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  RotateCcw,
  PackageX,
  AlertCircle
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/storefront/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL query or defaults
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [stockStatus, setStockStatus] = useState(searchParams.get('stockStatus') || 'all');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Catalog Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Load Categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Sync state if URL changes externally (e.g. clicking navbar category link)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlSearch = searchParams.get('search') || '';
    setSelectedCategory(urlCategory);
    setSearchInput(urlSearch);
  }, [searchParams]);

  // Main data fetcher
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: 12,
          sort: sortOption
        };

        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (minPrice !== '') params.minPrice = minPrice;
        if (maxPrice !== '') params.maxPrice = maxPrice;
        if (stockStatus && stockStatus !== 'all') params.stockStatus = stockStatus;

        // Keep URL searchParams synchronized
        const newParams = {};
        if (debouncedSearch.trim()) newParams.search = debouncedSearch.trim();
        if (selectedCategory !== 'all') newParams.category = selectedCategory;
        if (minPrice !== '') newParams.minPrice = minPrice;
        if (maxPrice !== '') newParams.maxPrice = maxPrice;
        if (stockStatus !== 'all') newParams.stockStatus = stockStatus;
        if (sortOption !== 'newest') newParams.sort = sortOption;
        if (currentPage > 1) newParams.page = currentPage.toString();
        setSearchParams(newParams, { replace: true });

        const res = await productService.getProducts(params);
        if (res.success) {
          setProducts(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products from server. Please verify backend service.');
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, stockStatus, sortOption, currentPage]);

  // Reset page to 1 whenever search or filter criteria change
  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    setCurrentPage(1);
  };

  const handleStockChange = (status) => {
    setStockStatus(status);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setStockStatus('all');
    setSortOption('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchInput.trim() !== '' ||
    selectedCategory !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    stockStatus !== 'all' ||
    sortOption !== 'newest';

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Header Title & Breadcrumb */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
            Curated Catalog
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>
            {selectedCategory === 'all'
              ? 'All Architectural Objects'
              : categories.find((c) => c.slug === selectedCategory)?.name || 'Category Collection'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.5rem', maxWidth: '640px' }}>
            Explore artisanal furniture, hand-cast bronze lighting, and tabletop ceramics calibrated for thoughtful interiors.
          </p>
        </div>

        {/* Filter & Search Bar Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-canvas)',
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
              placeholder="Filter by name, brand, SKU..."
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
              <button
                onClick={() => {
                  setSearchInput('');
                  setCurrentPage(1);
                }}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls: Stock Filter, Sort, Mobile Filter Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Stock Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              {[
                { id: 'all', label: 'All Stock' },
                { id: 'in_stock', label: 'In Stock' },
                { id: 'low_stock', label: 'Low Stock' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handleStockChange(pill.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: stockStatus === pill.id ? '600' : '500',
                    backgroundColor: stockStatus === pill.id ? '#FFFFFF' : 'transparent',
                    color: stockStatus === pill.id ? 'var(--text-main)' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: stockStatus === pill.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Sort:</span>
              <select
                value={sortOption}
                onChange={handleSortChange}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills & Price Filter Row */}
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
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => handleCategoryChange('all')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: selectedCategory === 'all' ? '600' : '500',
                backgroundColor: selectedCategory === 'all' ? 'var(--text-main)' : '#FFFFFF',
                color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCategory === cat.slug ? '600' : '500',
                  backgroundColor: selectedCategory === cat.slug ? 'var(--text-main)' : '#FFFFFF',
                  color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-main)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Price Range Filter Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Price ($):</span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '70px',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>–</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '70px',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Filters:
            </span>

            {debouncedSearch && (
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Search: "{debouncedSearch}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchInput('')} />
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('all')} />
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Price: ${minPrice || '0'} – ${maxPrice || '∞'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
              </span>
            )}

            {stockStatus !== 'all' && (
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Stock: {stockStatus.replace('_', ' ')}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setStockStatus('all')} />
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--crimson)',
                cursor: 'pointer',
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>
        )}

        {/* Product Grid / States */}
        {loading ? (
          <LoadingSpinner message="Searching atelier catalog..." />
        ) : error ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <AlertCircle size={36} color="var(--crimson)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Failed to Load Catalog</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              padding: '4rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              maxWidth: '540px',
              margin: '2rem auto'
            }}
          >
            <PackageX size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Matching Objects Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              We could not find any products matching your specific combination of search and filter criteria. Try expanding your price range or clearing search keywords.
            </p>
            <button className="btn btn-primary" onClick={handleClearAllFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2.5rem'
              }}
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
