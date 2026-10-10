import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import DashboardStatCard from '../../components/common/DashboardStatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, getApiErrorMessage } from '../../utils/formatters';
import {
  Globe,
  UserCheck,
  FolderGit2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getUserStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard overview'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading your personalized dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  const { stats, recentAvailableRecords = [], recentMyRecords = [] } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Personal Workspace
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Access assigned corporate documentation, organizational releases, and personal records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/user/available-records"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Available Records
          </Link>
          <Link
            to="/user/my-records/create"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Create Record
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <DashboardStatCard
          title="Available Records"
          value={stats?.availableRecords || 0}
          subtitle="Accessible published records"
          icon={Globe}
          colorScheme="indigo"
        />
        <DashboardStatCard
          title="Assigned to You"
          value={stats?.assignedRecords || 0}
          subtitle="Direct task/audit assignments"
          icon={UserCheck}
          colorScheme="emerald"
        />
        <DashboardStatCard
          title="My Created Records"
          value={stats?.createdRecords || 0}
          subtitle="Personal records managed"
          icon={FolderGit2}
          colorScheme="amber"
        />
      </div>

      {/* Tables: Available Corporate Records vs My Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Records */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Available Corporate Records</h2>
              <p className="text-xs text-slate-400">Published items available to you</p>
            </div>
            <Link
              to="/user/available-records"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center"
            >
              Browse all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="pb-2.5">Title</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAvailableRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">
                      No corporate records currently published.
                    </td>
                  </tr>
                ) : (
                  recentAvailableRecords.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-800/30">
                      <td className="py-3">
                        <p className="font-medium text-white truncate max-w-[170px]">{rec.title}</p>
                        <p className="text-[10px] text-slate-400">By {rec.createdBy?.name || 'Admin'}</p>
                      </td>
                      <td className="py-3 text-slate-400">{rec.category}</td>
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

        {/* My Personal Records */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">My Personal Records</h2>
              <p className="text-xs text-slate-400">Recently edited entries you created</p>
            </div>
            <Link
              to="/user/my-records"
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
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentMyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">
                      You haven't created any personal records yet.
                    </td>
                  </tr>
                ) : (
                  recentMyRecords.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-medium text-white truncate max-w-[170px]">
                        {rec.title}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3 text-slate-400">{formatDate(rec.updatedAt)}</td>
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

export default UserDashboard;
