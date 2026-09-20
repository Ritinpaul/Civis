'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  DotsVerticalIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CubeIcon,
  LayersIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons';

interface SectorQueueProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

export interface UnitItem {
  id: string;
  code: string;
  status: 'CRITICAL' | 'IN TRANSIT' | 'ACTIVE' | 'OVERLOAD' | 'STANDBY' | 'RESOLVED' | 'VERIFIED' | 'EVALUATING';
  statusColor: 'crimson' | 'blue' | 'amber' | 'emerald';
  originCode: string;
  destCode: string;
  duration: string;
  originName: string;
  destName: string;
  carrier: string;
  carrierBadgeColor: string;
  eta: string;
  category: 'hazard' | 'drainage' | 'dispatch' | 'governos';
}

export function SectorQueue({ selectedSectorId, onSelectSector }: SectorQueueProps) {
  const { metrics, incident, stage } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'hazard' | 'drainage' | 'dispatch' | 'governos'>('all');

  const isResolved = metrics.activeIncidents === 0;
  const isSpecialistVerified = stage === 'verified' || stage === 'joining_workforce' || stage === 'resolved';

  const units: UnitItem[] = [
    {
      id: 'pier-4',
      code: incident.id,
      status: isResolved ? 'RESOLVED' : 'CRITICAL',
      statusColor: isResolved ? 'emerald' : 'crimson',
      originCode: 'GND',
      destCode: 'P4-APP',
      duration: '14M',
      originName: 'Guindy Staging Hub A',
      destName: 'Pier 4 Arterial Bridge',
      carrier: 'Gemini Vision Sensor CAM-18',
      carrierBadgeColor: 'bg-red-500',
      eta: isResolved ? 'Passable · Barrier Active' : 'Water: 68cm · 1.8 m/s',
      category: 'hazard',
    },
    {
      id: 'amb-z4',
      code: 'AMB-Z4-04',
      status: isResolved ? 'RESOLVED' : 'IN TRANSIT',
      statusColor: isResolved ? 'emerald' : 'blue',
      originCode: 'GND',
      destCode: 'SDP',
      duration: '12M',
      originName: 'Guindy Staging Hub A',
      destName: 'Saidapet Riverside',
      carrier: 'Emergency Dispatch · ALS 4x4 Fleet',
      carrierBadgeColor: 'bg-yellow-500',
      eta: 'ETA 12 MIN',
      category: 'dispatch',
    },
    {
      id: 'pump-sdp',
      code: 'PUMP-SDP-01',
      status: 'OVERLOAD',
      statusColor: 'amber',
      originCode: 'SDP-CNL',
      destCode: 'ADY-BSN',
      duration: '24/7',
      originName: 'Saidapet Canal Outfall',
      destName: 'Adyar River Basin',
      carrier: 'Drainage Telemetry · 12,000 LPM',
      carrierBadgeColor: 'bg-cyan-500',
      eta: 'Overload 124% · Gen Active',
      category: 'drainage',
    },
    {
      id: 'gate-kth',
      code: 'GATE-KTH-02',
      status: 'ACTIVE',
      statusColor: 'blue',
      originCode: 'MNT-RD',
      destCode: 'IRR-BYP',
      duration: '18M',
      originName: 'Mount Road / Anna Salai',
      destName: 'Inner Ring Road Bypass',
      carrier: 'Traffic Agent · Hard Barrier Diversion',
      carrierBadgeColor: 'bg-amber-600',
      eta: 'Sedans Barred · Detour Live',
      category: 'dispatch',
    },
    {
      id: 'outf-vlc',
      code: 'OUTF-VLC-04',
      status: 'STANDBY',
      statusColor: 'amber',
      originCode: 'VLC-CNL',
      destCode: 'ADY-STH',
      duration: 'TIDE',
      originName: 'Velachery Canal Outfall',
      destName: 'Adyar South Bank',
      carrier: 'Canal Sluice Controller · High Tide Sluice',
      carrierBadgeColor: 'bg-indigo-500',
      eta: 'Gates 80% · Backflow Guard',
      category: 'drainage',
    },
    {
      id: 'agent-pass',
      code: 'AGENT-PASSAGE-01',
      status: isSpecialistVerified ? 'VERIFIED' : 'EVALUATING',
      statusColor: isSpecialistVerified ? 'emerald' : 'amber',
      originCode: 'FORGE',
      destCode: 'MESH',
      duration: 'T01-T07',
      originName: 'Adaptation Forge Engine',
      destName: 'A2A Workforce Mesh',
      carrier: 'GovernOS Sentinel · Battery BAT-2026',
      carrierBadgeColor: 'bg-purple-500',
      eta: isSpecialistVerified ? '100% Policy Sealed' : 'Battery Execution',
      category: 'governos',
    },
  ];

  const filtered = units.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.originName.toLowerCase().includes(q) ||
        item.destName.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full lg:w-[390px] xl:w-[410px] shrink-0 h-full flex flex-col bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-3.5 space-y-3 shadow-2xl select-none min-h-0 font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#EDEDEF] tracking-tight">
            Tracking list
          </h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#141620] text-[#8E8EA0] border border-white/[0.06]">
            <CubeIcon className="w-3 h-3 text-[#71717A]" />
            <span>{filtered.length} units</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#71717A]">
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <MixerHorizontalIcon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <DotsVerticalIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Search Input with ⌘K badge */}
      <div className="relative shrink-0">
        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search unit, sector, corridor, agent..."
          className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-[#11131A] border border-white/[0.08] text-xs text-[#EDEDEF] placeholder-[#52525B] focus:outline-none focus:border-cyan-500/50 transition-all font-sans"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono text-[#52525B] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          ⌘K
        </span>
      </div>

      {/* 3. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none shrink-0 font-sans">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          All Units
        </button>
        <button
          onClick={() => setActiveTab('hazard')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'hazard'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Hazards
        </button>
        <button
          onClick={() => setActiveTab('drainage')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'drainage'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Drainage
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'dispatch'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          Dispatch
        </button>
        <button
          onClick={() => setActiveTab('governos')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'governos'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          GovernOS
        </button>
      </div>

      {/* 4. Unit Card List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin min-h-0">
        {filtered.map((item) => {
          const isSelected = selectedSectorId === item.id;

          let badgeClass = 'bg-[#181B26] text-[#A1A1AA] border-white/10';
          if (item.statusColor === 'amber') {
            badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          } else if (item.statusColor === 'blue') {
            badgeClass = 'bg-blue-500/15 text-blue-400 border-blue-500/25';
          } else if (item.statusColor === 'emerald') {
            badgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
          } else if (item.statusColor === 'crimson') {
            badgeClass = 'bg-red-500/15 text-red-400 border-red-500/25';
          }

          return (
            <div
              key={item.id}
              onClick={() => onSelectSector(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-[#141620] border-white/20 shadow-xl shadow-black/40'
                  : 'bg-[#0E1017] border-white/[0.05] hover:border-white/15 hover:bg-[#11131B]'
              }`}
            >
              {/* Row 1: Code + Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EDEDEF] tracking-wider font-mono">
                  {item.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${badgeClass}`}>
                  {item.status}
                </span>
              </div>

              {/* Row 2: Trajectory Line (origin ····· duration ····· dest) */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                  <span className="font-bold text-[#A1A1AA]">{item.originCode}</span>
                  <div className="flex-1 mx-3 flex items-center justify-center relative">
                    <div className="w-full h-px border-t border-dotted border-white/20" />
                    <div className="absolute px-2 py-0.2 bg-[#11131A] rounded text-[8.5px] font-mono text-[#71717A] border border-white/10 flex items-center gap-1">
                      <span>{item.duration}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#A1A1AA]">{item.destCode}</span>
                </div>

                {/* Subtitle Sector Names */}
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[145px] text-[#8E8EA0]">
                    {item.originName}
                  </span>
                  <span className="truncate max-w-[145px] text-[#EDEDEF] text-right font-medium">
                    {item.destName}
                  </span>
                </div>
              </div>

              {/* Row 3: Agent / Subsystem & Metric */}
              <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-white/[0.04] text-[#71717A]">
                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.carrierBadgeColor} shrink-0`} />
                  <span className="text-[#8E8EA0] truncate">{item.carrier}</span>
                </div>
                <span className="text-[#A1A1AA] shrink-0 font-medium font-mono text-[10px]">
                  {item.eta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
