import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDeleteDialog from '../../components/common/ConfirmDeleteDialog';
import { formatDate } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/formatters';
import { UserPlus, Eye, Edit2, Trash2, ShieldCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', order: 'desc' });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null, isDeleting: false });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        sortBy: sort.sortBy,
        order: sort.order,
      };

      const res = await userService.getAllUsers(params);
      if (res.success) {
        setUsers(res.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
        }));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch user directory'));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, filters, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (user) => {
    try {
      const nextStatus = !user.isActive;
      await userService.updateUserStatus(user._id, nextStatus);
      toast.success(`Account for ${user.name} is now ${nextStatus ? 'active' : 'inactive'}.`);
      fetchUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user status'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await userService.deleteUser(deleteModal.user._id);
      toast.success('User permanently deleted and associated records cleanly reassigned.');
      setDeleteModal({ isOpen: false, user: null, isDeleting: false });
      fetchUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete user'));
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const columns = [
    {
      header: 'Name',
      sortKey: 'name',
      render: (u) => (
        <div>
          <p className="font-semibold text-white">{u.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{u._id}</p>
        </div>
      ),
    },
    {
      header: 'Email',
      sortKey: 'email',
      accessor: 'email',
    },
    {
      header: 'Role',
      sortKey: 'role',
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
            u.role === 'admin'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      header: 'Status',
      sortKey: 'isActive',
      render: (u) => (
        <div className="flex items-center space-x-2">
          <StatusBadge active={u.isActive} />
          <button
            onClick={() => handleStatusToggle(u)}
            className="text-[10px] underline text-slate-400 hover:text-slate-200 transition-colors ml-1"
            title="Toggle active status"
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
    {
      header: 'Registered',
      sortKey: 'createdAt',
      render: (u) => formatDate(u.createdAt),
    },
    {
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/users/${u._id}`}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() =>
              setDeleteModal({
                isOpen: true,
                user: u,
                isDeleting: false,
              })
            }
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete user"
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage roles, account activations, and permissions with administrative safeguards.
          </p>
        </div>
        <Link
          to="/admin/users/create"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md shadow-indigo-600/25"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create New User
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
          placeholder="Search by user name or email..."
        />

        <FilterPanel
          filters={filters}
          options={{
            status: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
            role: [
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ],
          }}
          onFilterChange={(key, val) => {
            setFilters((prev) => ({ ...prev, [key]: val }));
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onReset={() => {
            setFilters({ status: '', role: '' });
            setSearch('');
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
        />
      </div>

      {/* Table & Pagination */}
      <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          sortBy={sort.sortBy}
          sortOrder={sort.order}
          onSort={(key) => {
            setSort((prev) => ({
              sortBy: key,
              order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
            }));
          }}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search keywords or filter settings."
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
        onClose={() => setDeleteModal({ isOpen: false, user: null, isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message="Are you sure you want to delete this user? Their records will be safely reassigned and this action is protected against removing the last active administrator."
        itemName={deleteModal.user ? `${deleteModal.user.name} (${deleteModal.user.email})` : ''}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default AdminUsersList;
