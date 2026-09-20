'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  BellIcon,
  DrawingPinIcon,
  CubeIcon,
  LightningBoltIcon,
  GlobeIcon,
  ActivityLogIcon,
  FileTextIcon,
  PersonIcon,
  CalendarIcon,
  CardStackIcon,
  GearIcon,
  TargetIcon,
} from '@radix-ui/react-icons';

export function Sidebar() {
  const { activeScreen, setScreen, metrics } = useDemo();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  const hasCriticalIncident = metrics.activeIncidents > 0;

  const railNavItems = [
    { id: 'alerts', icon: BellIcon, label: 'Active Alerts', hasDot: hasCriticalIncident },
    { id: 'sectors', icon: TargetIcon, label: 'Sector Grid' },
    { id: 'command', icon: CubeIcon, label: 'Operations & Tracking', isPrimaryActive: activeScreen === 'command' },
    { id: 'workforce', icon: LightningBoltIcon, label: 'Swarm Fleet Mesh', isPrimaryActive: activeScreen === 'workforce' },
    { id: 'mesh', icon: GlobeIcon, label: 'A2A Network' },
    { id: 'analytics', icon: ActivityLogIcon, label: 'Telemetry & Growth', isPrimaryActive: activeScreen === 'growth' },
    { id: 'evaluation', icon: FileTextIcon, label: 'GovernOS Evaluation', isPrimaryActive: activeScreen === 'evaluation' },
    { id: 'team', icon: PersonIcon, label: 'Autonomous Agents' },
    { id: 'timeline', icon: CalendarIcon, label: 'Incident Timeline', isPrimaryActive: activeScreen === 'timeline' },
  ];

  return (
    <aside className="w-[60px] h-screen border-r border-white/[0.08] bg-[#07080B] flex flex-col justify-between items-center py-3 select-none z-30 shrink-0">
      {/* Top Section: Brand Logo + Primary Rail */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand Icon: Distinctive Cyan Squircle with inner ring */}
        <button
          onClick={() => setScreen('command')}
          className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black shadow-md shadow-cyan-500/30 hover:scale-105 transition-transform group"
          title="CIVIS Command Core"
        >
          <div className="w-3.5 h-3.5 rounded-sm border-2 border-black flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-black" />
          </div>
        </button>

        {/* Vertical Icon Rail */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {railNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isPrimaryActive;

            return (
              <div
                key={item.id}
                className="relative group w-full flex justify-center"
                onMouseEnter={() => setHoveredIndex(item.id)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  onClick={() => {
                    if (item.id === 'command') setScreen('command');
                    else if (item.id === 'workforce') setScreen('workforce');
                    else if (item.id === 'analytics') setScreen('growth');
                    else if (item.id === 'evaluation') setScreen('evaluation');
                    else if (item.id === 'timeline') setScreen('timeline');
                    else setScreen('command');
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                      : 'text-[#71717A] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8E8EA0] group-hover:text-white'}`} />

                  {/* Red Notification Dot */}
                  {item.hasDot && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#07080B]" />
                  )}
                </button>

                {/* Floating Tooltip */}
                {hoveredIndex === item.id && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#161922] border border-white/15 text-white text-[11px] font-sans whitespace-nowrap shadow-2xl z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Rail */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="w-7 h-px bg-white/[0.08] mb-1" />

        {/* Capacity / Token Balance */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Compute Capacity"
        >
          <CardStackIcon className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="System Settings"
        >
          <GearIcon className="w-4 h-4" />
        </button>

        {/* Operator Profile Avatar */}
        <div className="relative mt-1 cursor-pointer group" title="Civic Controller: CHN-01 (Active)">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/20 flex items-center justify-center text-[10px] font-sans text-cyan-400 font-bold overflow-hidden shadow-inner">
            <span className="text-white font-medium text-xs">C1</span>
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#07080B]" />
        </div>
      </div>
    </aside>
  );
}
