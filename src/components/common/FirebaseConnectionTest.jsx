import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCw,
  ShieldCheck,
  Database,
  RefreshCw,
} from 'lucide-react'
import { runFirestoreCrudTest } from '../../utils/firestoreTest'
import { auth, isFirebaseConfigured } from '../../firebase/config'

const STEPS = [
  { key: 'create', label: 'CREATE  (POST /plots)' },
  { key: 'read', label: 'READ     (GET /plots/:id)' },
  { key: 'update', label: 'UPDATE  (PUT /plots/:id)' },
  { key: 'query', label: 'QUERY   (GET /plots)' },
  { key: 'delete', label: 'DELETE  (DELETE /plots/:id)' },
]

function StatusIcon({ ok }) {
  return ok ? (
    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
  ) : (
    <XCircle className="w-4.5 h-4.5 text-rose-500" />
  )
}

function StatusPill({ ok }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
        ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}
    >
      {ok ? 'PASS' : 'FAIL'}
    </span>
  )
}

export function FirebaseConnectionTest() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const initOk = Boolean(isFirebaseConfigured && auth)

  async function handleRun() {
    setRunning(true)
    setResult(null)
    try {
      const res = await runFirestoreCrudTest()
      setResult(res)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">System Architecture Diagnostics</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tests Firebase Authentication session + MongoDB Atlas REST API endpoints (Connect → Create → Read → Update → Query → Delete).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          {running ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <PlayCircle className="w-3.5 h-3.5" />
              Run System Diagnostics
            </>
          )}
        </button>
      </div>

      {/* Auth & DB badges */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${
            initOk
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Firebase Auth: {initOk ? 'CONFIGURED' : 'NOT CONFIGURED'}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${
            auth?.currentUser
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          User Session: {auth?.currentUser ? `SIGNED IN (${auth.currentUser.email || auth.currentUser.uid})` : 'GUEST / ANONYMOUS'}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
          <Database className="w-3.5 h-3.5" />
          Database Provider: MongoDB Atlas
        </span>
      </div>

      {/* Result grid */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">MongoDB Atlas API Reachability</span>
              <StatusPill ok={result.connect} />
            </div>
            {STEPS.map((step) => (
              <div key={step.key} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <StatusIcon ok={result[step.key]} />
                  {step.label}
                </span>
                <StatusPill ok={result[step.key]} />
              </div>
            ))}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <StatusIcon ok={result.success} />
                Overall Diagnostics
              </span>
              <StatusPill ok={result.success} />
            </div>
          </div>

          {!result.success && (
            <div className="p-3.5 rounded-xl border text-xs leading-relaxed bg-rose-50 border-rose-200 text-rose-950">
              <p className="font-bold mb-1">Diagnostic Notice</p>
              <p className="text-[11px]">{result.error || 'Check server connection and retry.'}</p>
            </div>
          )}

          {result.success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Full MongoDB Atlas CRUD sequence and Firebase Auth verified successfully!
            </div>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${running ? 'animate-spin' : ''}`} />
            Re-run diagnostics
          </button>
        </div>
      )}
    </div>
  )
}

export default FirebaseConnectionTest