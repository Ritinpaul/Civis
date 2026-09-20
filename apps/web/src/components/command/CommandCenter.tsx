'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  Cpu,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { SectorQueue } from './SectorQueue';
import { TacticalMap } from './TacticalMap';
import { DiagnosticsDock } from './DiagnosticsDock';

const STAGE_LABELS: Record<string, string> = {
  idle: '1. Standby (Baseline 4)',
  incident_detected: '2. Incident Detected',
  investigating: '3. Strategic Analysis',
  capability_gap: '4. Capability Gap Found',
  evaluating: '5. Battery Ingestion',
  evaluation_failed: '6. GovernOS Blocked',
  repairing: '7. Automated Repair',
  verified: '8. Cryptographically Sealed',
  joining_workforce: '9. Swarm Expanded (5)',
  resolved: '10. Hazard Mitigated',
};

export function CommandCenter() {
  const { metrics, stage } = useDemo();
  const [selectedSectorId, setSelectedSectorId] = useState<string>('pier-4');

  const isExpanded = metrics.agentCount >= 5;
  const isResolved = metrics.activeIncidents === 0;

  return (
    <div className="p-3 md:p-4 w-full h-[calc(100vh-3.5rem)] flex flex-col gap-3 select-none overflow-y-auto lg:overflow-hidden bg-[#07080B]">
      {/* Top 1-Row Technical Telemetry Bar (High Density, Sleek & Compact) */}
      <div className="h-10 px-4 rounded-xl bg-[#0B0D13] border border-white/[0.08] flex items-center justify-between gap-4 text-xs font-mono shrink-0 shadow-lg">
        {/* Metric 1: Active Workforce */}
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[#71717A] hidden sm:inline">WORKFORCE:</span>
          <span className="font-bold text-[#EDEDEF]">{metrics.agentCount}</span>
          <span className="text-[10px] text-[#71717A]">
            {isExpanded ? '(+1 Expanded)' : '(Baseline 4)'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.08] hidden sm:block" />

        {/* Metric 2: Capabilities */}
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[#71717A] hidden sm:inline">CAPABILITIES:</span>
          <span className="font-bold text-indigo-400">{metrics.capabilityCount}</span>
          <span className="text-[10px] text-[#71717A]">Verified</span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.08] hidden sm:block" />

        {/* Metric 3: Active Incidents */}
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`w-3.5 h-3.5 shrink-0 ${isResolved ? 'text-emerald-400' : 'text-crimson'}`}
          />
          <span className="text-[#71717A] hidden sm:inline">INCIDENTS:</span>
          <span
            className={`font-bold ${isResolved ? 'text-emerald-400' : 'text-crimson'}`}
          >
            {metrics.activeIncidents}
          </span>
          <span
            className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-crimson/15 text-crimson border border-crimson/30 animate-pulse'
            }`}
          >
            {isResolved ? 'MITIGATED' : 'CRITICAL'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.08] hidden md:block" />

        {/* Metric 4: Fleet Trust Index */}
        <div className="hidden md:flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[#71717A]">TRUST:</span>
          <span className="font-bold text-purple-400">{metrics.trustScore}%</span>
          <span className="text-[9.5px] text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
            100% Gated
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.08] hidden lg:block" />

        {/* Story Stage Operational Tracker */}
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="text-[10px] uppercase text-[#71717A] tracking-wider">STAGE:</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                stage === 'resolved' ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'
              }`}
            />
            <span className="font-medium text-[#EDEDEF] text-[11px]">
              {STAGE_LABELS[stage] || stage}
            </span>
          </div>
          {/* Micro Progress Bar */}
          <div className="w-16 bg-[#161B26] rounded-full h-1 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{
                width: `${
                  stage === 'idle'
                    ? 10
                    : stage === 'incident_detected'
                    ? 20
                    : stage === 'investigating'
                    ? 30
                    : stage === 'capability_gap'
                    ? 45
                    : stage === 'evaluating'
                    ? 60
                    : stage === 'evaluation_failed'
                    ? 70
                    : stage === 'repairing'
                    ? 80
                    : stage === 'verified'
                    ? 90
                    : 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Operations Dashboard (Matching Reference Layout) */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-3 min-h-0">
        {/* Left Column: Municipal Sector Operational Queue */}
        <SectorQueue
          selectedSectorId={selectedSectorId}
          onSelectSector={setSelectedSectorId}
        />

        {/* Right Column: Hero Tactical Map + Asset Diagnostics Dock */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          {/* Tactical Radar Map Container */}
          <div className="flex-[1.25] min-h-[300px] lg:min-h-0 relative">
            <TacticalMap
              selectedSectorId={selectedSectorId}
              onSelectSector={setSelectedSectorId}
            />
          </div>

          {/* Diagnostics Inspector Dock */}
          <div className="flex-1 min-h-[220px] lg:min-h-0 relative">
            <DiagnosticsDock selectedSectorId={selectedSectorId} />
          </div>
        </div>
      </div>
    </div>
  );
}
