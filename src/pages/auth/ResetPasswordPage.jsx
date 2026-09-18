import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
  const [otp, setOtp] = useState('749201');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      success('Password updated successfully! You can now sign in.');
      navigate(ROUTES.LOGIN);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 9.5V22h7v-7h6v7h7V9.5L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">LA PLOTS</h1>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Secure Password Reset</p>
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1.5">Set New Password</h2>
        <p className="text-xs text-slate-500 mb-6">
          Enter the 6-digit OTP sent to your phone/email along with your new password.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <FormInput
            label="Verification OTP"
            icon={KeyRound}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            required
          />

          <FormInput
            label="New Password"
            type="password"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Update Password & Login</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

ResetPasswordPage.propTypes = {};
