'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import { EventSource } from '@/types/demo';
import {
  ClockIcon,
  CubeIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  GlobeIcon,
  PersonIcon,
  MixerHorizontalIcon,
  CodeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TargetIcon,
} from '@radix-ui/react-icons';

const SOURCE_ICONS: Record<EventSource, React.ComponentType<{ className?: string }>> = {
  GEMINI: TargetIcon,
  ORCHESTRATOR: CubeIcon,
  TRUST: CheckCircledIcon,
  GOVERNOS: ExclamationTriangleIcon,
  A2A: GlobeIcon,
  WORKFORCE: PersonIcon,
  RESULT: CheckCircledIcon,
};

const SOURCE_COLORS: Record<EventSource, { text: string; bg: string; border: string }> = {
  GEMINI: { text: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  ORCHESTRATOR: { text: 'text-[#EDEDEF]', bg: 'bg-[#181C26]', border: 'border-white/15' },
  TRUST: { text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  GOVERNOS: { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  A2A: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  WORKFORCE: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  RESULT: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-red-500/15 text-red-400 border border-red-500/30">
              ACTIVE INCIDENT TIMELINE
            </span>
            <span className="text-xs font-mono text-[#71717A]">
              CASE: {incident.id}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {incident.title}
          </h1>
          <p className="text-sm text-[#8E8EA0] mt-0.5">
            {incident.location} • Source: {incident.source}
          </p>
        </div>

        {/* Counter & Status */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-[#0E1119] border border-white/[0.08] flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#71717A]">Total Events</div>
              <div className="text-sm font-mono font-bold text-white">
                {events.length} Logged
              </div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#0E1119] border border-white/[0.08] flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                metrics.activeIncidents > 0
                  ? 'bg-red-500 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#71717A]">Resolution</div>
              <div
                className={`text-sm font-mono font-bold ${
                  metrics.activeIncidents > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {metrics.activeIncidents > 0 ? 'IN PROGRESS' : 'MITIGATED'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.06] text-xs font-sans">
        <span className="text-[#71717A] flex items-center gap-1 mr-1 text-xs">
          <MixerHorizontalIcon className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['ALL', 'GEMINI', 'ORCHESTRATOR', 'TRUST', 'GOVERNOS', 'A2A', 'WORKFORCE', 'RESULT'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeFilter === f
                ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                : 'bg-[#0E1119] text-[#8E8EA0] hover:text-white border border-white/[0.06]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-white/[0.08]">
        {filteredEvents.map((event) => {
          const Icon = SOURCE_ICONS[event.source] || CubeIcon;
          const colors = SOURCE_COLORS[event.source] || SOURCE_COLORS.ORCHESTRATOR;
          const isExpanded = !!expandedEvents[event.id];

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-[#080A0F] border flex items-center justify-center ${colors.border}`}
              >
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-[#0E1119] border border-white/[0.06] hover:border-white/15 transition-all space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {event.source}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {event.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-[#71717A]">
                    <span>+{event.timestamp}</span>
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="hover:text-white p-0.5"
                      title="Inspect event payload"
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#8E8EA0] leading-relaxed">
                  {event.detail}
                </p>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="p-3 rounded-xl bg-[#080A0F] border border-white/[0.06] font-mono text-[11px] text-[#71717A] space-y-1 mt-2">
                    <div className="flex items-center gap-1 text-white text-[10px] uppercase tracking-wider mb-1">
                      <CodeIcon className="w-3 h-3 text-indigo-400" />
                      <span>Event Metadata Payload</span>
                    </div>
                    <pre className="text-[10px] text-[#A1A1AA] overflow-x-auto whitespace-pre-wrap">
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
