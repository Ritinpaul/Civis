'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  Clock,
  CreditCard,
  Plane,
  ShieldCheck,
  Truck,
  ArrowRight,
  FileText,
  DollarSign,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface DiagnosticsDockProps {
  selectedSectorId: string;
}

export function DiagnosticsDock({ selectedSectorId }: DiagnosticsDockProps) {
  const { metrics, incident, stage, openCapabilityModal, startDemo, stepNext, setScreen } = useDemo();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Timeline' | 'Documents' | 'Cost' | 'Priority'>('Overview');

  const isCivic = selectedSectorId === 'pier-4';
  const isResolved = metrics.activeIncidents === 0;

  const tabs = ['Overview', 'Timeline', 'Documents', 'Cost', 'Priority'] as const;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-4 shadow-2xl select-none min-h-0 overflow-y-auto font-sans">
      {/* 1. Underline Tabs Header (Matching Reference Image) */}
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
                  else if (tab === 'Documents') setScreen('evaluation');
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

        {/* Action Link */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-[#71717A]">
          <button
            onClick={() => setScreen('workforce')}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Fleet Mesh</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Row (Exact Match to Reference Bottom Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-3 flex-1">
        {/* ── Left Column (4 cols): ID + Status Badge + Vehicle Render + Name ── */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold font-mono text-white tracking-wider">
              {isCivic ? incident.id : 'SF2043892GH'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold border ${
                isCivic
                  ? isResolved
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
              }`}
            >
              {isCivic ? (isResolved ? 'RESOLVED' : 'CRITICAL') : 'IN TRANSIT'}
            </span>
          </div>

          {/* Vehicle Illustration Render Card (Matching the Yellow DHL Airplane in Reference) */}
          <div className="flex items-center gap-4 pt-1">
            {isCivic ? (
              // Civic Emergency 4x4 Ambulance Render
              <div className="w-24 h-12 rounded-xl bg-[#11131A] border border-white/[0.06] flex items-center justify-center p-2 shadow-inner">
                <Truck className="w-8 h-8 text-cyan-400" />
              </div>
            ) : (
              // Sleek Yellow Cargo Plane Illustration (Matching Reference Image)
              <div className="w-32 h-12 rounded-xl bg-[#11131A] border border-white/[0.06] flex items-center justify-center px-3 shadow-inner relative overflow-hidden">
                <svg viewBox="0 0 120 40" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {/* Fuselage */}
                  <path
                    d="M 10 24 L 85 24 Q 105 24 115 21 Q 105 18 85 18 L 10 18 Z"
                    fill="#EAB308"
                  />
                  {/* DHL Red Stripe */}
                  <rect x="25" y="20" width="45" height="3" fill="#DC2626" />
                  {/* Wings */}
                  <path d="M 45 20 L 30 8 L 42 8 L 65 20 Z" fill="#CA8A04" />
                  {/* Tail Fin */}
                  <path d="M 12 18 L 2 6 L 15 6 L 24 18 Z" fill="#EAB308" />
                  <rect x="5" y="8" width="8" height="2" fill="#DC2626" />
                  {/* Cockpit Window */}
                  <path d="M 105 19 L 110 20 L 105 21 Z" fill="#18181B" />
                </svg>
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold text-white truncate font-sans">
                {isCivic ? 'Civic Dispatch / ALS 4x4' : 'DHL / Boeing 777F'}
              </div>
              <div className="text-[10px] font-sans text-[#71717A] truncate mt-0.5">
                {isCivic
                  ? 'Fleet AMB-Z4-04 • Staging Hub A'
                  : 'Flight DH7871 · Reg · D-AALT'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Center Column (5 cols): Route Header + Progress Track + Locations ── */}
        <div className="lg:col-span-5 space-y-2.5 p-3 rounded-xl bg-[#101219] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[#EDEDEF] font-bold">Route</span>
            <span className="text-[#8E8EA0] text-[11px] font-mono">
              {isCivic
                ? isResolved
                  ? 'ON SCENE'
                  : 'ON THE WAY: 14M ETA'
                : 'ON THE WAY: 2D 12H 44M'}
            </span>
          </div>

          {/* Segmented Progress Track (Matching Reference Image) */}
          <div className="relative w-full h-1.5 rounded-full bg-[#1C1F2B] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCivic
                  ? isResolved
                    ? 'w-full bg-emerald-400'
                    : 'w-2/3 bg-gradient-to-r from-amber-400 to-red-500 animate-pulse'
                  : 'w-3/5 bg-gradient-to-r from-white via-yellow-400 to-yellow-500'
              }`}
            />
          </div>

          {/* Origin & Destination Labels with Dots */}
          <div className="flex items-center justify-between text-xs font-sans pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <div>
                <span className="font-bold text-white font-mono text-[11px] mr-1">
                  {isCivic ? 'GND' : 'SIN'}
                </span>
                <span className="text-[#8E8EA0] text-[11px]">
                  {isCivic ? 'Guindy Hub A' : 'Singapore, Singapore'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="font-bold text-white font-mono text-[11px] mr-1">
                  {isCivic ? 'P4-APP' : 'LAX'}
                </span>
                <span className="text-[#8E8EA0] text-[11px]">
                  {isCivic ? 'Pier 4 Bridge' : 'Los Angeles, USA'}
                </span>
                <span className="block text-[9.5px] text-[#71717A] font-mono">
                  {isCivic ? 'ETA 14 MIN' : 'ETA DEC 22, 2024'}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            </div>
          </div>
        </div>

        {/* ── Right Column (3 cols): Two Sleek Stat Blocks (Matching Reference) ── */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Stat Block 1: Estimate */}
            <div className="p-2.5 rounded-xl bg-[#101219] border border-white/[0.05] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#8E8EA0] shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#71717A] block">Estimate</span>
                <span className="text-xs font-bold text-white truncate block font-sans">
                  {isCivic ? '14 MIN' : 'OCT 15, 2024'}
                </span>
              </div>
            </div>

            {/* Stat Block 2: Total cost / Trust */}
            <div className="p-2.5 rounded-xl bg-[#101219] border border-white/[0.05] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#8E8EA0] shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#71717A] block">
                  {isCivic ? 'Trust Score' : 'Total cost'}
                </span>
                <span className="text-xs font-bold text-white truncate block font-sans">
                  {isCivic ? `${metrics.trustScore}% Gated` : '$12,590'}
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
              <ArrowRight className="w-3.5 h-3.5" />
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
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advance ({stage.replace('_', ' ').toUpperCase()})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
