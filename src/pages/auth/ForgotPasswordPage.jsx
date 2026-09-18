import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { authService } from '../../services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('vikram.mehta@laplots.com');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email or phone number');
      return;
    }
    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSent(true);
      success(`Password reset verification link sent to ${email}`, 'Email Sent');
    } catch (err) {
      error(err.message || 'Failed to dispatch reset email', 'Error');
    } finally {
      setLoading(false);
    }
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
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Account Recovery</p>
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1.5">Reset Your Password</h2>
        <p className="text-xs text-slate-500 mb-6">
          Enter your registered work email to receive a secure Firebase password recovery link.
        </p>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <p className="text-xs font-bold text-emerald-900">Recovery Instructions Dispatched</p>
            <p className="text-xs text-emerald-700">
              Check your inbox at <span className="font-semibold">{email}</span>. Click the link to complete reset.
            </p>
            <div className="pt-2">
              <Link
                to={ROUTES.LOGIN}
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Return to Sign In →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@laplots.com"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Recovery Instructions</span>
                </>
              )}
            </button>
          </form>
        )}

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

ForgotPasswordPage.propTypes = {};
