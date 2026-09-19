'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  LayoutDashboard,
  Clock,
  Network,
  ShieldCheck,
  Lock,
  TrendingUp,
  Cpu,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: 'command' | 'timeline' | 'workforce' | 'evaluation' | 'authority' | 'growth';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'timeline', label: 'Live Timeline', icon: Clock, badge: 'LIVE' },
  { id: 'workforce', label: 'Workforce Mesh', icon: Network },
  { id: 'evaluation', label: 'Evaluation Panel', icon: ShieldCheck },
  { id: 'authority', label: 'GovernOS Matrix', icon: Lock },
  { id: 'growth', label: 'Workforce Growth', icon: TrendingUp },
];

const STAGE_LABELS: Record<string, string> = {
  idle: '1. Standby',
  incident_detected: '2. Incident Detected',
  investigating: '3. Strategic Analysis',
  capability_gap: '4. Capability Gap Found',
  evaluating: '5. Battery Ingestion',
  evaluation_failed: '6. GovernOS Blocked',
  repairing: '7. Automated Repair',
  verified: '8. Cryptographically Verified',
  joining_workforce: '9. Joining Workforce Mesh',
  resolved: '10. Mission Mitigated',
};

export function Sidebar() {
  const { activeScreen, setScreen, stage } = useDemo();

  return (
    <aside className="w-64 border-r border-border bg-surface-1 flex flex-col justify-between select-none z-20">
      <div>
        {/* Workspace Brand / Identity */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo to-purple flex items-center justify-center text-white shadow-lg shadow-indigo-glow">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              AGENTVERSE
            </span>
            <span className="text-[10px] font-mono text-primary-muted tracking-tight">
              CIVIS KERNEL V2.6
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-primary-muted font-medium">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-3 text-primary border border-border-strong font-semibold'
                    : 'text-primary-secondary hover:text-primary hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo' : 'text-primary-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-crimson-muted text-crimson border border-crimson-border animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chapter Progress Tracker */}
      <div className="p-3 border-t border-border bg-surface-2/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary-muted">
            Story Stage
          </span>
          <span className="text-[10px] font-mono text-emerald font-semibold">
            {stage === 'resolved' ? 'COMPLETE' : 'ACTIVE'}
          </span>
        </div>
        <div className="p-2.5 rounded-md bg-surface-3 border border-border text-xs">
          <div className="flex items-center gap-2 text-primary font-medium text-[11px]">
            <div className="w-2 h-2 rounded-full bg-indigo animate-ping" />
            <span className="truncate">{STAGE_LABELS[stage] || stage}</span>
          </div>
          <div className="mt-2 w-full bg-surface-1 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo via-purple to-emerald h-full transition-all duration-500 ease-out"
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
    </aside>
  );
}
