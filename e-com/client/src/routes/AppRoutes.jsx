import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import StorefrontLayout from '../layouts/StorefrontLayout';
import AdminLayout from '../layouts/AdminLayout';

// Storefront Pages
import HomePage from '../pages/storefront/HomePage';
import ProductsPage from '../pages/storefront/ProductsPage';
import ProductDetailPage from '../pages/storefront/ProductDetailPage';
import CartPage from '../pages/storefront/CartPage';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';

// Common
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Login Route (Unprotected) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
      </Route>
    </Routes>
  );
}
