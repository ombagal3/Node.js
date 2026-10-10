import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { formatDate, getApiErrorMessage } from '../../utils/formatters';
import { UserCheck, Shield, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateCurrentUser } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
      };

      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const res = await userService.updateProfile(payload);
      if (res.success && res.data?.user) {
        updateCurrentUser(res.data.user);
        toast.success('Your profile was updated successfully.');
        reset({
          name: res.data.user.name,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details and authentication credentials
        </p>
      </div>

      {/* Account Info Pill */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {user?.role}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">General Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Must be at least 2 characters' },
                  maxLength: { value: 80, message: 'Cannot exceed 80 characters' },
                })}
                className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Change Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Leave password fields empty if you do not wish to change your password.
            </p>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword', {
                      validate: (val) => {
                        if (newPasswordValue && !val) {
                          return 'Current password is required to set a new password';
                        }
                        return true;
                      },
                    })}
                    className="w-full px-3.5 py-2 pr-10 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword', {
                      minLength: {
                        value: 8,
                        message: 'New password must be at least 8 characters long',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Must include uppercase, lowercase, and a number',
                      },
                    })}
                    className="w-full px-3.5 py-2 pr-10 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Min 8 characters (mixed case + number)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    validate: (val) => {
                      if (newPasswordValue && val !== newPasswordValue) {
                        return 'Passwords do not match';
                      }
                      return true;
                    },
                  })}
                  className="w-full px-3.5 py-2 text-sm text-white bg-slate-900 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Repeat new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
