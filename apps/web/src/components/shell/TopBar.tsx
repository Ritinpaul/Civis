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
  Zap,
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
  } = useDemo();

  return (
    <header className="h-14 border-b border-border bg-surface-1/90 backdrop-blur-md px-6 flex items-center justify-between z-10 select-none">
      {/* Status Pills */}
      <div className="flex items-center gap-3">
        {/* Gemini status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-muted border border-indigo-border text-[11px] font-mono text-indigo font-medium">
          <Sparkles className="w-3 h-3 text-indigo" />
          <span>Gemini Pro Multimodal</span>
        </div>

        {/* GovernOS status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-muted border border-purple-border text-[11px] font-mono text-purple font-medium">
          <Activity className="w-3 h-3 text-purple" />
          <span>GovernOS Active</span>
        </div>

        {/* Incident status pill */}
        {metrics.activeIncidents > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson-muted border border-crimson-border text-[11px] font-mono text-crimson font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-crimson" />
            <span>INC-2047 HIGH ALERT</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-muted border border-emerald-border text-[11px] font-mono text-emerald font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald" />
            <span>ALL INCIDENTS RESOLVED</span>
          </div>
        )}
      </div>

      {/* Demo Controls */}
      <div className="flex items-center gap-2">
        {/* Live Denial Interactive Test */}
        <button
          onClick={triggerLiveDenial}
          disabled={liveDenialActive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
            liveDenialActive
              ? 'bg-crimson text-white animate-flash-crimson shadow-lg shadow-crimson-glow'
              : 'bg-surface-3 hover:bg-surface-hover text-primary-secondary hover:text-primary border border-border'
          }`}
          title="Simulate an unauthorized agent data request to verify GovernOS real-time blocking"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-crimson" />
          <span>{liveDenialActive ? 'DENIED BY GOVERNOS' : 'Test Live Denial'}</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Play / Pause */}
        <button
          onClick={isAutoPlaying ? pauseDemo : startDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo hover:bg-indigo/90 text-white text-xs font-semibold shadow-md shadow-indigo-glow transition-colors"
        >
          {isAutoPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{stage === 'idle' ? 'Start Story' : 'Resume'}</span>
            </>
          )}
        </button>

        {/* Next Step */}
        <button
          onClick={stepNext}
          disabled={stage === 'resolved'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-3 hover:bg-surface-hover text-primary border border-border text-xs font-medium transition-colors disabled:opacity-40"
          title="Step forward in 7-chapter narrative"
        >
          <SkipForward className="w-3.5 h-3.5 text-primary-secondary" />
          <span>Step</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetDemo}
          className="p-1.5 rounded-md bg-surface-3 hover:bg-surface-hover text-primary-secondary hover:text-primary border border-border transition-colors"
          title="Reset demo scenario"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Toggle */}
        <div className="flex items-center rounded-md bg-surface-3 border border-border p-0.5 ml-1">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${
                playbackSpeed === spd
                  ? 'bg-surface-1 text-primary shadow-sm font-semibold'
                  : 'text-primary-muted hover:text-primary-secondary'
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
