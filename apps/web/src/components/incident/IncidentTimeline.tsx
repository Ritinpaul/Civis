'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import { EventSource, IncidentEvent } from '@/types/demo';
import {
  Clock,
  Sparkles,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Network,
  Users,
  CheckCircle2,
  Filter,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SOURCE_ICONS: Record<EventSource, React.ComponentType<{ className?: string }>> = {
  GEMINI: Sparkles,
  ORCHESTRATOR: Cpu,
  TRUST: ShieldCheck,
  GOVERNOS: ShieldAlert,
  A2A: Network,
  WORKFORCE: Users,
  RESULT: CheckCircle2,
};

const SOURCE_COLORS: Record<EventSource, { text: string; bg: string; border: string }> = {
  GEMINI: { text: 'text-indigo', bg: 'bg-indigo-muted', border: 'border-indigo-border' },
  ORCHESTRATOR: { text: 'text-primary', bg: 'bg-surface-3', border: 'border-border-strong' },
  TRUST: { text: 'text-purple', bg: 'bg-purple-muted', border: 'border-purple-border' },
  GOVERNOS: { text: 'text-crimson', bg: 'bg-crimson-muted', border: 'border-crimson-border' },
  A2A: { text: 'text-emerald', bg: 'bg-emerald-muted', border: 'border-emerald-border' },
  WORKFORCE: { text: 'text-emerald', bg: 'bg-emerald-muted', border: 'border-emerald-border' },
  RESULT: { text: 'text-emerald', bg: 'bg-emerald-muted', border: 'border-emerald-border' },
};

export function IncidentTimeline() {
  const { events, incident, metrics } = useDemo();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const filteredEvents = events.filter((e) => {
    if (activeFilter === 'ALL') return true;
    return e.source === activeFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-crimson-muted text-crimson border border-crimson-border">
              ACTIVE INCIDENT TIMELINE
            </span>
            <span className="text-xs font-mono text-primary-muted">
              CASE: {incident.id}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {incident.title}
          </h1>
          <p className="text-sm text-primary-secondary mt-0.5">
            {incident.location} • Source: {incident.source}
          </p>
        </div>

        {/* Counter & Status */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-surface-2 border border-border flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-primary-muted">Total Events</div>
              <div className="text-sm font-mono font-bold text-primary">
                {events.length} Logged
              </div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-lg bg-surface-2 border border-border flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                metrics.activeIncidents > 0
                  ? 'bg-crimson animate-ping'
                  : 'bg-emerald'
              }`}
            />
            <div>
              <div className="text-[10px] font-mono uppercase text-primary-muted">Resolution</div>
              <div
                className={`text-sm font-mono font-bold ${
                  metrics.activeIncidents > 0 ? 'text-crimson' : 'text-emerald'
                }`}
              >
                {metrics.activeIncidents > 0 ? 'IN PROGRESS' : 'MITIGATED'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border text-xs font-mono">
        <span className="text-primary-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['ALL', 'GEMINI', 'ORCHESTRATOR', 'TRUST', 'GOVERNOS', 'A2A', 'WORKFORCE', 'RESULT'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === f
                ? 'bg-indigo text-white font-semibold'
                : 'bg-surface-2 text-primary-secondary hover:text-primary hover:bg-surface-hover border border-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-border">
        {filteredEvents.map((event, idx) => {
          const Icon = SOURCE_ICONS[event.source] || Cpu;
          const colors = SOURCE_COLORS[event.source] || SOURCE_COLORS.ORCHESTRATOR;
          const isExpanded = !!expandedEvents[event.id];

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-surface-1 border flex items-center justify-center ${colors.border}`}
              >
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-xl bg-surface-2/80 border border-border hover:border-border-strong transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {event.source}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {event.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-primary-muted">
                    <span>+{event.timestamp}</span>
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="hover:text-primary p-0.5"
                      title="Inspect event payload"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-primary-secondary leading-relaxed">
                  {event.detail}
                </p>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="p-3 rounded-lg bg-surface-1 border border-border font-mono text-[11px] text-primary-muted space-y-1 mt-2">
                    <div className="flex items-center gap-1 text-primary text-[10px] uppercase tracking-wider mb-1">
                      <Code className="w-3 h-3 text-indigo" />
                      <span>Event Metadata Payload</span>
                    </div>
                    <pre className="text-[10px] text-primary-secondary overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(
                        {
                          id: event.id,
                          source: event.source,
                          status: event.status,
                          incidentId: incident.id,
                          timestampUtc: new Date().toISOString(),
                          securityBoundary: 'GOVERNOS_CONTAINED',
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
