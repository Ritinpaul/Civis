'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  AlertTriangle,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function CommandCenter() {
  const { metrics, incident, events, setScreen, openCapabilityModal, stage, startDemo } = useDemo();

  const isExpanded = metrics.agentCount >= 5;
  const isResolved = metrics.activeIncidents === 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Workforce */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border space-y-2 hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo" />
              <span>ACTIVE WORKFORCE</span>
            </span>
            {isExpanded && <span className="text-emerald font-bold">+1 AGENT</span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-primary">
              {metrics.agentCount}
            </span>
            <span className="text-xs font-mono text-primary-muted">
              {isExpanded ? '(Expanded)' : '(Baseline 4)'}
            </span>
          </div>
          <div className="text-[11px] text-primary-secondary">
            {isExpanded ? 'Passage Assessment Agent active' : '4 foundational agents deployed'}
          </div>
        </div>

        {/* Metric 2: Capabilities */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border space-y-2 hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple" />
              <span>CAPABILITIES</span>
            </span>
            {isExpanded && <span className="text-indigo font-bold">+1 NEW</span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-indigo">
              {metrics.capabilityCount}
            </span>
            <span className="text-xs font-mono text-primary-muted">Verified</span>
          </div>
          <div className="text-[11px] text-primary-secondary">
            {isExpanded ? 'flood_passability.calc registered' : '12 baseline skills registered'}
          </div>
        </div>

        {/* Metric 3: Active Incidents */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border space-y-2 hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${isResolved ? 'text-emerald' : 'text-crimson'}`} />
              <span>ACTIVE INCIDENTS</span>
            </span>
            <span className={`font-bold ${isResolved ? 'text-emerald' : 'text-crimson'}`}>
              {isResolved ? 'ZERO' : 'HIGH'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                isResolved ? 'text-emerald' : 'text-crimson'
              }`}
            >
              {metrics.activeIncidents}
            </span>
            <span className="text-xs font-mono text-primary-muted">
              {isResolved ? 'All clear' : 'INC-2047'}
            </span>
          </div>
          <div className="text-[11px] text-primary-secondary">
            {isResolved ? 'Mitigated with dynamic barrier' : 'Pier 4 water accumulation'}
          </div>
        </div>

        {/* Metric 4: Fleet Trust */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border space-y-2 hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-primary-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
              <span>FLEET TRUST INDEX</span>
            </span>
            <span className="text-emerald font-bold">100% GATED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple">
              {metrics.trustScore}%
            </span>
            <span className="text-xs font-mono text-primary-muted">GovernOS</span>
          </div>
          <div className="text-[11px] text-primary-secondary">
            Blast radius strictly bounded
          </div>
        </div>
      </div>

      {/* Main Grid: Active Incident + Workforce Flow Mini-Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Incident Card */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface-1 border border-border space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg border ${
                  isResolved
                    ? 'bg-emerald-muted border-emerald-border text-emerald'
                    : 'bg-crimson-muted border-crimson-border text-crimson'
                }`}
              >
                {isResolved ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isResolved
                        ? 'bg-emerald-muted text-emerald border border-emerald-border'
                        : 'bg-crimson-muted text-crimson border border-crimson-border animate-pulse'
                    }`}
                  >
                    {isResolved ? 'RESOLVED' : `${incident.severity} SEVERITY`}
                  </span>
                  <span className="text-xs font-mono text-primary-muted">{incident.id}</span>
                </div>
                <h2 className="text-lg font-bold text-primary mt-1">{incident.title}</h2>
              </div>
            </div>

            <button
              onClick={() => setScreen('timeline')}
              className="flex items-center gap-1.5 text-xs font-mono text-indigo hover:text-indigo/80 font-semibold transition-colors"
            >
              <span>Live Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-primary-secondary leading-relaxed">
            {incident.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <span className="text-[10px] text-primary-muted block">Location</span>
              <span className="text-primary font-medium">{incident.location}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <span className="text-[10px] text-primary-muted block">Perception Engine</span>
              <span className="text-indigo font-medium">{incident.source}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <span className="text-[10px] text-primary-muted block">Action Status</span>
              <span className={isResolved ? 'text-emerald font-semibold' : 'text-amber font-semibold'}>
                {isResolved ? 'Transit Diverted Safely' : 'Capability Gap Ingestion'}
              </span>
            </div>
          </div>

          {/* Incident Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {stage === 'capability_gap' && (
              <button
                onClick={openCapabilityModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo hover:bg-indigo/90 text-white text-xs font-bold shadow-md shadow-indigo-glow transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Resolve Capability Gap (Candidate Selection)</span>
              </button>
            )}

            {stage === 'idle' && (
              <button
                onClick={startDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo hover:bg-indigo/90 text-white text-xs font-bold shadow-md shadow-indigo-glow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trigger Autonomous Story Demo</span>
              </button>
            )}

            <button
              onClick={() => setScreen('workforce')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-hover text-primary-secondary hover:text-primary border border-border text-xs font-mono transition-colors"
            >
              <span>Inspect Workforce Mesh</span>
            </button>
          </div>
        </div>

        {/* Right Col: Live Workforce Flow Pipeline */}
        <div className="p-6 rounded-xl bg-surface-1 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald" />
              <span className="text-xs font-mono font-bold text-primary">A2A DELEGATION FLOW</span>
            </div>
            <span className="text-[10px] font-mono text-emerald font-semibold">LIVE MESH</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Step 1: Gemini */}
            <div className="p-3 rounded-lg bg-surface-2 border border-indigo/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo" />
                <span className="text-primary font-medium">Gemini Perception</span>
              </div>
              <span className="text-[10px] text-indigo font-bold">DETECT</span>
            </div>

            {/* Step 2: Orchestrator */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">Core Orchestrator</span>
              </div>
              <span className="text-[10px] text-primary-secondary font-bold">ROUTE</span>
            </div>

            {/* Step 3: GovernOS */}
            <div className="p-3 rounded-lg bg-surface-2 border border-purple/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple" />
                <span className="text-primary font-medium">GovernOS Sentinel</span>
              </div>
              <span className="text-[10px] text-purple font-bold">GATE</span>
            </div>

            {/* Step 4: Dispatch / Specialist */}
            <div
              className={`p-3 rounded-lg bg-surface-2 border flex items-center justify-between transition-all ${
                isExpanded ? 'border-emerald shadow-sm shadow-emerald-glow/20' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${isExpanded ? 'text-emerald' : 'text-primary-muted'}`} />
                <span className="text-primary font-medium">
                  {isExpanded ? 'Passage + Dispatch' : 'Civic Dispatcher'}
                </span>
              </div>
              <span className={`text-[10px] font-bold ${isExpanded ? 'text-emerald' : 'text-primary-muted'}`}>
                {isExpanded ? 'ACTUATE' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Live Incident Stream Preview */}
      <div className="p-6 rounded-xl bg-surface-1 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo" />
            <span className="text-xs font-mono font-bold text-primary">
              LIVE EVENT STREAM (LATEST 3)
            </span>
          </div>
          <button
            onClick={() => setScreen('timeline')}
            className="text-xs font-mono text-primary-muted hover:text-primary transition-colors"
          >
            View all {events.length} events →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.slice(0, 3).map((e) => (
            <div
              key={e.id}
              className="p-4 rounded-lg bg-surface-2 border border-border space-y-2 hover:border-border-strong transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-3 text-primary border border-border">
                  {e.source}
                </span>
                <span className="text-[10px] font-mono text-primary-muted">
                  +{e.timestamp}
                </span>
              </div>
              <div className="text-xs font-bold text-primary truncate">{e.title}</div>
              <p className="text-[11px] text-primary-secondary line-clamp-2 leading-relaxed">
                {e.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
