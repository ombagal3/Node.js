import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const UserForm = ({
  initialValues = {},
  onSubmit,
  isEdit = false,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialValues.name || '',
      email: initialValues.email || '',
      role: initialValues.role || 'user',
      isActive: initialValues.isActive !== undefined ? initialValues.isActive : true,
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          {...register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 80, message: 'Name cannot exceed 80 characters' },
          })}
          className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Sarah Connor"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Email Address <span className="text-rose-400">*</span>
        </label>
        <input
          type="email"
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Please enter a valid email address',
            },
          })}
          className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. sarah@example.com"
        />
        {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
      </div>

      {/* Role & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role</label>
          <select
            {...register('role')}
            className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Status</label>
          <select
            {...register('isActive', {
              setValueAs: (v) => v === 'true' || v === true,
            })}
            className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            <option value="true">Active</option>
            <option value="false">Inactive / Deactivated</option>
          </select>
        </div>
      </div>

      {/* Password (Required for create, optional for edit) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {isEdit ? 'New Password (Leave blank to keep unchanged)' : 'Password'} {!isEdit && <span className="text-rose-400">*</span>}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: !isEdit ? 'Password is required' : false,
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Must include uppercase, lowercase, and a number',
              },
            })}
            className="w-full px-3.5 py-2 pr-10 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={isEdit ? '••••••••' : 'Min 8 characters (mixed case + number)'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving User...
            </>
          ) : isEdit ? (
            'Update User'
          ) : (
            'Create User'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
