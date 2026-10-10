import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

const CATEGORIES = ['Operations', 'Security', 'Compliance', 'Engineering', 'Finance', 'General'];
const STATUSES = ['Draft', 'Published', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const VISIBILITIES = ['Assigned users only', 'All active users'];

const RecordForm = ({
  initialValues = {},
  onSubmit,
  isEdit = false,
  isLoading = false,
  isAdmin = false,
  availableUsers = [], // list of users for assignedTo selection when admin
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialValues.title || '',
      description: initialValues.description || '',
      category: initialValues.category || 'General',
      status: initialValues.status || 'Draft',
      priority: initialValues.priority || 'Medium',
      visibility: initialValues.visibility || 'Assigned users only',
      assignedTo: initialValues.assignedTo
        ? initialValues.assignedTo.map((u) => (typeof u === 'object' ? u._id : u))
        : [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Record Title <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          {...register('title', {
            required: 'Record title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' },
            maxLength: { value: 150, message: 'Title cannot exceed 150 characters' },
          })}
          className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. AWS Cloud Architecture Security Audit"
        />
        {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Description <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 3, message: 'Description must be at least 3 characters' },
            maxLength: { value: 3000, message: 'Description cannot exceed 3000 characters' },
          })}
          className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
          placeholder="Detailed description and specifications of the record..."
        />
        {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>}
      </div>

      {/* Category, Status, Priority Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
          <select
            {...register('category')}
            className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
          <select
            {...register('status')}
            className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
          <select
            {...register('priority')}
            className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admin specific controls: Visibility & Assigned Users */}
      {isAdmin && (
        <div className="pt-2 border-t border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Visibility Scope
            </label>
            <select
              {...register('visibility')}
              className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {VISIBILITIES.map((vis) => (
                <option key={vis} value={vis}>
                  {vis}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              'All active users' makes published records readable to everyone in the organization.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assign to Specific Users
            </label>
            <select
              multiple
              {...register('assignedTo')}
              className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none h-28"
            >
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Hold Ctrl (Cmd on Mac) to select multiple assignees.
            </p>
          </div>
        </div>
      )}

      <div className="pt-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Record...
            </>
          ) : isEdit ? (
            'Update Record'
          ) : (
            'Create Record'
          )}
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
