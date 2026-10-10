import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ConfirmDeleteDialog from '../../components/common/ConfirmDeleteDialog';
import { formatDate, getApiErrorMessage } from '../../utils/formatters';
import { FilePlus, Edit2, Trash2, Globe, Lock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRecordsList = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', visibility: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', order: 'desc' });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null, isDeleting: false });

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search.trim() || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        visibility: filters.visibility || undefined,
        sortBy: sort.sortBy,
        order: sort.order,
      };

      const res = await recordService.adminGetAllRecords(params);
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
      toast.error(getApiErrorMessage(err, 'Failed to fetch records'));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, filters, sort]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleTogglePublish = async (record) => {
    try {
      const newStatus = record.status === 'Published' ? 'Draft' : 'Published';
      await recordService.adminUpdateRecord(record._id, { status: newStatus });
      toast.success(`Record is now ${newStatus.toLowerCase()}.`);
      fetchRecords();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update record status'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.record) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await recordService.adminDeleteRecord(deleteModal.record._id);
      toast.success('Record deleted permanently.');
      setDeleteModal({ isOpen: false, record: null, isDeleting: false });
      fetchRecords();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete record'));
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const columns = [
    {
      header: 'Title & Summary',
      sortKey: 'title',
      render: (r) => (
        <div className="max-w-xs sm:max-w-sm">
          <p className="font-semibold text-white truncate">{r.title}</p>
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
      header: 'Status',
      sortKey: 'status',
      render: (r) => (
        <div className="flex items-center space-x-1.5">
          <StatusBadge status={r.status} />
          <button
            onClick={() => handleTogglePublish(r)}
            className="text-[10px] underline text-slate-400 hover:text-indigo-400 transition-colors ml-1"
          >
            {r.status === 'Published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      ),
    },
    {
      header: 'Priority',
      sortKey: 'priority',
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      header: 'Visibility',
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
      header: 'Assigned To',
      render: (r) => (
        <span className="text-xs text-slate-400">
          {r.assignedTo && r.assignedTo.length > 0
            ? `${r.assignedTo.length} user${r.assignedTo.length > 1 ? 's' : ''}`
            : 'None'}
        </span>
      ),
    },
    {
      header: 'Created By',
      render: (r) => (
        <span className="text-xs text-slate-300">{r.createdBy?.name || 'System Admin'}</span>
      ),
    },
    {
      header: 'Created At',
      sortKey: 'createdAt',
      render: (r) => formatDate(r.createdAt),
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/records/${r._id}/edit`}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit record"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() =>
              setDeleteModal({
                isOpen: true,
                record: r,
                isDeleting: false,
              })
            }
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository records management with visibility and assignment control.
          </p>
        </div>
        <Link
          to="/admin/records/create"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md shadow-indigo-600/25"
        >
          <FilePlus className="w-4 h-4 mr-2" />
          Create New Record
        </Link>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          placeholder="Search by record title or description..."
        />

        <FilterPanel
          filters={filters}
          options={{
            category: ['Operations', 'Security', 'Compliance', 'Engineering', 'Finance', 'General'],
            status: ['Draft', 'Published', 'Archived'],
            priority: ['Low', 'Medium', 'High'],
            visibility: ['Assigned users only', 'All active users'],
          }}
          onFilterChange={(key, val) => {
            setFilters((prev) => ({ ...prev, [key]: val }));
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onReset={() => {
            setFilters({ category: '', status: '', priority: '', visibility: '' });
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
          emptyTitle="No records found"
          emptyDescription="Try adjusting search terms or filters."
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        />
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, record: null, isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be reversed."
        itemName={deleteModal.record?.title}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default AdminRecordsList;
