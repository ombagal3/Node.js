import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FolderTree,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StockBadge, StatusBadge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function AdminDashboardPage() {
  const { onToggleSidebar } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Unable to fetch live database analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Real-time operational inventory & database metrics"
        onToggleSidebar={onToggleSidebar}
        onRefresh={fetchStats}
      />

      <div style={{ padding: '2rem' }}>
        {loading ? (
          <LoadingSpinner message="Calculating database analytics..." />
        ) : error ? (
          <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <p style={{ color: 'var(--crimson)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchStats}>Retry</button>
          </div>
        ) : stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Stat Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Total Products */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Total Products
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="var(--text-main)" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>
                  {stats.totalProducts}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {stats.activeProducts} active in catalog
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Low Stock Alerts
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={18} color="var(--amber)" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--amber-text)', lineHeight: 1 }}>
                  {stats.lowStockProducts}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Inventory ≤ {stats.lowStockThreshold} units
                </div>
              </div>

              {/* Out of Stock */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Out of Stock
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--crimson-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="var(--crimson)" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--crimson-text)', lineHeight: 1 }}>
                  {stats.outOfStockProducts}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Restocking required
                </div>
              </div>

              {/* Total Categories */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Disciplines
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderTree size={18} color="var(--text-main)" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>
                  {stats.totalCategories}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Curated product categories
                </div>
              </div>

              {/* Total Valuation */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Inventory Value
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} color="var(--emerald-text)" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>
                  {formatCurrency(stats.totalInventoryValue)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Across {stats.totalInventoryUnits} physical units
                </div>
              </div>
            </div>

            {/* Middle Section: Recent Products & Category Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start'
              }}
            >
              {/* Recently Added Products */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    Recently Added Objects
                  </h3>
                  <Link to="/admin/products" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span>All Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ padding: '0 1.5rem' }}>
                  {stats.recentProducts && stats.recentProducts.map((p) => (
                    <div
                      key={p._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)', flexShrink: 0 }}>
                          <ImageWithFallback src={p.images && p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            SKU: {p.SKU} • {p.category?.name || 'General'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {formatCurrency(p.price)}
                        </span>
                        <StockBadge stock={p.stock} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown & Distribution */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    Category Distribution & Value
                  </h3>
                  <Link to="/admin/categories" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span>Categories</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ padding: '1rem 1.5rem' }}>
                  {stats.categoryDistribution && stats.categoryDistribution.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: '0.875rem 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Average Price: {formatCurrency(item.avgPrice)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="badge badge-neutral"
                          style={{ fontWeight: '700', fontSize: '0.8125rem' }}
                        >
                          {item.count} items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
