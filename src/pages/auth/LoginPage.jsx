import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from '../../utils/validators';
import { ROUTES } from '../../routes/routePaths';
import { isAdminEmail } from '../../services/auth';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export function LoginPage() {
  const { login, signup, googleSignIn, user, role, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Signup form state (no account type selector)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const from = location.state?.from?.pathname;

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

  useEffect(() => {
    if (isAuthenticated && user && !submitting) {
      const userRole = (role || user.role || '').toLowerCase();
      const userEmail = user.email || '';
      const isAdm = userRole === 'admin' || isAdminEmail(userEmail);
      const isAgnt = userRole === 'agent';

      if (from && from !== '/' && from !== '/login' && from !== '/signup') {
        navigate(from, { replace: true });
      } else if (isAdm) {
        navigate('/admin', { replace: true });
      } else if (isAgnt) {
        navigate('/agent', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [isAuthenticated, user, role, from, navigate, submitting]);

  const onSignInSubmit = async (data) => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    setSubmitting(true);

    const cleanInput = (data.emailOrPhone || '').trim();

    try {
      const result = await login(cleanInput, data.password, data.rememberMe);
      setAuthSuccessMsg('Signed in successfully! Redirecting to workspace...');
      success('Welcome back to LK PROPERTIES!', 'Logged In Successfully');

      const userProfile = result?.profile;
      const userRole = (userProfile?.role || result?.user?.role || '').toLowerCase();
      const isAdm = userRole === 'admin' || isAdminEmail(cleanInput);
      const isAgnt = userRole === 'agent';

      setTimeout(() => {
        if (from && from !== '/' && from !== '/login' && from !== '/signup') {
          navigate(from, { replace: true });
        } else if (isAdm) {
          navigate('/admin', { replace: true });
        } else if (isAgnt) {
          navigate('/agent', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      }, 300);
    } catch (err) {
      const errorText = err?.message || 'Invalid email or password. Please verify and try again.';
      setAuthError(errorText);
      toastError(errorText, 'Sign In Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim();

    if (!cleanName || !cleanEmail || !signupPassword) {
      setAuthError('Please fill in all required fields to create your account.');
      return;
    }
    if (signupPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup(cleanName, cleanEmail, signupPassword);
      setAuthSuccessMsg('Account created successfully! Preparing your dashboard...');
      success(`Welcome to LK PROPERTIES, ${cleanName}!`, 'Account Created');

      const userRole = (result?.profile?.role || 'user').toLowerCase();
      const isAdm = isAdminEmail(cleanEmail) || userRole === 'admin';
      const isAgnt = userRole === 'agent';

      setTimeout(() => {
        if (isAdm) {
          navigate('/admin', { replace: true });
        } else if (isAgnt) {
          navigate('/agent', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      }, 300);
    } catch (err) {
      const errorText = err?.message || 'Registration failed. Please check your details and try again.';
      setAuthError(errorText);
      toastError(errorText, 'Registration Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    setSubmitting(true);
    try {
      const result = await googleSignIn();
      setAuthSuccessMsg('Google authentication verified! Redirecting...');
      success('Signed in with Google!', 'Welcome');

      const userEmail = result?.user?.email || result?.profile?.email || '';
      const userRole = (result?.profile?.role || '').toLowerCase();
      const isAdm = userRole === 'admin' || isAdminEmail(userEmail);
      const isAgnt = userRole === 'agent';

      setTimeout(() => {
        if (from && from !== '/' && from !== '/login' && from !== '/signup') {
          navigate(from, { replace: true });
        } else if (isAdm) {
          navigate('/admin', { replace: true });
        } else if (isAgnt) {
          navigate('/agent', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      }, 300);
    } catch (err) {
      const errorText = err?.message || 'Google sign-in could not be completed. Please try again.';
      setAuthError(errorText);
      toastError(errorText, 'Google Sign-In Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Google Button
  const GoogleButton = ({ label = 'Sign In with Google' }) => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={submitting}
      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Multi-color ambient lighting effects */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/20 relative z-10">

        {/* Left Side: Brand Showcase with Multi-color Gradient */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-indigo-950 via-violet-900 to-emerald-950 p-10 text-white flex-col justify-between overflow-hidden border-r border-indigo-800/40">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:22px_22px]" />

          {/* Decorative color orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />

          {/* Top Brand Monogram */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 text-slate-900 flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform duration-300">
                <span className="font-black text-xl tracking-tight">LK</span>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  LK PROPERTIES
                </h1>
                <p className="text-[11px] text-emerald-300 font-bold tracking-wider uppercase mt-1">
                  Verified Land & Plots
                </p>
              </div>
            </Link>

            {/* Value Propositions */}
            <div className="mt-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> DTCP & RERA Approved Layouts
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight leading-snug text-white">
                Invest with Confidence in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                  Verified Plotted
                </span>{' '}
                Communities.
              </h2>

              <p className="text-indigo-200/80 text-xs leading-relaxed">
                Connect seamlessly as an investor, field agent, or system administrator. Live inventory, site visit schedules, and instant title records at your fingertips.
              </p>

              {/* Feature Points with multi-color icons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-indigo-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Legal Clearance & Verified Title Deeds</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-indigo-100">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>High-Growth Locations with Zero Brokerage Markup</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-indigo-100">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>Real-time Interactive Plot Grid & Booking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Stat Bar */}
          <div className="relative z-10 pt-8 border-t border-indigo-800/60">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xl font-black text-white leading-none">250+</p>
                <p className="text-[10px] text-emerald-300 font-semibold mt-1 uppercase">Plots Available</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xl font-black text-white leading-none">100%</p>
                <p className="text-[10px] text-emerald-300 font-semibold mt-1 uppercase">Clear Titles</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xl font-black text-white leading-none">15k+</p>
                <p className="text-[10px] text-emerald-300 font-semibold mt-1 uppercase">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">

          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-emerald-400 text-white flex items-center justify-center shadow-md font-black text-sm">
              LK
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                LK PROPERTIES
              </h1>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                Verified Land & Plots Platform
              </p>
            </div>
          </div>

          {/* Top Pill Tab Switcher */}
          <div className="flex p-1.5 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError(null);
                setAuthSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError(null);
                setAuthSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 animate-slide-up shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-900">Authentication Error</p>
                  <p className="mt-0.5 text-rose-700 leading-relaxed">{authError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="p-1 text-rose-400 hover:text-rose-700 rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Banner */}
          {authSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 animate-slide-up shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs font-bold">{authSuccessMsg}</p>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {mode === 'signin' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sign in with your registered email to enter your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSignInSubmit)} className="space-y-4">
                {/* Email or Phone Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="e.g. admin@laplots.com or user@gmail.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                        errors.emailOrPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                      {...register('emailOrPhone')}
                    />
                  </div>
                  {errors.emailOrPhone && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">
                      {errors.emailOrPhone.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                        errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      {...register('rememberMe')}
                    />
                    <span>Remember this session</span>
                  </label>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Authenticating LK PROPERTIES...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to LK PROPERTIES</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    or continue with
                  </span>
                </div>

                {/* Google Sign In — KEPT */}
                <GoogleButton label="Continue with Google" />
              </form>
            </div>
          ) : (
            /* CREATE ACCOUNT VIEW — no account type selector */
            <div>
              <div className="mb-5">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Create an Account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Join LK PROPERTIES to explore verified plots and track your investments.
                </p>
              </div>

              <form onSubmit={onSignUpSubmit} className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Ananya Rao"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. ananya@lkproperties.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create LK PROPERTIES Account</span>
                    </>
                  )}
                </button>

                {/* Divider — also in Sign Up */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    or continue with
                  </span>
                </div>

                {/* Google Sign Up — KEPT for consistency */}
                <GoogleButton label="Continue with Google" />
              </form>
            </div>
          )}

          {/* Footer Terms */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Protected by Firebase Authentication & MongoDB Atlas Cloud.
              <br />
              By proceeding, you agree to LK PROPERTIES Terms & Privacy Guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

LoginPage.propTypes = {};

export default LoginPage;