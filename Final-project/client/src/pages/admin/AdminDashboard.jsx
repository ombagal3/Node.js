import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import DashboardStatCard from '../../components/common/DashboardStatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  UserCheck,
  UserX,
  FolderLock,
  Globe,
  FilePlus,
  UserPlus,
  ArrowRight,
  Shield,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getAdminStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load admin stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Compiling administrative analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  const { users, records, recentRecords = [], recentUsers = [] } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-indigo-900/40 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Administrative Control Center
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-white tracking-tight">
            System Infrastructure Overview
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time metric telemetry, role-based records auditing, and security oversight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/users/create"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add User
          </Link>
          <Link
            to="/admin/records/create"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30"
          >
            <FilePlus className="w-3.5 h-3.5 mr-1.5" />
            New Record
          </Link>
        </div>
      </div>

      {/* 5 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatCard
          title="Total Users"
          value={users?.total || 0}
          subtitle="All platform accounts"
          icon={Users}
          colorScheme="indigo"
        />
        <DashboardStatCard
          title="Active Users"
          value={users?.active || 0}
          subtitle="Permitted access"
          icon={UserCheck}
          colorScheme="emerald"
        />
        <DashboardStatCard
          title="Inactive Users"
          value={users?.inactive || 0}
          subtitle="Deactivated accounts"
          icon={UserX}
          colorScheme="rose"
        />
        <DashboardStatCard
          title="Total Records"
          value={records?.total || 0}
          subtitle="Drafts, published & archived"
          icon={FolderLock}
          colorScheme="cyan"
        />
        <DashboardStatCard
          title="Published"
          value={records?.published || 0}
          subtitle="Live across organisation"
          icon={Globe}
          colorScheme="amber"
        />
      </div>

      {/* Tables Row: Recent Records and Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Records */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recently Created Records</h2>
              <p className="text-xs text-slate-400">Latest records managed across the system</p>
            </div>
            <Link
              to="/admin/records"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="pb-2.5">Title</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">
                      No recent records found.
                    </td>
                  </tr>
                ) : (
                  recentRecords.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-medium text-white truncate max-w-[150px]">
                        {rec.title}
                      </td>
                      <td className="py-3 text-slate-400">{rec.category}</td>
                      <td className="py-3">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3">
                        <PriorityBadge priority={rec.priority} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recently Registered Users</h2>
              <p className="text-xs text-slate-400">New accounts added to the directory</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="pb-2.5">User</th>
                  <th className="pb-2.5">Role</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="py-3">
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-3">
                        <span className="capitalize font-mono text-[11px] text-indigo-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge active={u.isActive} />
                      </td>
                      <td className="py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
