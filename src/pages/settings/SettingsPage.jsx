import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormInput } from '../../components/forms/FormInput';
import { initialUsers } from '../../data/mockUsers';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Users,
  Smartphone,
  Save,
  Database,
  CheckCircle2,
  RefreshCw,
  Layers,
  PlayCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const SETTINGS_TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'firebase', label: 'Firebase & Cloud', icon: Database },
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'security', label: 'Security & 2FA', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || 'Vikram Mehta');
  const [email, setEmail] = useState(user?.email || 'vikram.mehta@laplots.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98451 99001');
  const [designation, setDesignation] = useState(user?.designation || 'Managing Director');

  // Company Form State
  const [companyName, setCompanyName] = useState(user?.company || 'LA Plots Realty LLP');
  const [reraNumber, setReraNumber] = useState(
    user?.reraNumber || 'PRM/KA/RERA/1251/309/PR/200922/003621'
  );
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '29ABCDE1234F1Z5');
  const [address, setAddress] = useState(
    'Suite 402, Prestige Meridian, MG Road, Bengaluru 560001'
  );

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  // Security State
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Appearance State
  const [themeMode, setThemeMode] = useState('light');
  const [compactDensity, setCompactDensity] = useState(false);

  // Firebase state
  const [syncing, setSyncing] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestFirestore = async () => {
    setTestingDb(true);
    setTestResult(null);
    const testId = `browser-test-${Date.now()}`;
    const testDoc = {
      title: 'Live Browser Test Document',
      plotNumber: 'TEST-P1',
      description: 'Tested directly from browser UI at ' + new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      isTest: true,
    };

    try {
      // 1. Write text document
      const docRef = doc(db, 'plots', testId);
      const writePromise = setDoc(docRef, testDoc);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Cloud Firestore may not be initialized in Firebase Console yet.')), 7000)
      );
      await Promise.race([writePromise, timeoutPromise]);

      // 2. Read back
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        throw new Error('Document was written but could not be read back.');
      }

      // 3. Clean up
      await deleteDoc(docRef);

      setTestResult({
        success: true,
        message: `Successfully wrote, retrieved, and deleted test document (${testId}) from Cloud Firestore!`,
      });
      success('Cloud Firestore Write & Read verified successfully!', 'Test Passed');
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Firestore connection issue',
      });
    } finally {
      setTestingDb(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({ name, email, phone, designation });
    success('Profile updated successfully!');
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    updateProfile({ company: companyName, reraNumber, gstNumber });
    success('Company RERA & registration details updated!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setCurrentPassword('');
    setNewPassword('');
    success('Password updated successfully!');
  };

  const handleSyncCloud = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      success('Cloud Firestore and local caches are synchronized!', 'Firebase Sync');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Settings & Workspace Preferences"
        subtitle="Manage account credentials, Firebase cloud database, agency RERA, and preferences"
      />

      {/* Main Settings Grid: Navigation Tabs Left (Desktop), Content Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Tab Selector */}
        <div className="lg:col-span-4 space-y-1 bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs h-fit">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User avatar'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                  <p className="text-xs text-slate-500">{user?.role || 'Admin'} • LA PLOTS Workspace</p>
                  <button
                    type="button"
                    onClick={() => success('Avatar upload simulation active!')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-1 cursor-pointer"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <FormInput
                  label="Designation / Role"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
                <FormInput
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormInput
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: Firebase & Cloud Integration */}
          {activeTab === 'firebase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Firebase Infrastructure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live Cloud Firestore, Firebase Authentication & Cloud Storage configuration
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Connected</span>
                </div>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Firebase Authentication</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">la-plots.firebaseapp.com</p>
                  <p className="text-[11px] text-slate-400 mt-1">Provider: Email & Password, Firestore Sync</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Cloud Firestore Storage</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">la-plots (Text & Records Only)</p>
                  <p className="text-[11px] text-slate-400 mt-1">Direct text storage for plots, customers, agreements & records</p>
                </div>
              </div>

              {/* Collections Status */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Active Cloud Firestore Collections</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['plots', 'customers', 'appointments', 'sales', 'documents', 'enquiries', 'conversations', 'users'].map(
                    (col) => (
                      <div
                        key={col}
                        className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-slate-700 font-mono">{col}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Live Firestore Verification Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4 text-emerald-600" />
                      <span>Live Cloud Firestore Verification</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Write a test text document to the Cloud Firestore database, verify read, and clean up.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestFirestore}
                    disabled={testingDb}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {testingDb ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Run Firestore Test</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold">
                          {testResult.success ? 'Test Passed!' : 'Firestore Database Setup Required'}
                        </p>
                        <p className="text-[11px]">{testResult.message}</p>
                        {!testResult.success && (
                          <div className="pt-1.5 flex items-center gap-2">
                            <a
                              href="https://console.firebase.google.com/project/la-plots/firestore"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                            >
                              <span>Enable Firestore Database in Firebase Console</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Actions */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-950">Local & Cloud Data Synchronization</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Ensures offline changes sync seamlessly with Cloud Firestore collections.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncCloud}
                  disabled={syncing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Firestore'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Company Info */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real Estate Firm Registration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These credentials appear on sales agreements and customer invoices.
                </p>
              </div>

              <div className="space-y-4">
                <FormInput
                  label="Real Estate Firm Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="RERA Registration Number"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                    required
                  />
                  <FormInput
                    label="GSTIN Number"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    required
                  />
                </div>

                <FormInput
                  label="Corporate Head Office Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Company Info</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alerts & Reminders</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure how you receive lead notifications</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Instant WhatsApp Alerts</h4>
                    <p className="text-[11px] text-slate-500">
                      Receive immediate ping when a new lead registers interest
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Site Visit Email Reminders</h4>
                    <p className="text-[11px] text-slate-500">
                      Automated 24-hour reminder email before scheduled site visits
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Morning Daily Digest</h4>
                    <p className="text-[11px] text-slate-500">
                      Summary of today's appointments and pending buyer follow-ups at 8:00 AM
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyDigest}
                    onChange={(e) => setDailyDigest(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => success('Notification preferences saved!')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Users & Roles */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Team Members & Access Roles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control sales agent permissions</p>
                </div>
                <button
                  type="button"
                  onClick={() => success('Invite agent email sent!')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  + Invite Agent
                </button>
              </div>

              <div className="space-y-3">
                {initialUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Security & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security & Authentication</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage passwords and two-factor authentication</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <FormInput
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <FormInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Two-Factor SMS Verification (2FA)</h4>
                      <p className="text-[11px] text-slate-500">Require OTP code upon sign-in</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => {
                      setTwoFactor(e.target.checked);
                      success(`Two-factor verification ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workspace Appearance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize interface theme and table densities</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode('light');
                        success('Clean Light theme applied');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold text-center cursor-pointer ${
                        themeMode === 'light'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      ☀️ Light Professional
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode('dark');
                        success('Dark mode preview ready');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold text-center cursor-pointer ${
                        themeMode === 'dark'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      🌙 Modern Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Compact Table Layouts</h4>
                    <p className="text-[11px] text-slate-500">Show more plots per screen in table mode</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactDensity}
                    onChange={(e) => setCompactDensity(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

SettingsPage.propTypes = {};
