import React from 'react';

export function StockBadge({ stock, threshold = 5 }) {
  if (stock <= 0) {
    return <span className="badge badge-outofstock">Out of Stock</span>;
  }
  if (stock <= threshold) {
    return <span className="badge badge-lowstock">Low Stock ({stock} left)</span>;
  }
  return <span className="badge badge-instock">In Stock</span>;
}

export function StatusBadge({ status }) {
  switch (status) {
    case 'active':
      return <span className="badge badge-instock">Active</span>;
    case 'inactive':
      return <span className="badge badge-neutral">Inactive</span>;
    case 'draft':
      return <span className="badge badge-lowstock">Draft</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
}
