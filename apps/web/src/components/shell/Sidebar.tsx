'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  LayoutDashboard,
  Clock,
  Network,
  ShieldCheck,
  Lock,
  TrendingUp,
  Radio,
  Settings,
  Headphones,
} from 'lucide-react';

interface NavItem {
  id: 'command' | 'timeline' | 'workforce' | 'evaluation' | 'authority' | 'growth';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  hasDot?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, hasDot: true },
  { id: 'timeline', label: 'Live Timeline', icon: Clock, badge: 'LIVE' },
  { id: 'workforce', label: 'Workforce Mesh', icon: Network },
  { id: 'evaluation', label: 'Evaluation Panel', icon: ShieldCheck },
  { id: 'authority', label: 'GovernOS Matrix', icon: Lock },
  { id: 'growth', label: 'Workforce Growth', icon: TrendingUp },
];

export function Sidebar() {
  const { activeScreen, setScreen, metrics } = useDemo();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const hasCriticalIncident = metrics.activeIncidents > 0;

  return (
    <aside className="w-16 h-screen border-r border-white/[0.08] bg-[#07080B] flex flex-col justify-between items-center py-3.5 select-none z-30 shrink-0">
      {/* Top Brand Logo: Cyan Squircle matching Reference Image */}
      <div className="flex flex-col items-center gap-6 w-full">
        <button
          onClick={() => setScreen('command')}
          className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform"
          title="AgentVerse CIVIS Operations Core"
        >
          <Radio className="w-4 h-4 animate-pulse" />
        </button>

        {/* Vertical Icon Rail */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            const showIncidentBadge = item.id === 'command' && hasCriticalIncident;

            return (
              <div
                key={item.id}
                className="relative group w-full flex justify-center"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => setScreen(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-[#181C26] text-white border border-white/20 shadow-md shadow-black/50'
                      : 'text-[#71717A] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
                  }`}
                  aria-label={item.label}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-[#71717A] group-hover:text-white'
                    }`}
                  />

                  {/* Active Indicator Bar on left edge */}
                  {isActive && (
                    <span className="absolute left-[-8px] top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
                  )}

                  {/* Notification Dot / Badge on Command Center icon (matching reference red badge) */}
                  {showIncidentBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson border-2 border-[#07080B] animate-ping" />
                  )}
                  {showIncidentBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson border-2 border-[#07080B]" />
                  )}

                  {item.badge && !showIncidentBadge && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded text-[7px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip Pill on Hover */}
                {hoveredItem === item.id && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#141722] border border-white/15 text-white text-[11px] font-mono whitespace-nowrap shadow-2xl z-50 pointer-events-none flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-[9px] text-cyan-400 uppercase font-bold">• Active</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Icons & Operator Profile (Matching Reference Image) */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Settings Button */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="System Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Support / Help Button */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Emergency Dispatch Protocol Docs"
        >
          <Headphones className="w-4 h-4" />
        </button>

        {/* Operator Profile Avatar with Green Online Dot */}
        <div className="relative mt-1 cursor-pointer group" title="Civic Dispatcher (Node CHN-01) — Online">
          <div className="w-8 h-8 rounded-full bg-[#181C26] border border-white/20 flex items-center justify-center text-[11px] font-mono text-cyan-400 font-bold shadow-inner">
            C
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#07080B]" />
        </div>
      </div>
    </aside>
  );
}
