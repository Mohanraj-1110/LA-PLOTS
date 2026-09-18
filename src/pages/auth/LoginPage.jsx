import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from '../../utils/validators';
import { ROUTES } from '../../routes/routePaths';
import { FormInput } from '../../components/forms/FormInput';
import { isAdminEmail } from '../../services/auth';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, User, UserPlus, Database } from 'lucide-react';

export function LoginPage() {
  const { login, signup, googleSignIn } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [submitting, setSubmitting] = useState(false);

  // Signup local states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSignInSubmit = async (data) => {
    setSubmitting(true);
    try {
      const result = await login(data.emailOrPhone, data.password, data.rememberMe);
      success('Welcome back to LA PLOTS!', 'Logged In Successfully');
      const userProfile = result?.profile;
      const isAdm = userProfile?.role === 'admin' || isAdminEmail(data.emailOrPhone);
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else if (isAdm) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toastError(err.message || 'Invalid email or password', 'Login Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      toastError('Please fill in all required fields');
      return;
    }
    if (signupPassword.length < 6) {
      toastError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await signup(signupEmail.trim(), signupPassword, signupName.trim(), 'customer');
      success(`Welcome ${signupName}! Your account has been registered.`, 'Account Created');
      const isAdm = isAdminEmail(signupEmail);
      if (isAdm) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toastError(err.message || 'Registration failed', 'Firebase Auth Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80">
        {/* Left Side: Real Estate Visual Showcase (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-12 text-white flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 9.5V22h7v-7h6v7h7V9.5L12 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  LA PLOTS
                </h1>
                <p className="text-xs text-emerald-300 font-semibold tracking-wider uppercase mt-1">
                  Real Estate Platform
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Firebase Auth & Firestore Enabled
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Manage • Grow • Close More Deals.
              </h2>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                Streamline plot inventory, customer leads, site appointments, and real-time profit tracking synced automatically across devices with Google Firebase.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-emerald-700/50 space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Connected to Cloud Firestore collection data stores</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-black text-white leading-none">198+</p>
                <p className="text-[11px] text-emerald-300 mt-1">Plots Managed</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">₹45Cr+</p>
                <p className="text-[11px] text-emerald-300 mt-1">Sales Volume</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">99.4%</p>
                <p className="text-[11px] text-emerald-300 mt-1">Clear Titles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9.5V22h7v-7h6v7h7V9.5L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                LA PLOTS
              </h1>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Real Estate Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'signin' ? (
            /* Sign In Form */
            <div>
              <div className="mb-5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                  Sign In to Workspace
                </h3>
                <p className="text-xs text-slate-500">
                  Authenticate securely via Firebase Authentication
                </p>
              </div>

              <form onSubmit={handleSubmit(onSignInSubmit)} className="space-y-4">
                <FormInput
                  label="Email or Mobile Number"
                  icon={Mail}
                  placeholder="e.g. vikram.mehta@laplots.com"
                  error={errors.emailOrPhone?.message}
                  {...register('emailOrPhone')}
                />

                <FormInput
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                      {...register('rememberMe')}
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In with Firebase</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-2 text-[11px] font-bold text-slate-400 uppercase">
                    or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await googleSignIn();
                      success('Signed in with Google!');
                      navigate(from, { replace: true });
                    } catch (err) {
                      toastError(err?.message || 'Google sign-in failed');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            </div>
          ) : (
            /* Sign Up / Create Account Form */
            <div>
              <div className="mb-5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                  Create Firebase Account
                </h3>
                <p className="text-xs text-slate-500">
                  Register your real estate agent or admin profile in Cloud Firestore
                </p>
              </div>

              <form onSubmit={onSignUpSubmit} className="space-y-3.5">
                <FormInput
                  label="Full Name"
                  icon={User}
                  placeholder="e.g. Ananya Rao"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />

                <FormInput
                  label="Work Email"
                  icon={Mail}
                  type="email"
                  placeholder="e.g. ananya@laplots.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />

                <FormInput
                  label="Password (min 6 characters)"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

LoginPage.propTypes = {};
