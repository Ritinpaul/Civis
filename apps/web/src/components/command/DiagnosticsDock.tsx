'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  ClockIcon,
  CardStackIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';

interface DiagnosticsDockProps {
  selectedSectorId: string;
}

export function DiagnosticsDock({ selectedSectorId }: DiagnosticsDockProps) {
  const { metrics, incident, stage, openCapabilityModal, startDemo, stepNext, setScreen } = useDemo();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Timeline' | 'Evaluation' | 'Authority' | 'Swarm'>('Overview');

  const isResolved = metrics.activeIncidents === 0;

  const tabs = ['Overview', 'Timeline', 'Evaluation', 'Authority', 'Swarm'] as const;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-4 shadow-2xl select-none min-h-0 overflow-y-auto font-sans">
      {/* 1. Underline Tabs Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-sans scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Timeline') setScreen('timeline');
                  else if (tab === 'Evaluation') setScreen('evaluation');
                  else if (tab === 'Authority') setScreen('authority');
                  else if (tab === 'Swarm') setScreen('workforce');
                }}
                className={`relative pb-2 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#71717A] hover:text-[#EDEDEF]'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Fleet Mesh Link */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-[#71717A]">
          <button
            onClick={() => setScreen('workforce')}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>A2A Workforce Mesh</span>
            <ExternalLinkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-3 flex-1">
        {/* Left Column (4 cols): ID + Status Badge + Vehicle Render */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold font-mono text-white tracking-wider">
              {incident.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold border ${
                isResolved
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
              }`}
            >
              {isResolved ? 'RESOLVED' : 'CRITICAL ALERT'}
            </span>
          </div>

          {/* Technical Vehicle Illustration Card */}
          <div className="flex items-center gap-4 pt-1">
            <div className="w-32 h-12 rounded-xl bg-[#11131A] border border-white/[0.06] flex items-center justify-center px-3 shadow-inner relative overflow-hidden">
              <svg viewBox="0 0 110 40" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {/* ALS 4x4 Chassis Body */}
                <rect x="15" y="14" width="68" height="15" rx="3" fill="#0E121B" stroke="#EAB308" strokeWidth="1.5" />
                <rect x="60" y="10" width="22" height="19" rx="2" fill="#0E121B" stroke="#EAB308" strokeWidth="1.5" />
                {/* Windshield */}
                <path d="M 68 12 L 80 12 L 78 18 L 68 18 Z" fill="#38BDF8" opacity="0.8" />
                {/* Emergency Cross */}
                <path d="M 36 21 L 44 21 M 40 17 L 40 25" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
                {/* Wheels */}
                <circle cx="28" cy="30" r="5" fill="#18181B" stroke="#71717A" strokeWidth="1.5" />
                <circle cx="28" cy="30" r="2" fill="#EAB308" />
                <circle cx="70" cy="30" r="5" fill="#18181B" stroke="#71717A" strokeWidth="1.5" />
                <circle cx="70" cy="30" r="2" fill="#EAB308" />
                {/* Snorkel Intake Tube */}
                <path d="M 81 14 L 84 14 L 84 6 L 86 6" fill="none" stroke="#EAB308" strokeWidth="1.2" />
              </svg>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold text-white truncate font-sans">
                Civic Dispatch / ALS 4x4 Fleet
              </div>
              <div className="text-[10px] font-sans text-[#71717A] truncate mt-0.5">
                Fleet AMB-Z4-04 • Staging Hub A
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (5 cols): Route Header + Progress Track + Locations */}
        <div className="lg:col-span-5 space-y-2.5 p-3 rounded-xl bg-[#101219] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[#EDEDEF] font-bold">Route Trajectory</span>
            <span className="text-[#8E8EA0] text-[11px] font-mono">
              {isResolved ? 'ON SCENE' : 'ON THE WAY: 14M ETA'}
            </span>
          </div>

          {/* Segmented Progress Track */}
          <div className="relative w-full h-1.5 rounded-full bg-[#1C1F2B] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isResolved
                  ? 'w-full bg-emerald-400'
                  : 'w-3/5 bg-gradient-to-r from-amber-400 to-yellow-500 animate-pulse'
              }`}
            />
          </div>

          {/* Origin & Destination Labels */}
          <div className="flex items-center justify-between text-xs font-sans pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <div>
                <span className="font-bold text-white font-mono text-[11px] mr-1">
                  GND
                </span>
                <span className="text-[#8E8EA0] text-[11px]">
                  Guindy Staging Hub A
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="font-bold text-white font-mono text-[11px] mr-1">
                  P4-APP
                </span>
                <span className="text-[#8E8EA0] text-[11px]">
                  Pier 4 Arterial Bridge
                </span>
                <span className="block text-[9.5px] text-[#71717A] font-mono">
                  {isResolved ? 'PASSED · BARRIER ACTIVE' : 'ETA 14 MIN'}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column (3 cols): Two Sleek Stat Blocks + Action Button */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Stat Block 1: Estimate */}
            <div className="p-2.5 rounded-xl bg-[#101219] border border-white/[0.05] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#8E8EA0] shrink-0">
                <ClockIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#71717A] block">Estimate</span>
                <span className="text-xs font-bold text-white truncate block font-sans">
                  14 MIN
                </span>
              </div>
            </div>

            {/* Stat Block 2: Trust Score */}
            <div className="p-2.5 rounded-xl bg-[#101219] border border-white/[0.05] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#8E8EA0] shrink-0">
                <CardStackIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#71717A] block">Trust Score</span>
                <span className="text-xs font-bold text-white truncate block font-sans">
                  {metrics.trustScore}% Gated
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Demo Action Button */}
          {stage === 'capability_gap' ? (
            <button
              onClick={openCapabilityModal}
              className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Resolve Capability Gap</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          ) : stage === 'idle' ? (
            <button
              onClick={startDemo}
              className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Launch Autonomous Mission</span>
            </button>
          ) : (
            <button
              onClick={stepNext}
              disabled={stage === 'resolved'}
              className="w-full py-1.5 px-3 rounded-lg bg-[#161B26] hover:bg-[#1E2433] border border-white/10 text-white font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <ArrowRightIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advance ({stage.replace('_', ' ').toUpperCase()})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
