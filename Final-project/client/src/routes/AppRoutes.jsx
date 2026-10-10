import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ResetPassword from '../pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersList from '../pages/admin/AdminUsersList';
import AdminUserCreate from '../pages/admin/AdminUserCreate';
import AdminUserDetails from '../pages/admin/AdminUserDetails';
import AdminRecordsList from '../pages/admin/AdminRecordsList';
import AdminRecordCreate from '../pages/admin/AdminRecordCreate';
import AdminRecordEdit from '../pages/admin/AdminRecordEdit';

// User Pages
import UserDashboard from '../pages/user/UserDashboard';
import UserAvailableRecords from '../pages/user/UserAvailableRecords';
import UserMyRecords from '../pages/user/UserMyRecords';
import UserRecordCreate from '../pages/user/UserRecordCreate';
import UserRecordEdit from '../pages/user/UserRecordEdit';
import UserProfile from '../pages/user/UserProfile';

const RootRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRole="admin">
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersList />} />
        <Route path="users/create" element={<AdminUserCreate />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="records" element={<AdminRecordsList />} />
        <Route path="records/create" element={<AdminRecordCreate />} />
        <Route path="records/:id/edit" element={<AdminRecordEdit />} />
      </Route>

      {/* User Protected Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRole="user">
              <UserLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="available-records" element={<UserAvailableRecords />} />
        <Route path="my-records" element={<UserMyRecords />} />
        <Route path="my-records/create" element={<UserRecordCreate />} />
        <Route path="my-records/:id/edit" element={<UserRecordEdit />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
