'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  ShieldCheck,
  Truck,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  Bot,
  Activity,
} from 'lucide-react';

interface DiagnosticsDockProps {
  selectedSectorId: string;
}

export function DiagnosticsDock({ selectedSectorId }: DiagnosticsDockProps) {
  const { metrics, incident, stage, openCapabilityModal, startDemo, stepNext, setScreen, events } = useDemo();
  const [activeTab, setActiveTab] = useState<'overview' | 'passability' | 'swarm' | 'audit' | 'telemetry'>('overview');

  const isResolved = metrics.activeIncidents === 0;
  const isExpanded = metrics.agentCount >= 5;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'passability', label: 'Hydrodynamic Passability' },
    { id: 'swarm', label: 'Swarm Coordination (5 Agents)' },
    { id: 'audit', label: 'GovernOS Provenance' },
    { id: 'telemetry', label: 'Live Telemetry' },
  ] as const;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-4 shadow-2xl select-none min-h-0 overflow-y-auto">
      {/* 1. Top Tab Bar (Matching Reference's underline active tabs) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-mono scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-2 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#71717A] hover:text-[#EDEDEF]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-[2px] bg-white rounded-full shadow-sm shadow-white/50" />
                )}
              </button>
            );
          })}
        </div>

        {/* External Quick Navigation Links */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setScreen('timeline')}
            className="flex items-center gap-1 text-[11px] font-mono text-[#8E8EA0] hover:text-white transition-colors"
          >
            <span>Timeline</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => setScreen('workforce')}
            className="flex items-center gap-1 text-[11px] font-mono text-[#8E8EA0] hover:text-white transition-colors"
          >
            <span>Workforce Mesh</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Tab: Overview (Exact compositional replica of reference bottom panel) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-3 flex-1">
          {/* Left Sub-Panel: Identifier, Status Badge, and Emergency Vehicle Card */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold font-mono text-white tracking-wider">
                {incident.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                  isResolved
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-crimson/15 text-crimson border-crimson/30 animate-pulse'
                }`}
              >
                {isResolved ? 'MITIGATED' : 'CRITICAL ALERT'}
              </span>
            </div>

            {/* Emergency Vehicle Graphic Card (Matching Reference Airplane/Vehicle Card) */}
            <div className="p-2.5 rounded-xl bg-[#11141D] border border-white/[0.06] flex items-center gap-3 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-500/10">
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-xs font-bold text-white truncate font-mono">
                  ALS 4x4 Ambulance Unit
                </div>
                <div className="text-[10px] font-mono text-[#8E8EA0] truncate">
                  Fleet ID: AMB-Z4-04 • Staging Hub A
                </div>
                <div className="text-[9px] font-mono text-cyan-400 mt-0.5">
                  Clearance: 0.42m • 4x4 High-Chassis
                </div>
              </div>
            </div>
          </div>

          {/* Center Sub-Panel: Route Progression Track (Matching Reference Route Bar) */}
          <div className="lg:col-span-5 space-y-2 p-3 rounded-xl bg-[#11141D] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#EDEDEF] font-bold">Route Trajectory</span>
              <span className="text-emerald-400 font-bold text-[10.5px]">
                {isResolved ? 'DEPLOYED ON SCENE' : 'ON THE WAY: 14m ETA'}
              </span>
            </div>

            {/* Segmented Progress Track */}
            <div className="relative w-full h-2 rounded-full bg-[#181D29] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isResolved
                    ? 'w-full bg-emerald-400'
                    : 'w-2/3 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 animate-pulse'
                }`}
              />
            </div>

            {/* Origin & Destination labels */}
            <div className="flex items-center justify-between text-[10.5px] font-mono pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[#EDEDEF] font-medium truncate max-w-[130px]">
                  Guindy Staging Hub A
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isResolved ? 'bg-emerald-400' : 'bg-crimson'
                  }`}
                />
                <span className="text-[#EDEDEF] font-medium truncate max-w-[130px] text-right">
                  Pier 4 Arterial Bridge
                </span>
              </div>
            </div>
          </div>

          {/* Right Sub-Panel: Compact Metric Cards & Scenario Action Trigger */}
          <div className="lg:col-span-3 space-y-2">
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <div className="p-1.5 rounded-xl bg-[#11141D] border border-white/[0.06] text-center">
                <span className="text-[9px] text-[#71717A] uppercase block">Water</span>
                <span className="text-xs font-extrabold text-crimson">68 cm</span>
              </div>
              <div className="p-1.5 rounded-xl bg-[#11141D] border border-white/[0.06] text-center">
                <span className="text-[9px] text-[#71717A] uppercase block">Flow</span>
                <span className="text-xs font-extrabold text-amber-400">1.8 m/s</span>
              </div>
              <div className="p-1.5 rounded-xl bg-[#11141D] border border-white/[0.06] text-center">
                <span className="text-[9px] text-[#71717A] uppercase block">ETA</span>
                <span className="text-xs font-extrabold text-emerald-400">14 min</span>
              </div>
            </div>

            {/* Interactive Scenario Advance Button */}
            {stage === 'capability_gap' ? (
              <button
                onClick={openCapabilityModal}
                className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Resolve Capability Gap</span>
              </button>
            ) : stage === 'idle' ? (
              <button
                onClick={startDemo}
                className="w-full py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Autonomous Swarm</span>
              </button>
            ) : (
              <button
                onClick={stepNext}
                disabled={stage === 'resolved'}
                className="w-full py-1.5 px-3 rounded-xl bg-[#161B26] hover:bg-[#1E2433] border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Advance ({stage.replace('_', ' ').toUpperCase()})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Secondary Tab: Hydrodynamic Passability */}
      {activeTab === 'passability' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2">
          <div className="p-3 rounded-xl bg-[#11141D] border border-crimson/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Civilian Sedans</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-crimson/20 text-crimson font-bold">
                IMPASSABLE
              </span>
            </div>
            <p className="text-[10px] text-[#8E8EA0] leading-relaxed">
              Max clearance: 30cm. 68cm water depth creates 100% stall/drown risk. Hard barricade deployed.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#11141D] border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Standard Ambulances</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold">
                HIGH RISK
              </span>
            </div>
            <p className="text-[10px] text-[#8E8EA0] leading-relaxed">
              Clearance: 45cm. Turbidity and 1.8 m/s current pose rollover danger. Rerouted to Inner Ring Road.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#11141D] border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">ALS 4x4 Emergency Fleet</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">
                PASSABLE
              </span>
            </div>
            <p className="text-[10px] text-[#8E8EA0] leading-relaxed">
              Clearance: 75cm. Snorkel intake active. Passage Assessment Agent calculates safe passage ratio 0.42.
            </p>
          </div>
        </div>
      )}

      {/* 4. Secondary Tab: Swarm Coordination */}
      {activeTab === 'swarm' && (
        <div className="p-3 rounded-xl bg-[#11141D] border border-white/[0.06] flex items-center justify-between pt-2">
          <div className="space-y-1 font-mono">
            <div className="text-xs font-bold text-white">
              {isExpanded ? '5-Agent Swarm Operational' : '4-Agent Baseline Swarm Active'}
            </div>
            <div className="text-[10.5px] text-[#8E8EA0]">
              Perception ➔ Orchestration ➔ GovernOS Sentinel ➔ Hydraulic Passage ➔ Civic Dispatch
            </div>
          </div>
          <button
            onClick={() => setScreen('workforce')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>View Mesh Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Secondary Tab: GovernOS Provenance */}
      {activeTab === 'audit' && (
        <div className="p-3 rounded-xl bg-[#11141D] border border-white/[0.06] flex items-center justify-between pt-2">
          <div className="space-y-1 font-mono">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Immutable Ledger Sealed (100% Pass Rate)</span>
            </div>
            <div className="text-[10.5px] text-[#8E8EA0]">
              Hash: 0x9f83...c72d • Policy CITY-PRIVACY-02 enforced • Zero PII leakage
            </div>
          </div>
          <button
            onClick={() => setScreen('timeline')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Inspect Provenance Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6. Secondary Tab: Live Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
          {events.slice(0, 3).map((e) => (
            <div
              key={e.id}
              className="p-2.5 rounded-xl bg-[#11141D] border border-white/[0.05] space-y-1 hover:border-white/15 transition-all font-mono"
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className="px-1.5 py-0.2 rounded font-bold bg-[#181D29] text-[#EDEDEF] border border-white/10">
                  {e.source}
                </span>
                <span className="text-[#71717A]">+{e.timestamp}</span>
              </div>
              <div className="text-[11px] font-bold text-white truncate">{e.title}</div>
              <p className="text-[9.5px] text-[#8E8EA0] line-clamp-2 leading-relaxed">
                {e.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
