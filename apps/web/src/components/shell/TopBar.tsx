'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldAlert,
  Activity,
  Sparkles,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export function TopBar() {
  const {
    stage,
    isAutoPlaying,
    playbackSpeed,
    startDemo,
    pauseDemo,
    resetDemo,
    stepNext,
    setSpeed,
    triggerLiveDenial,
    liveDenialActive,
    metrics,
    activeScreen,
  } = useDemo();

  const screenTitles: Record<string, string> = {
    command: 'Command Center',
    timeline: 'Live Provenance Timeline',
    workforce: 'Workforce Mesh & Delegation',
    evaluation: 'GovernOS Evaluation Matrix',
    authority: 'Authority & Policy Enforcement',
    growth: 'Workforce Growth Registry',
  };

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#07080B] px-5 flex items-center justify-between z-20 select-none shrink-0 gap-4">
      {/* Left: Screen Title & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-bold text-[#EDEDEF] tracking-tight font-mono">
          {screenTitles[activeScreen] || 'Command Center'}
        </h1>
      </div>

      {/* Center: Global Search Bar (Matching Reference Header Search) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
        <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search sectors, incidents, or policies..."
          className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-[#0F1219] border border-white/[0.08] text-xs text-[#EDEDEF] placeholder-[#52525B] focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono text-[#52525B] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          ⌘K
        </span>
      </div>

      {/* Right: Operational Status Pills & Mission Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Gemini status pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10.5px] font-mono text-indigo-400 font-semibold">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Gemini Pro</span>
        </div>

        {/* GovernOS status pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10.5px] font-mono text-purple-400 font-semibold">
          <Activity className="w-3 h-3 text-purple-400" />
          <span>GovernOS</span>
        </div>

        {/* Incident status pill */}
        {metrics.activeIncidents > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-[10.5px] font-mono text-crimson font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
            <span>INC-2047 CRITICAL</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10.5px] font-mono text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>RESOLVED</span>
          </div>
        )}

        <div className="h-4 w-px bg-white/[0.08] mx-0.5 hidden sm:block" />

        {/* Live Denial Interactive Test Button */}
        <button
          onClick={triggerLiveDenial}
          disabled={liveDenialActive}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
            liveDenialActive
              ? 'bg-crimson text-white shadow-md shadow-crimson/40'
              : 'bg-[#11141D] hover:bg-[#181C26] text-[#8E8EA0] hover:text-white border border-white/[0.08]'
          }`}
          title="Simulate an unauthorized agent data request to verify GovernOS real-time blocking"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-crimson" />
          <span className="text-[11px]">{liveDenialActive ? 'DENIED' : 'Test Live Denial'}</span>
        </button>

        {/* Play / Pause / Start Story (Cyan CTA matching reference + Add button) */}
        <button
          onClick={isAutoPlaying ? pauseDemo : startDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
        >
          {isAutoPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{stage === 'idle' ? 'Start Story' : 'Resume'}</span>
            </>
          )}
        </button>

        {/* Next Step */}
        <button
          onClick={stepNext}
          disabled={stage === 'resolved'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#11141D] hover:bg-[#181C26] text-[#EDEDEF] border border-white/[0.08] text-xs font-mono font-medium transition-colors disabled:opacity-40"
          title="Step forward in narrative"
        >
          <SkipForward className="w-3.5 h-3.5 text-[#8E8EA0]" />
          <span className="text-[11px] hidden sm:inline">Step</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetDemo}
          className="p-1.5 rounded-lg bg-[#11141D] hover:bg-[#181C26] text-[#8E8EA0] hover:text-white border border-white/[0.08] transition-colors"
          title="Reset demo scenario"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Toggle (Segmented Controller) */}
        <div className="hidden sm:flex items-center rounded-lg bg-[#11141D] border border-white/[0.08] p-0.5">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md transition-colors ${
                playbackSpeed === spd
                  ? 'bg-[#1C212E] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#EDEDEF]'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
