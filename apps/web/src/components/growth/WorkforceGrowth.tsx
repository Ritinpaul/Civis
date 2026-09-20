'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  FileCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function WorkforceGrowth() {
  const { metrics, stage, incident, events } = useDemo();

  const isExpanded = metrics.agentCount >= 5;
  const isResolved = metrics.activeIncidents === 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                isExpanded
                  ? 'bg-emerald-muted text-emerald border-emerald-border'
                  : 'bg-indigo-muted text-indigo border-indigo-border'
              }`}
            >
              {isExpanded ? 'AUTONOMOUS EXPANSION LOG' : 'WORKFORCE REGISTRY'}
            </span>
            <span className="text-xs font-mono text-primary-muted">
              WORKFORCE STATE: {isExpanded ? 'EVOLVED (5 AGENTS)' : 'BASELINE (4 AGENTS)'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Workforce Growth & Capability Persistence
          </h1>
          <p className="text-sm text-primary-secondary mt-0.5">
            {isExpanded
              ? 'Every resolved incident permanently expands the municipal capability registry through verified, policy-governed agent ingestion.'
              : 'Current active workforce operating at baseline capacity. Autonomous growth occurs when novel incidents demand unverified skills.'}
          </p>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-surface-2 border border-border flex items-center gap-3">
            <ShieldCheck className={`w-6 h-6 ${isExpanded ? 'text-emerald' : 'text-primary-muted'}`} />
            <div>
              <div className="text-[10px] font-mono uppercase text-primary-muted">
                {isExpanded ? 'Provenance Hash' : 'Ledger Status'}
              </div>
              <div className="text-xs font-mono font-bold text-primary">
                {isExpanded ? '0x9e8a71...3d82' : 'STREAMING LIVE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Agents */}
        <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span>Specialist Agents</span>
            {isExpanded ? (
              <span className="text-emerald font-bold">+25%</span>
            ) : (
              <span className="text-primary-muted font-bold">BASELINE</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            {isExpanded ? (
              <>
                <span className="text-2xl font-bold font-mono text-primary-muted line-through">4</span>
                <span className="text-3xl font-extrabold font-mono text-emerald">
                  {metrics.agentCount}
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold font-mono text-primary">
                {metrics.agentCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary-secondary">
            {isExpanded
              ? 'Passage Assessment Agent integrated into A2A mesh.'
              : '4 foundational agents active in mesh.'}
          </p>
        </div>

        {/* Metric 2: Capabilities */}
        <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span>Verified Capabilities</span>
            {isExpanded ? (
              <span className="text-emerald font-bold">+8.3%</span>
            ) : (
              <span className="text-primary-muted font-bold">BASELINE</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            {isExpanded ? (
              <>
                <span className="text-2xl font-bold font-mono text-primary-muted line-through">12</span>
                <span className="text-3xl font-extrabold font-mono text-indigo">
                  {metrics.capabilityCount}
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold font-mono text-primary">
                {metrics.capabilityCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary-secondary">
            {isExpanded ? (
              <>Added <code className="text-indigo font-mono">flood_passability.calc</code>.</>
            ) : (
              '12 baseline skills verified in registry.'
            )}
          </p>
        </div>

        {/* Metric 3: Trust Score */}
        <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span>Fleet Trust Index</span>
            {isExpanded ? (
              <span className="text-emerald font-bold">+2.1%</span>
            ) : (
              <span className="text-emerald font-bold">100% GATED</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            {isExpanded ? (
              <>
                <span className="text-2xl font-bold font-mono text-primary-muted line-through">94%</span>
                <span className="text-3xl font-extrabold font-mono text-purple">
                  {metrics.trustScore}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold font-mono text-purple">
                {metrics.trustScore}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary-secondary">
            {isExpanded
              ? 'GovernOS battery verified all 7 compliance gates.'
              : 'GovernOS sentinel guarding all agent boundaries.'}
          </p>
        </div>

        {/* Metric 4: Incident Status */}
        <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span>Incident Status</span>
            <span className={`font-bold ${isResolved ? 'text-emerald' : 'text-crimson'}`}>
              {isResolved ? 'SOLVED' : 'ACTIVE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                isResolved ? 'text-emerald' : 'text-crimson'
              }`}
            >
              {isResolved ? 'RESOLVED' : 'ACTIVE'}
            </span>
          </div>
          <p className="text-[11px] text-primary-secondary">
            {isResolved
              ? 'Pier 4 transit barrier deployed safely.'
              : 'Pier 4 inundation investigation underway.'}
          </p>
        </div>
      </div>

      {/* Dynamic Capability Card (Pending vs Ingested) */}
      {isExpanded ? (
        <div className="p-6 rounded-xl bg-surface-2/80 border-2 border-indigo/40 space-y-4 shadow-lg shadow-indigo-glow/10 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo/20 border border-indigo text-indigo">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-muted text-indigo border border-indigo-border">
                    NEW WORKFORCE CAPABILITY
                  </span>
                  <span className="text-xs font-mono text-emerald font-semibold">
                    STATUS: VERIFIED & REGISTERED
                  </span>
                </div>
                <h3 className="text-base font-bold text-primary mt-1">
                  flood_passability.calc (v1.0.0)
                </h3>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-primary-muted">
              <div>Registry: Municipal A2A V2</div>
              <div className="text-emerald">Access: Authenticated Peers Only</div>
            </div>
          </div>

          <p className="text-xs text-primary-secondary leading-relaxed">
            Dynamic calculation of emergency transit vehicle clearance ratios based on live water depth, flow speed, and chassis specifications. Available to all municipal orchestrators and dispatch workers without re-evaluation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border font-mono text-xs">
            <div className="p-3 rounded-lg bg-surface-1 border border-border">
              <span className="text-[10px] text-primary-muted block">Provider Agent</span>
              <span className="text-primary font-semibold">Passage Assessment Agent</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-1 border border-border">
              <span className="text-[10px] text-primary-muted block">Policy Container</span>
              <span className="text-primary font-semibold">CITY-PRIVACY-02 (Remediated)</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-1 border border-border">
              <span className="text-[10px] text-primary-muted block">Audit Proof Hash</span>
              <span className="text-primary font-semibold truncate block">0x7c49...b119e</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-surface-1 border border-border border-dashed space-y-3 text-center py-8">
          <div className="mx-auto w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-primary-muted">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">No Dynamic Capabilities Ingested Yet</h4>
            <p className="text-xs text-primary-secondary mt-1 max-w-md mx-auto">
              Run the simulation story to trigger a novel flood scenario, detect the capability gap, and witness autonomous agent ingestion and verification.
            </p>
          </div>
        </div>
      )}

      {/* Immutable Provenance Audit Log Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-primary-muted">
          <span>Cryptographic Provenance Audit Log ({incident.id})</span>
          <span>{isResolved ? '20 Events Recorded (Sealed)' : `${events.length} Events Streaming`}</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border font-mono text-xs space-y-2 text-primary-secondary">
          <div className="flex items-center justify-between border-b border-border pb-2 text-[11px] text-primary-muted">
            <span>SEQUENCE</span>
            <span>SOURCE & EVENT TYPE</span>
            <span>VERIFICATION PROOF</span>
          </div>

          <div className="divide-y divide-border/40 text-[11px]">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-primary-muted">#01</span>
              <span className="text-indigo">GEMINI: Multimodal surge anomaly detected (Pier 4)</span>
              <span className="text-emerald">sha256:d8a2...3f11</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-primary-muted">#02</span>
              <span className="text-primary">ORCHESTRATOR: Incident INC-2047 registered</span>
              <span className="text-emerald">sha256:4b91...8c02</span>
            </div>
            {isExpanded && (
              <>
                <div className="py-1.5 flex items-center justify-between">
                  <span className="text-primary-muted">#03</span>
                  <span className="text-amber">ORCHESTRATOR: Capability gap detected (flood_passability)</span>
                  <span className="text-emerald">sha256:f120...5a77</span>
                </div>
                <div className="py-1.5 flex items-center justify-between">
                  <span className="text-primary-muted">#04</span>
                  <span className="text-crimson">GOVERNOS: Policy block CITY-PRIVACY-02 (PII access)</span>
                  <span className="text-emerald">sha256:0c33...89aa</span>
                </div>
                <div className="py-1.5 flex items-center justify-between">
                  <span className="text-primary-muted">#05</span>
                  <span className="text-emerald">GOVERNOS: Remediation patch applied, T03 re-verified</span>
                  <span className="text-emerald">sha256:88e1...bb21</span>
                </div>
                <div className="py-1.5 flex items-center justify-between">
                  <span className="text-primary-muted">#06</span>
                  <span className="text-emerald">WORKFORCE: Passage Assessment Agent joined mesh</span>
                  <span className="text-emerald">sha256:7c49...b119</span>
                </div>
                <div className="py-1.5 flex items-center justify-between">
                  <span className="text-primary-muted">#07</span>
                  <span className="text-emerald">RESULT: Pier 4 flood barrier deployed safely</span>
                  <span className="text-emerald">sha256:9e8a...3d82</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
