'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  Search,
  Bell,
  User,
  Plus,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldAlert,
} from 'lucide-react';

export function TopBar() {
  const {
    stage,
    isAutoPlaying,
    startDemo,
    pauseDemo,
    resetDemo,
    stepNext,
    triggerLiveDenial,
    liveDenialActive,
    activeScreen,
  } = useDemo();

  const screenTitles: Record<string, string> = {
    command: 'Tracking',
    timeline: 'Timeline',
    workforce: 'Workforce',
    evaluation: 'Evaluation',
    authority: 'Authority',
    growth: 'Growth',
  };

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#07080B] px-6 flex items-center justify-between z-20 select-none shrink-0 gap-6">
      {/* Left: Clean Page Title (Matching Reference: "Tracking") */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-base font-bold text-[#EDEDEF] tracking-tight font-sans">
          {screenTitles[activeScreen] || 'Tracking'}
        </h1>
      </div>

      {/* Center: Wide Pill Search Bar (Matching Reference) */}
      <div className="flex-1 max-w-xl relative">
        <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search shipments, clients, or invoices..."
          className="w-full pl-10 pr-12 py-2 rounded-full bg-[#11131A] border border-white/[0.08] text-xs text-[#EDEDEF] placeholder-[#52525B] focus:outline-none focus:border-cyan-500/50 transition-all font-sans"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#52525B] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          ⌘K
        </span>
      </div>

      {/* Right: Notification Bell, Profile, and Cyan Primary Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Subtle Demo Controls (Play/Step/Reset) */}
        <div className="hidden lg:flex items-center gap-1.5 mr-1 border-r border-white/[0.08] pr-3">
          <button
            onClick={stepNext}
            disabled={stage === 'resolved'}
            className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-30"
            title="Step forward in story"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={resetDemo}
            className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/[0.04] transition-colors"
            title="Reset scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={triggerLiveDenial}
            disabled={liveDenialActive}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
              liveDenialActive
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-[#8E8EA0] hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Simulate GovernOS Live Policy Denial"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 inline mr-1" />
            <span>{liveDenialActive ? 'DENIED' : 'Test Denial'}</span>
          </button>
        </div>

        {/* Bell Icon with Red Notification Badge (Matching Reference: "5") */}
        <button
          className="relative p-2 rounded-full text-[#8E8EA0] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="5 unread notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8.5px] font-bold flex items-center justify-center border border-[#07080B]">
            5
          </span>
        </button>

        {/* User / Settings Icon */}
        <button
          className="p-2 rounded-full text-[#8E8EA0] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Account Profile"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Cyan Pill Button (Matching Reference: "+ Add") */}
        <button
          onClick={isAutoPlaying ? pauseDemo : startDemo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold shadow-md shadow-cyan-500/25 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isAutoPlaying ? 'Pause' : stage === 'idle' ? 'Add' : 'Resume'}</span>
        </button>
      </div>
    </header>
  );
}
