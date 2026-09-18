import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { seedTestPlot, testFirestoreConnection } from '../../services/connectionTest'

export function DatabaseSettingsPanel() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedRules, setCopiedRules] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedNotice, setSeedNotice] = useState(null)
  const [seedError, setSeedError] = useState(null)

  const runTest = async () => {
    setRunning(true)
    setSeedNotice(null)
    setSeedError(null)
    try {
      const res = await testFirestoreConnection()
      setResult(res)
    } catch (err) {
      setResult({
        overall: 'error',
        latencyMs: 0,
        checks: [
          {
            id: 'err',
            name: 'Diagnostic Failure',
            status: 'fail',
            title: 'Execution error',
            description: err?.message,
          },
        ],
        recommendations: ['Check console or network.'],
      })
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const handleCopyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function isAuthorizedAdmin() {
      return isSignedIn() && (
        request.auth.token.email in ['admin@gmail.com', 'admin@laplots.com', 'mohan@gmail.com'] ||
        request.auth.token.email.matches('.*admin.*') ||
        request.auth.token.email.matches('.*mohan.*') ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'agent'])
      );
    }
    match /plots/{plotId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /_connection_test/{id} {
      allow read, write: if true;
    }
    match /users/{uid} {
      allow read, write: if isSignedIn();
    }
    match /{document=**} {
      allow read, write: if isAuthorizedAdmin();
    }
  }
}`
    navigator.clipboard.writeText(rules)
    setCopiedRules(true)
    setTimeout(() => setCopiedRules(false), 2500)
  }

  const handleSeedPlot = async () => {
    setSeeding(true)
    setSeedNotice(null)
    setSeedError(null)
    try {
      const newPlot = await seedTestPlot()
      setSeedNotice(`Plot #${newPlot.plotNumber} created & verified in Cloud Firestore!`)
      setTimeout(() => runTest(), 1200)
    } catch (err) {
      setSeedError(err?.message || 'Failed to seed sample plot.')
    } finally {
      setSeeding(false)
    }
  }

  const isDatabaseMissing =
    result?.primaryIssue === 'DATABASE_NOT_FOUND' ||
    result?.checks?.some((c) => c.title?.includes('5 NOT_FOUND') || c.title?.includes('Does Not Exist'))

  const consoleUrl = `https://console.firebase.google.com/project/${result?.projectId || 'la-plots'}/firestore`

  return (
    <div className="space-y-6">
      {/* Top Card: Status & Actions */}
      <div className="card-modern p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex size-12 items-center justify-center rounded-2xl text-white shadow-md ${
                result?.overall === 'success'
                  ? 'bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-emerald-500/20'
                  : result?.overall === 'warning'
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-red-600 to-red-500 shadow-red-500/20'
              }`}
            >
              {running ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : result?.overall === 'success' ? (
                <Wifi size={24} />
              ) : (
                <WifiOff size={24} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-surface-900 font-display">
                  Cloud Firestore Status
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    result?.overall === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result?.overall === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {running
                    ? 'Testing...'
                    : result?.overall === 'success'
                    ? 'Connected & Persisting'
                    : isDatabaseMissing
                    ? 'Database Not Initialized'
                    : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-1">
                Project: <strong className="text-surface-800">{result?.projectId || 'la-plots'}</strong> • Latency:{' '}
                <span className="font-mono">{result?.latencyMs || 0}ms</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={running}
              onClick={runTest}
              className="btn-secondary inline-flex min-h-10 items-center gap-2 text-xs font-semibold px-4"
            >
              <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
              {running ? 'Running Test...' : 'Test Connection'}
            </button>
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex min-h-10 items-center gap-2 text-xs font-semibold px-4"
            >
              <ExternalLink size={14} />
              Firebase Console
            </a>
          </div>
        </div>
      </div>

      {/* Critical alert if database is missing in Firebase Console */}
      {isDatabaseMissing && (
        <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-card space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-lg">
              !
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-red-950">
                Firestore Database Not Created (Google gRPC Error: 5 NOT_FOUND)
              </h4>
              <p className="text-xs text-red-900 leading-relaxed">
                Google Cloud Firestore backend for project <strong>{result?.projectId}</strong> has not been created yet in the Firebase Console. Because of this, writes cannot be saved and fall back to volatile local memory.
              </p>
              <div className="rounded-xl border border-red-200 bg-white/90 p-4 text-xs space-y-2">
                <span className="font-bold text-surface-900 block">How to resolve in 60 seconds:</span>
                <ol className="list-decimal list-inside space-y-1 text-surface-700">
                  <li>
                    Click <strong>"Open Firebase Console &gt; Firestore"</strong> below.
                  </li>
                  <li>
                    Click the <strong>"Create database"</strong> button.
                  </li>
                  <li>
                    Select your nearest Cloud location (e.g. <em>asia-south1</em> or <em>us-central1</em>).
                  </li>
                  <li>
                    Select <strong>"Start in test mode"</strong> (or deploy your project rules) and click <strong>Enable</strong>.
                  </li>
                  <li>Return here and click "Test Connection" to confirm!</li>
                </ol>
              </div>
              <div className="pt-2">
                <a
                  href={consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                >
                  <ExternalLink size={15} />
                  Open Firebase Console &gt; Create Database
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Checklist */}
      <div className="card-modern p-6 space-y-4">
        <h4 className="text-sm font-bold text-surface-900 font-display">
          Connection Diagnostic Breakdown
        </h4>
        <div className="space-y-3">
          {result?.checks?.map((check) => {
            const isPass = check.status === 'pass'
            const isWarn = check.status === 'warn'
            return (
              <div
                key={check.id}
                className={`rounded-2xl border p-4 flex items-start gap-3 transition-all ${
                  isPass
                    ? 'border-emerald-100 bg-emerald-50/40'
                    : isWarn
                    ? 'border-amber-100 bg-amber-50/50'
                    : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isPass ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : isWarn ? (
                    <AlertTriangle size={18} className="text-amber-600" />
                  ) : (
                    <AlertTriangle size={18} className="text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-surface-900">{check.name}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isPass
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWarn
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {check.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-surface-600 leading-relaxed">{check.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Write Verification */}
      <div className="card-modern p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-surface-900 font-display flex items-center gap-2">
              <PlusCircle size={16} className="text-primary-600" />
              Live Plot Persistence Verification
            </h4>
            <p className="text-xs text-surface-500 mt-0.5">
              Writes an actual plot record into Cloud Firestore to guarantee cloud storage works.
            </p>
          </div>
          <button
            type="button"
            disabled={seeding || running}
            onClick={handleSeedPlot}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 transition"
          >
            {seeding ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            {seeding ? 'Saving Plot to Cloud...' : 'Create Sample Test Plot'}
          </button>
        </div>

        {seedNotice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            {seedNotice}
          </div>
        )}
        {seedError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
            {seedError}
          </div>
        )}
      </div>

      {/* Security Rules Reference */}
      <div className="card-modern p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-600" />
            <h4 className="text-sm font-bold text-surface-900 font-display">
              Recommended Firestore Security Rules
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyRules}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-50 px-3 text-xs font-semibold text-surface-700 hover:bg-surface-100 transition"
          >
            <Copy size={13} />
            {copiedRules ? 'Copied Rules!' : 'Copy Rules'}
          </button>
        </div>
        <p className="text-xs text-surface-500">
          If you see permission-denied errors, copy these rules and paste them into Firebase Console &gt; Firestore Database &gt; Rules:
        </p>
        <pre className="rounded-2xl bg-surface-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAuthorizedAdmin() {
      return isSignedIn() && (
        request.auth.token.email in ['admin@gmail.com', 'admin@laplots.com', 'mohan@gmail.com'] ||
        request.auth.token.email.matches('.*admin.*') ||
        request.auth.token.email.matches('.*mohan.*')
      );
    }
    match /plots/{plotId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /_connection_test/{id} { allow read, write: if true; }
    match /users/{uid} { allow read, write: if isSignedIn(); }
  }
}`}
        </pre>
      </div>
    </div>
  )
}
