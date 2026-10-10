import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/formatters';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async ({ newPassword, confirmPassword }) => {
    if (!resetToken || !email) {
      toast.error('Session expired or invalid. Please request a new code.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Your password has been reset successfully!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reset password.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl border border-slate-800 bg-slate-900/80 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Password Reset Complete!</h2>
          <p className="mt-2 text-sm text-slate-400">
            Your password was successfully updated and all prior sessions were safely invalidated.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              Sign In with New Password
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 mb-4 border border-indigo-400/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Create a secure password with at least 8 characters
          </p>
        </div>

        <div className="p-8 rounded-2xl glass-panel shadow-2xl border border-slate-800 bg-slate-900/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must include uppercase, lowercase, and a number',
                    },
                  })}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm text-white bg-slate-950/80 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (val) => val === newPasswordValue || 'Passwords do not match',
                  })}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm text-white bg-slate-950/80 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Save New Password
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
