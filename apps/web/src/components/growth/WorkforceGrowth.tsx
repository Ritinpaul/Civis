'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  ActivityLogIcon,
  CubeIcon,
  CheckCircledIcon,
  LayersIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';

export function WorkforceGrowth() {
  const { metrics } = useDemo();

  const isExpanded = metrics.agentCount >= 5;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              AUTONOMOUS EXPANSION LOG
            </span>
            <span className="text-xs font-mono text-[#71717A]">
              WORKFORCE STATE: {isExpanded ? 'EVOLVED (5 AGENTS)' : 'BASELINE (4 AGENTS)'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Workforce Growth & Capability Persistence
          </h1>
          <p className="text-sm text-[#8E8EA0] mt-0.5">
            Every resolved incident permanently expands the municipal capability registry through verified, policy-governed agent ingestion.
          </p>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#0E1119] border border-white/[0.08] flex items-center gap-3">
            <CheckCircledIcon className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#71717A]">Provenance Hash</div>
              <div className="text-xs font-mono font-bold text-white">
                0x9e8a71...3d82
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Agents */}
        <div className="p-5 rounded-2xl bg-[#0E1119] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span>Specialist Agents</span>
            <span className="text-emerald-400 font-bold">+25%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#52525B] line-through">4</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {metrics.agentCount}
            </span>
          </div>
          <p className="text-[11px] text-[#8E8EA0]">
            Passage Assessment Agent integrated into A2A mesh.
          </p>
        </div>

        {/* Metric 2: Capabilities */}
        <div className="p-5 rounded-2xl bg-[#0E1119] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span>Verified Capabilities</span>
            <span className="text-emerald-400 font-bold">+8.3%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#52525B] line-through">12</span>
            <span className="text-3xl font-extrabold font-mono text-indigo-400">
              {metrics.capabilityCount}
            </span>
          </div>
          <p className="text-[11px] text-[#8E8EA0]">
            Added <code className="text-indigo-400 font-mono">flood_passability.calc</code>.
          </p>
        </div>

        {/* Metric 3: Trust Score */}
        <div className="p-5 rounded-2xl bg-[#0E1119] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span>Fleet Trust Index</span>
            <span className="text-emerald-400 font-bold">+2.1%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#52525B] line-through">94%</span>
            <span className="text-3xl font-extrabold font-mono text-purple-400">
              {metrics.trustScore}%
            </span>
          </div>
          <p className="text-[11px] text-[#8E8EA0]">
            GovernOS battery verified all 7 compliance gates.
          </p>
        </div>

        {/* Metric 4: Incident Status */}
        <div className="p-5 rounded-2xl bg-[#0E1119] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span>Incident Status</span>
            <span className="text-emerald-400 font-bold">SOLVED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {metrics.activeIncidents === 0 ? 'RESOLVED' : 'ACTIVE'}
            </span>
          </div>
          <p className="text-[11px] text-[#8E8EA0]">
            Pier 4 transit barrier deployed safely.
          </p>
        </div>
      </div>

      {/* Newly Acquired Capability Highlight Card */}
      <div className="p-6 rounded-2xl bg-[#0E1119] border-2 border-indigo-500/40 space-y-4 shadow-lg shadow-indigo-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <LayersIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  NEW WORKFORCE CAPABILITY
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  STATUS: VERIFIED & REGISTERED
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                flood_passability.calc (v1.0.0)
              </h3>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#71717A]">
            <div>Registry: Municipal A2A V2</div>
            <div className="text-emerald-400">Access: Authenticated Peers Only</div>
          </div>
        </div>

        <p className="text-xs text-[#8E8EA0] leading-relaxed">
          Dynamic calculation of emergency transit vehicle clearance ratios based on live water depth, flow speed, and chassis specifications. Available to all municipal orchestrators and dispatch workers without re-evaluation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#080A0F] border border-white/[0.06]">
            <span className="text-[10px] text-[#71717A] block">Provider Agent</span>
            <span className="text-white font-semibold">Passage Assessment Agent</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080A0F] border border-white/[0.06]">
            <span className="text-[10px] text-[#71717A] block">Policy Container</span>
            <span className="text-white font-semibold">CITY-PRIVACY-02 (Remediated)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080A0F] border border-white/[0.06]">
            <span className="text-[10px] text-[#71717A] block">Audit Proof Hash</span>
            <span className="text-white font-semibold truncate block">0x7c49...b119e</span>
          </div>
        </div>
      </div>

      {/* Immutable Provenance Audit Log Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#71717A]">
          <span>Cryptographic Provenance Audit Log (INC-2047)</span>
          <span>20 Events Recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#080A0F] border border-white/[0.06] font-mono text-xs space-y-2 text-[#8E8EA0]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] text-[#71717A]">
            <span>SEQUENCE</span>
            <span>SOURCE & EVENT TYPE</span>
            <span>VERIFICATION PROOF</span>
          </div>

          <div className="divide-y divide-white/[0.04] text-[11px]">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#01</span>
              <span className="text-indigo-400">GEMINI: Multimodal surge anomaly detected (Pier 4)</span>
              <span className="text-emerald-400">sha256:d8a2...3f11</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#02</span>
              <span className="text-white">ORCHESTRATOR: Incident INC-2047 registered</span>
              <span className="text-emerald-400">sha256:4b91...8c02</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#03</span>
              <span className="text-amber-400">ORCHESTRATOR: Capability gap detected (flood_passability)</span>
              <span className="text-emerald-400">sha256:f120...5a77</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#04</span>
              <span className="text-red-400">GOVERNOS: Policy block CITY-PRIVACY-02 (PII access)</span>
              <span className="text-emerald-400">sha256:0c33...89aa</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#05</span>
              <span className="text-emerald-400">GOVERNOS: Remediation patch applied, T03 re-verified</span>
              <span className="text-emerald-400">sha256:88e1...bb21</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#06</span>
              <span className="text-emerald-400">WORKFORCE: Passage Assessment Agent joined mesh</span>
              <span className="text-emerald-400">sha256:7c49...b119</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#52525B]">#07</span>
              <span className="text-emerald-400">RESULT: Pier 4 flood barrier deployed safely</span>
              <span className="text-emerald-400">sha256:9e8a...3d82</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
