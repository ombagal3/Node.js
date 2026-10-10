import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/formatters';
import { ShieldCheck, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: emailParam,
      otp: '',
    },
  });

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !emailParam) return;
    setIsResending(true);
    try {
      await authService.forgotPassword(emailParam);
      toast.success('A new verification code has been dispatched.');
      setResendCooldown(60);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resend code.'));
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async ({ email, otp }) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp);
      toast.success('Code confirmed! You can now reset your password.');
      const resetToken = response.data?.resetToken;
      navigate('/reset-password', {
        state: { email, resetToken },
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Verification failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 mb-4 border border-indigo-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify Security Code</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Enter the 6-digit code sent to your registered email
          </p>
          {emailParam && (
            <p className="mt-1 text-xs font-mono text-indigo-400 font-semibold">{emailParam}</p>
          )}
        </div>

        <div className="p-8 rounded-2xl glass-panel shadow-2xl border border-slate-800 bg-slate-900/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!emailParam && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email address is required' })}
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-950/80 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none"
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                {...register('otp', {
                  required: '6-digit code is required',
                  minLength: { value: 6, message: 'Code must be exactly 6 digits' },
                  maxLength: { value: 6, message: 'Code must be exactly 6 digits' },
                  pattern: { value: /^[0-9]{6}$/, message: 'Only numbers allowed' },
                })}
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 text-white bg-slate-950/80 border border-slate-750 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="123456"
              />
              {errors.otp && (
                <p className="mt-1 text-xs text-rose-400 text-center">{errors.otp.message}</p>
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
                    Validating Code...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resend Cooldown Section */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center font-semibold text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
              )}
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-slate-500 hover:text-slate-400"
            >
              Change email address
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
