import React, { useState, useEffect, useCallback } from 'react';
import { recordService } from '../../services/recordService';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import { formatDate, getApiErrorMessage } from '../../utils/formatters';
import { Eye, Globe, Lock, Shield, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAvailableRecords = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', priority: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', order: 'desc' });

  // Detail Modal state
  const [activeRecord, setActiveRecord] = useState(null);

  const fetchAvailableRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search.trim() || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        sortBy: sort.sortBy,
        order: sort.order,
      };

      const res = await recordService.getAvailableRecords(params);
      if (res.success) {
        setRecords(res.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
        }));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch available records'));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, filters, sort]);

  useEffect(() => {
    fetchAvailableRecords();
  }, [fetchAvailableRecords]);

  const columns = [
    {
      header: 'Title & Summary',
      sortKey: 'title',
      render: (r) => (
        <div className="max-w-xs sm:max-w-md">
          <p className="font-semibold text-white">{r.title}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{r.description}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      sortKey: 'category',
      render: (r) => <span className="font-medium text-slate-300">{r.category}</span>,
    },
    {
      header: 'Priority',
      sortKey: 'priority',
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      header: 'Visibility Scope',
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
            r.visibility === 'All active users'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
          }`}
        >
          {r.visibility === 'All active users' ? (
            <Globe className="w-3 h-3 mr-1" />
          ) : (
            <Lock className="w-3 h-3 mr-1" />
          )}
          {r.visibility}
        </span>
      ),
    },
    {
      header: 'Published By',
      render: (r) => (
        <span className="text-xs text-slate-300">{r.createdBy?.name || 'Administrator'}</span>
      ),
    },
    {
      header: 'Date',
      sortKey: 'createdAt',
      render: (r) => formatDate(r.createdAt),
    },
    {
      header: 'View',
      render: (r) => (
        <button
          onClick={() => setActiveRecord(r)}
          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="View full record details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Available Corporate Records</h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized documentation released by system administrators and teams.
        </p>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          placeholder="Search corporate records..."
        />

        <FilterPanel
          filters={filters}
          options={{
            category: ['Operations', 'Security', 'Compliance', 'Engineering', 'Finance', 'General'],
            priority: ['Low', 'Medium', 'High'],
          }}
          onFilterChange={(key, val) => {
            setFilters((prev) => ({ ...prev, [key]: val }));
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onReset={() => {
            setFilters({ category: '', priority: '' });
            setSearch('');
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
        />
      </div>

      {/* Table & Pagination */}
      <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
        <DataTable
          columns={columns}
          data={records}
          isLoading={isLoading}
          sortBy={sort.sortBy}
          sortOrder={sort.order}
          onSort={(key) => {
            setSort((prev) => ({
              sortBy: key,
              order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
            }));
          }}
          emptyTitle="No available records"
          emptyDescription="There are currently no published records matching your access level."
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        />
      </div>

      {/* Read-Only Details Modal */}
      <Modal
        isOpen={!!activeRecord}
        onClose={() => setActiveRecord(null)}
        title={activeRecord?.title || 'Record Details'}
        maxWidth="max-w-2xl"
      >
        {activeRecord && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-800">
              <span className="font-semibold text-slate-400">Category:</span>
              <span className="text-white font-medium">{activeRecord.category}</span>
              <span className="text-slate-600">|</span>
              <span className="font-semibold text-slate-400">Priority:</span>
              <PriorityBadge priority={activeRecord.priority} />
              <span className="text-slate-600">|</span>
              <span className="font-semibold text-slate-400">Scope:</span>
              <span className="text-emerald-400">{activeRecord.visibility}</span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description & Specifications
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                {activeRecord.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] text-slate-400">
              <div>
                <p className="font-semibold text-slate-500">Created By</p>
                <p className="text-slate-200 mt-0.5">{activeRecord.createdBy?.name || 'Administrator'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Published Date</p>
                <p className="text-slate-200 mt-0.5">{formatDate(activeRecord.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserAvailableRecords;
