import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import UserForm from '../../components/forms/UserForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft, UserCheck, FolderGit2, Calendar, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ assignedRecords: 0, createdRecords: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getUserById(id);
      if (res.success) {
        setUser(res.data.user);
        setStats(res.data.stats || { assignedRecords: 0, createdRecords: 0 });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to retrieve user details'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleUpdate = async (formData) => {
    setIsUpdating(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await userService.updateUser(id, payload);
      toast.success('User details updated successfully.');
      fetchUserDetails();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user profile'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading user profile data..." />;
  }

  if (error || !user) {
    return <ErrorState message={error || 'User not found'} onRetry={fetchUserDetails} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/users"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">User profile oversight and management</p>
        </div>
      </div>

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</p>
            <p className="text-sm font-bold text-white capitalize">{user.role}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Records</p>
            <p className="text-sm font-bold text-white">{stats.assignedRecords}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Registered On</p>
            <p className="text-sm font-bold text-white">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">Edit User Account Information</h2>
        <UserForm
          initialValues={user}
          onSubmit={handleUpdate}
          isEdit={true}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
};

export default AdminUserDetails;
