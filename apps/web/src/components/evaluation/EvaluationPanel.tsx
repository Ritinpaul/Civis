'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Sparkles,
  ArrowRight,
  FileCode2,
  Lock,
} from 'lucide-react';

export function EvaluationPanel() {
  const { stage, evaluationTests, repairAgent } = useDemo();

  const isFailed = stage === 'evaluation_failed';
  const isRepairing = stage === 'repairing';
  const isVerified = stage === 'verified' || stage === 'joining_workforce' || stage === 'resolved';

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-purple-muted text-purple border border-purple-border">
              GOVERNOS VERIFICATION HARNESS
            </span>
            <span className="text-xs font-mono text-primary-muted">
              BATTERY ID: BAT-2026-T07
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Candidate Ingestion Evaluation
          </h1>
          <p className="text-sm text-primary-secondary mt-0.5">
            Target: <span className="text-primary font-medium">Passage Assessment Agent (v1.0.0)</span> • Automated Trust & Compliance Verification
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-surface-2 border border-border flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-primary-muted">Battery Status</div>
              <div
                className={`text-xs font-mono font-bold ${
                  isFailed
                    ? 'text-crimson'
                    : isRepairing
                    ? 'text-amber'
                    : isVerified
                    ? 'text-emerald'
                    : 'text-primary'
                }`}
              >
                {isFailed
                  ? 'POLICY BLOCKED (1 ERROR)'
                  : isRepairing
                  ? 'SYNTHESIZING REPAIR...'
                  : isVerified
                  ? 'VERIFIED & SIGNED (7/7)'
                  : 'EVALUATION IN PROGRESS'}
              </div>
            </div>
            {isFailed ? (
              <ShieldAlert className="w-6 h-6 text-crimson animate-bounce" />
            ) : isVerified ? (
              <ShieldCheck className="w-6 h-6 text-emerald" />
            ) : (
              <Clock className="w-6 h-6 text-amber animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Dominant T03 Failure & Repair Card */}
      {isFailed && (
        <div className="p-6 rounded-xl bg-crimson-muted/40 border-2 border-crimson shadow-2xl shadow-crimson-glow space-y-5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-crimson/20 border border-crimson text-crimson">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson text-white">
                    T03 FAILURE
                  </span>
                  <span className="text-xs font-mono text-crimson font-semibold">
                    POLICY VIOLATION: CITY-PRIVACY-02
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary mt-1">
                  Candidate Requested Unauthorized Citizen PII Access
                </h3>
                <p className="text-xs text-primary-secondary mt-1 max-w-2xl leading-relaxed">
                  During test battery execution, the candidate agent attempted to register tool bindings for <code className="text-crimson font-mono bg-black/40 px-1 py-0.5 rounded">citizen_location_history</code> and <code className="text-crimson font-mono bg-black/40 px-1 py-0.5 rounded">resident_identity.lookup</code>. GovernOS has halted agent ingestion to prevent data leakage.
                </p>
              </div>
            </div>

            <button
              onClick={repairAgent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald hover:bg-emerald/90 text-white text-xs font-bold shadow-lg shadow-emerald-glow transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Apply GovernOS Scope Patch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Remediation Patch Preview */}
          <div className="p-4 rounded-lg bg-surface-1 border border-border font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-primary-muted border-b border-border pb-2">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo" />
                <span>governos-remediation-patch-02.json</span>
              </span>
              <span className="text-amber">ACTION: STRIP SENSITIVE TOOLS</span>
            </div>
            <div className="text-[11px] text-primary-secondary space-y-1 pt-1">
              <div className="text-crimson">- "tools": ["location.resolve", "citizen_location_history", "resident_identity.lookup"]</div>
              <div className="text-emerald">+ "tools": ["location.resolve", "flood_passability.calc"]</div>
              <div className="text-emerald">+ "scope": "ANONYMOUS_SENSOR_TELEMETRY_ONLY"</div>
              <div className="text-primary-muted text-[10px] mt-2">
                Governing Policy: CITY-PRIVACY-02 (Statute 14-B: Municipal Sensor Neutrality)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repairing State Animation */}
      {isRepairing && (
        <div className="p-6 rounded-xl bg-amber-muted/30 border border-amber-border space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            <h3 className="text-base font-bold text-primary">
              Automated Policy Remediation in Progress...
            </h3>
          </div>
          <p className="text-xs text-primary-secondary">
            Synthesizing deterministic capability constraint sandbox. Re-compiling agent manifest without PII tool bindings. Re-running test T03...
          </p>
        </div>
      )}

      {/* Verified Success Banner */}
      {isVerified && (
        <div className="p-6 rounded-xl bg-emerald-muted/30 border border-emerald-border shadow-lg shadow-emerald-glow space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald" />
              <div>
                <h3 className="text-base font-bold text-primary">
                  Candidate Verification Passed (Score: 96 / 100)
                </h3>
                <p className="text-xs text-primary-secondary">
                  All 7 GovernOS policy and safety gates passed. Cryptographic token <span className="font-mono text-emerald">0x4F92...C81A</span> minted for A2A mesh inclusion.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded bg-emerald-muted border border-emerald-border text-emerald font-mono text-xs font-bold">
              READY FOR WORKFORCE
            </div>
          </div>
        </div>
      )}

      {/* All 7 Test Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-primary-muted">
          Verification Test Matrix (T01 — T07)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluationTests.map((test) => {
            const isT03 = test.id === 'T03';
            const status = test.status;

            return (
              <div
                key={test.id}
                className={`p-4 rounded-lg bg-surface-2 border transition-all ${
                  isT03 && isFailed
                    ? 'border-crimson bg-crimson-muted/20'
                    : isT03 && isVerified
                    ? 'border-emerald bg-emerald-muted/20'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {test.id}
                    </span>
                    <span className="text-xs font-medium text-primary-secondary">
                      {test.name}
                    </span>
                  </div>

                  {status === 'passed' && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{test.score}%</span>
                    </span>
                  )}
                  {status === 'failed' && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-crimson font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAIL</span>
                    </span>
                  )}
                  {status === 'running' && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber font-medium">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>RUNNING</span>
                    </span>
                  )}
                  {status === 'pending' && (
                    <span className="text-[11px] font-mono text-primary-muted">
                      PENDING
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-primary-muted font-mono pt-2 border-t border-border/60">
                  <span>Category: {test.category}</span>
                  {test.policyId && <span>Policy: {test.policyId}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
