import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleBasedRoute = ({ allowedRole, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Checking access permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // If regular user attempts to access admin route, redirect to user dashboard
    if (user.role === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    }
    // If admin attempts to access user-only route, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RoleBasedRoute;
