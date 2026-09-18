import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { seedTestPlot, testFirestoreConnection } from '../../services/connectionTest'

export function ConnectionTestModal({ isOpen, onClose, onPlotSeeded }) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedRules, setCopiedRules] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)
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
            id: 'crash',
            name: 'Diagnostic Execution',
            status: 'fail',
            title: 'Diagnostic failed to run',
            description: err?.message || 'Unknown error occurred.',
          },
        ],
        rawError: { message: err?.message },
        recommendations: ['Check internet connectivity or console logs.'],
      })
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      runTest()
    }
  }, [isOpen])

  if (!isOpen) return null

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

  const handleCopyReport = () => {
    if (!result) return
    const reportText = `=== LA PLOTS FIRESTORE DIAGNOSTIC REPORT ===
Timestamp: ${result.timestamp || new Date().toISOString()}
Overall Status: ${result.overall?.toUpperCase()}
Latency: ${result.latencyMs}ms
Project ID: ${result.projectId}
Auth Domain: ${result.authDomain}
Active User: ${result.user ? `${result.user.email} (${result.user.uid})` : 'Not Signed In'}

CHECKS:
${result.checks?.map((c) => `[${c.status?.toUpperCase()}] ${c.name} - ${c.title}: ${c.description}`).join('\n')}

RAW ERROR:
${JSON.stringify(result.rawError || 'None', null, 2)}

RECOMMENDATIONS:
${result.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`
    navigator.clipboard.writeText(reportText)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2500)
  }

  const handleSeedPlot = async () => {
    setSeeding(true)
    setSeedNotice(null)
    setSeedError(null)
    try {
      const newPlot = await seedTestPlot()
      setSeedNotice(`Plot #${newPlot.plotNumber} created & verified in Cloud Firestore!`)
      if (onPlotSeeded) onPlotSeeded()
      // Re-run test to show updated state
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

  const isPermissionDenied =
    result?.primaryIssue === 'RULES_PERMISSION_DENIED' ||
    result?.checks?.some((c) => c.status === 'fail' && c.title?.includes('Permission'))

  const consoleUrl = `https://console.firebase.google.com/project/${result?.projectId || 'la-plots'}/firestore`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-title"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-elevated border border-surface-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20">
              <Database size={20} />
            </div>
            <div>
              <h2 id="diagnostic-title" className="text-lg font-bold text-surface-900 font-display">
                Firebase Firestore Connection Diagnostic
              </h2>
              <p className="text-xs text-surface-500">
                Live Cloud Firestore connectivity, read/write, and server persistence tester
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-surface-400 hover:bg-surface-200/60 hover:text-surface-700 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
          {/* Top Status Banner */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 border transition-all ${
              running
                ? 'border-blue-200 bg-blue-50/70 text-blue-900'
                : result?.overall === 'success'
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
                : result?.overall === 'warning'
                ? 'border-amber-200 bg-amber-50/80 text-amber-950'
                : 'border-red-200 bg-red-50/80 text-red-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {running ? (
                <RefreshCw size={24} className="animate-spin text-blue-600 shrink-0" />
              ) : result?.overall === 'success' ? (
                <CheckCircle2 size={26} className="text-emerald-600 shrink-0" />
              ) : result?.overall === 'warning' ? (
                <AlertTriangle size={26} className="text-amber-600 shrink-0" />
              ) : (
                <WifiOff size={26} className="text-red-600 shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    {running
                      ? 'Testing Firestore Connection...'
                      : result?.overall === 'success'
                      ? 'Cloud Firestore Online & Storing Data'
                      : isDatabaseMissing
                      ? 'Database Not Created in Firebase Console'
                      : isPermissionDenied
                      ? 'Write Permission Denied by Rules'
                      : 'Firestore Unreachable / Not Storing'}
                  </span>
                  {!running && result?.latencyMs > 0 && (
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-mono font-medium">
                      {result.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 opacity-80">
                  {running
                    ? 'Probing cloud server sync, read & write operations...'
                    : result?.overall === 'success'
                    ? 'All operations verified. Firestore is actively persisting writes to Google Cloud.'
                    : isDatabaseMissing
                    ? 'Google Cloud Firestore gRPC returned 5 NOT_FOUND: Database has not been initialized.'
                    : 'See detailed check results below for troubleshooting.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                disabled={running}
                onClick={runTest}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-300 bg-white px-3 text-xs font-semibold text-surface-700 shadow-sm hover:bg-surface-50 disabled:opacity-60 transition"
              >
                <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
                {running ? 'Testing...' : 'Test Again'}
              </button>
            </div>
          </div>

          {/* CRITICAL CALLOUT: DATABASE NOT CREATED */}
          {isDatabaseMissing && (
            <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-bold">
                  !
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-red-950">
                    Action Required: Create Cloud Firestore in Firebase Console
                  </h3>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Firebase project <strong className="font-semibold text-red-950">{result?.projectId || 'la-plots'}</strong> currently has no Cloud Firestore database created. The browser is operating in offline fallback mode, which is why plots are not saving to the cloud.
                  </p>
                  <div className="bg-white/80 rounded-xl p-3 text-xs space-y-1.5 border border-red-200">
                    <p className="font-semibold text-surface-800">Quick 3-step fix:</p>
                    <ol className="list-decimal list-inside space-y-1 text-surface-700">
                      <li>
                        Click the button below to open Firebase Console for <strong>{result?.projectId}</strong>.
                      </li>
                      <li>
                        Click <strong>"Create database"</strong> and select a region (e.g. <em>asia-south1</em> or <em>us-central1</em>).
                      </li>
                      <li>
                        Select <strong>"Start in test mode"</strong> (or deploy project rules) and click <strong>Enable</strong>.
                      </li>
                    </ol>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={consoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                    >
                      <ExternalLink size={14} />
                      Open Firebase Console &gt; Firestore
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CRITICAL CALLOUT: PERMISSION DENIED */}
          {isPermissionDenied && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-bold text-amber-950">
                    Security Rules Blocking Writes (permission-denied)
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Cloud Firestore is reachable, but your security rules currently forbid saving plots.
                    Make sure your account email ends with <code className="bg-amber-100 px-1 py-0.5 rounded">admin</code> or <code className="bg-amber-100 px-1 py-0.5 rounded">mohan</code>, or deploy the recommended project rules.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyRules}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                    >
                      <Copy size={13} />
                      {copiedRules ? 'Copied Rules to Clipboard!' : 'Copy Recommended Rules'}
                    </button>
                    <a
                      href={`https://console.firebase.google.com/project/${result?.projectId || 'la-plots'}/firestore/rules`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                    >
                      <ExternalLink size={13} />
                      Open Rules Tab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Checks List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-3">
              Diagnostic Step-by-Step Checks
            </h3>
            <div className="space-y-2.5">
              {result?.checks?.map((check) => {
                const isPass = check.status === 'pass'
                const isWarn = check.status === 'warn'
                const isFail = check.status === 'fail'
                return (
                  <div
                    key={check.id}
                    className={`rounded-2xl border p-3.5 transition-all flex items-start gap-3 ${
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
                        <X size={18} className="text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-surface-900">{check.name}</span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
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

          {/* Sample Plot Seed Verification */}
          <div className="rounded-2xl border border-surface-200 bg-surface-50/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-surface-900 flex items-center gap-1.5">
                  <PlusCircle size={15} className="text-primary-600" />
                  Live Cloud Persistence Verification
                </h4>
                <p className="text-xs text-surface-500">
                  Write a real sample plot to Firestore and verify server acknowledgment.
                </p>
              </div>
              <button
                type="button"
                disabled={seeding || running}
                onClick={handleSeedPlot}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 transition"
              >
                {seeding ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <PlusCircle size={13} />
                )}
                {seeding ? 'Writing to Cloud...' : 'Write Sample Plot'}
              </button>
            </div>

            {seedNotice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
                {seedNotice}
              </div>
            )}
            {seedError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-800">
                {seedError}
              </div>
            )}
          </div>

          {/* Project & Target Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-xl border border-surface-200 bg-white p-2.5">
              <span className="block text-[10px] text-surface-400 uppercase font-semibold">Project</span>
              <span className="font-bold text-surface-800 truncate block">{result?.projectId || 'la-plots'}</span>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-2.5">
              <span className="block text-[10px] text-surface-400 uppercase font-semibold">Auth Status</span>
              <span className="font-bold text-surface-800 truncate block">
                {result?.user ? result.user.email : 'Guest'}
              </span>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-2.5">
              <span className="block text-[10px] text-surface-400 uppercase font-semibold">Latency</span>
              <span className="font-bold text-surface-800 truncate block">{result?.latencyMs || 0} ms</span>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white p-2.5">
              <span className="block text-[10px] text-surface-400 uppercase font-semibold">Persistence</span>
              <span className="font-bold text-surface-800 truncate block">
                {result?.overall === 'success' ? 'Cloud Verified' : 'Offline / Failed'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-100 bg-surface-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-600 shadow-sm hover:bg-surface-100 transition"
            >
              <Copy size={13} />
              {copiedReport ? 'Copied Report!' : 'Copy Diagnostic Log'}
            </button>
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-600 shadow-sm hover:bg-surface-100 transition"
            >
              <ExternalLink size={13} />
              Firebase Console
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary min-h-9 rounded-xl px-5 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
