'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Droplets,
  Truck,
  Waves,
  Zap,
  Bot,
  MoreVertical,
} from 'lucide-react';

interface SectorQueueProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

export function SectorQueue({ selectedSectorId, onSelectSector }: SectorQueueProps) {
  const { metrics, incident } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'hazard' | 'pumps' | 'dispatch'>('all');

  const isResolved = metrics.activeIncidents === 0;

  const sectors = [
    {
      id: 'pier-4',
      code: incident.id,
      title: incident.title,
      category: 'hazard' as const,
      severity: isResolved ? 'RESOLVED' : 'CRITICAL',
      originCode: 'P4-APP',
      origin: 'Pier 4 Approach',
      destCode: 'W7-ART',
      destination: 'Ward 7 Arterial',
      telemetry: isResolved ? 'Water Crest Mitigated • Diversion Active' : 'Water: 68cm • Velocity: 1.8 m/s',
      timestamp: 'Just now',
      source: 'Gemini Vision',
      sourceIcon: Bot,
      sourceColor: 'text-indigo-400',
    },
    {
      id: 'saidapet-pump',
      code: 'INFRA-PUMP-02',
      title: 'Saidapet Stormwater Pumping Stations',
      category: 'pumps' as const,
      severity: 'OVERLOAD 124%',
      originCode: 'SDP-CNL',
      origin: 'Saidapet Canal Outfall',
      destCode: 'ADY-BSN',
      destination: 'Adyar River Basin',
      telemetry: 'Station #1 & #2 at 12,000 LPM • Gen Active',
      timestamp: '2m ago',
      source: 'Drainage Telemetry',
      sourceIcon: Waves,
      sourceColor: 'text-cyan-400',
    },
    {
      id: 'kathipara-gate',
      code: 'TRAF-DIVER-01',
      title: 'Kathipara / Mount Road Traffic Diversion',
      category: 'hazard' as const,
      severity: 'HARD BARRIER',
      originCode: 'MNT-RD',
      origin: 'Mount Road / Anna Salai',
      destCode: 'IRR-BYP',
      destination: 'Inner Ring Road Bypass',
      telemetry: 'Civilian sedans barred • Detour enabled',
      timestamp: '4m ago',
      source: 'Traffic Agent',
      sourceIcon: Zap,
      sourceColor: 'text-amber-400',
    },
    {
      id: 'guindy-hub',
      code: 'RESCUE-STAGING-A',
      title: 'Guindy Race Course Staging Hub A',
      category: 'dispatch' as const,
      severity: isResolved ? 'DEPLOYED' : 'READY',
      originCode: 'GND-STG',
      origin: 'Guindy Hub A',
      destCode: 'SDP-RIV',
      destination: 'Saidapet Riverside (120 Homes)',
      telemetry: '4 ALS 4x4 Ambulances • 3 Boats • 14m ETA',
      timestamp: '1m ago',
      source: 'Emergency Agent',
      sourceIcon: Truck,
      sourceColor: 'text-emerald-400',
    },
    {
      id: 'velachery-outfall',
      code: 'INFRA-CANAL-04',
      title: 'Velachery Canal & Lake Outfall',
      category: 'pumps' as const,
      severity: 'BACKFLOW RISK',
      originCode: 'VLC-CNL',
      origin: 'Velachery Canal Outfall',
      destCode: 'ADY-STH',
      destination: 'Adyar South Bank',
      telemetry: 'Sluice Gates 80% • High Tide Monitor',
      timestamp: '3m ago',
      source: 'Canal Telemetry',
      sourceIcon: Droplets,
      sourceColor: 'text-cyan-400',
    },
  ];

  const filteredSectors = sectors.filter((sec) => {
    if (activeCategory !== 'all' && sec.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.code.toLowerCase().includes(q) ||
        sec.telemetry.toLowerCase().includes(q) ||
        sec.origin.toLowerCase().includes(q) ||
        sec.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 h-full flex flex-col bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-3.5 space-y-3 shadow-2xl select-none min-h-0">
      {/* Header (Matching Reference Tracking List Header) */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#EDEDEF] tracking-tight font-mono">
            Municipal Sectors
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#151923] text-[#8E8EA0] border border-white/[0.08]">
            {filteredSectors.length} units
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#71717A]">
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input with ⌘K badge */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sector, corridor, sensor..."
          className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-[#12151F] border border-white/[0.08] text-xs text-[#EDEDEF] placeholder-[#52525B] focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono text-[#52525B] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          ⌘K
        </span>
      </div>

      {/* Category Filter Pills (Exact styling match to Reference: Active is solid white pill with bold black text) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono scrollbar-none shrink-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-lg text-xs transition-all ${
            activeCategory === 'all'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#12151F] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          All Sectors
        </button>
        <button
          onClick={() => setActiveCategory('hazard')}
          className={`px-3 py-1 rounded-lg text-xs transition-all ${
            activeCategory === 'hazard'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#12151F] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Hazards
        </button>
        <button
          onClick={() => setActiveCategory('pumps')}
          className={`px-3 py-1 rounded-lg text-xs transition-all ${
            activeCategory === 'pumps'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#12151F] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Drainage
        </button>
        <button
          onClick={() => setActiveCategory('dispatch')}
          className={`px-3 py-1 rounded-lg text-xs transition-all ${
            activeCategory === 'dispatch'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#12151F] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Units
        </button>
      </div>

      {/* Sector Card List (Flex-1 scrollable with custom slim scrollbar) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin min-h-0">
        {filteredSectors.map((sector) => {
          const isSelected = selectedSectorId === sector.id;
          const SourceIcon = sector.sourceIcon;

          // Status badge styles matching reference's dark pill badges
          let badgeStyle = 'bg-[#171B26] text-[#A1A1AA] border-white/10';
          if (sector.severity === 'CRITICAL') {
            badgeStyle = 'bg-crimson/15 text-crimson border-crimson/30 animate-pulse font-bold';
          } else if (sector.severity === 'RESOLVED' || sector.severity === 'DEPLOYED' || sector.severity === 'READY') {
            badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold';
          } else if (sector.severity.includes('OVERLOAD') || sector.severity === 'HARD BARRIER' || sector.severity === 'BACKFLOW RISK') {
            badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold';
          }

          return (
            <div
              key={sector.id}
              onClick={() => onSelectSector(sector.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-[#151924] border-cyan-400/50 shadow-xl shadow-cyan-500/10'
                  : 'bg-[#0E1119] border-white/[0.06] hover:border-white/15 hover:bg-[#121622]'
              }`}
            >
              {/* 1. Top Row: Code + Pill Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#EDEDEF] tracking-wider">
                  {sector.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${badgeStyle}`}>
                  {sector.severity}
                </span>
              </div>

              {/* 2. Trajectory Visual Row (Reference: origin ···· ➔ ···· dest) */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] mb-1">
                  <span className="font-bold text-[#A1A1AA]">{sector.originCode}</span>
                  <div className="flex-1 mx-3 flex items-center justify-center relative">
                    <div className="w-full h-px border-t border-dashed border-white/20" />
                    <div className="absolute px-1.5 py-0.2 bg-[#0E1119] rounded text-[8px] font-mono text-[#71717A] border border-white/10 flex items-center gap-1">
                      <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                  </div>
                  <span className="font-bold text-[#A1A1AA]">{sector.destCode}</span>
                </div>

                {/* Subtitle location names */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="truncate max-w-[140px] text-[#8E8EA0] font-medium">
                    {sector.origin}
                  </span>
                  <span className="truncate max-w-[140px] text-[#EDEDEF] text-right font-medium">
                    {sector.destination}
                  </span>
                </div>
              </div>

              {/* 3. Title & Telemetry Metrics */}
              <div className="pt-1 border-t border-white/[0.05] space-y-1">
                <h4 className="text-[11.5px] font-bold text-[#EDEDEF] leading-snug truncate">
                  {sector.title}
                </h4>
                <div className="text-[10px] font-mono text-[#8E8EA0] truncate">
                  {sector.telemetry}
                </div>
              </div>

              {/* 4. Bottom Line: Source Agent Icon + Timestamp */}
              <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 text-[#52525B] border-t border-white/[0.03]">
                <div className="flex items-center gap-1.5">
                  <SourceIcon className={`w-3 h-3 ${sector.sourceColor}`} />
                  <span className={sector.sourceColor}>{sector.source}</span>
                </div>
                <span>{sector.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
