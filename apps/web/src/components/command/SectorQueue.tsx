'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Plane,
  Ship,
  Truck,
  AlertCircle,
  Package,
} from 'lucide-react';

interface SectorQueueProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

export interface ShipmentItem {
  id: string;
  code: string;
  status: 'PENDING' | 'IN TRANSIT' | 'ARRIVED' | 'DELAYED' | 'CRITICAL' | 'RESOLVED';
  statusColor: 'amber' | 'blue' | 'emerald' | 'crimson';
  originCode: string;
  destCode: string;
  duration: string;
  transitIcon?: React.ComponentType<{ className?: string }>;
  originCity: string;
  destCity: string;
  carrier: string;
  carrierColor: string;
  eta: string;
  category: 'air' | 'sea' | 'land' | 'delayed';
  isCivicIncident?: boolean;
}

export function SectorQueue({ selectedSectorId, onSelectSector }: SectorQueueProps) {
  const { metrics, incident } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'air' | 'sea' | 'land' | 'delayed'>('all');

  const isResolved = metrics.activeIncidents === 0;

  // Shipments & missions matching the reference image
  const shipments: ShipmentItem[] = [
    {
      id: 'PL2837465NM',
      code: 'PL2837465NM',
      status: 'PENDING',
      statusColor: 'amber',
      originCode: 'JED',
      destCode: 'DXB',
      duration: '3H',
      originCity: 'Jeddah, Saudi Arabia',
      destCity: 'Dubai, UAE',
      carrier: 'Emirates Cargo · B777F',
      carrierColor: 'bg-red-600',
      eta: 'ETA DEC 19, 2024',
      category: 'air',
    },
    {
      id: 'SF2043892GH',
      code: 'SF2043892GH',
      status: 'IN TRANSIT',
      statusColor: 'blue',
      originCode: 'SIN',
      destCode: 'LAX',
      duration: '17H',
      transitIcon: Plane,
      originCity: 'Singapore, Singapore',
      destCity: 'Los Angeles, USA',
      carrier: 'DHL · B773F',
      carrierColor: 'bg-yellow-500',
      eta: 'ETA DEC 22, 2024',
      category: 'air',
    },
    {
      id: 'UJ3958271ZX',
      code: 'UJ3958271ZX',
      status: 'ARRIVED',
      statusColor: 'emerald',
      originCode: 'HND',
      destCode: 'CDG',
      duration: '14H',
      originCity: 'Tokyo, Japan',
      destCity: 'Paris, France',
      carrier: 'FedEx · B777F',
      carrierColor: 'bg-purple-600',
      eta: 'Delivered DEC 18, 2024',
      category: 'air',
    },
    {
      id: 'GV7829105LK',
      code: 'GV7829105LK',
      status: 'IN TRANSIT',
      statusColor: 'blue',
      originCode: 'SIN',
      destCode: 'LHR',
      duration: '13H',
      originCity: 'Singapore, Singapore',
      destCity: 'London, UK',
      carrier: 'UPS · B748F',
      carrierColor: 'bg-amber-800',
      eta: 'ETA DEC 25, 2024',
      category: 'air',
    },
    {
      id: 'QA9162534OP',
      code: 'QA9162534OP',
      status: 'DELAYED',
      statusColor: 'crimson',
      originCode: 'BKK',
      destCode: 'DOH',
      duration: '7H',
      originCity: 'Bangkok, Thailand',
      destCity: 'Doha, Qatar',
      carrier: 'Qatar Airways · B777F',
      carrierColor: 'bg-rose-900',
      eta: 'ETA DEC 21, 2024',
      category: 'delayed',
    },
    {
      id: 'pier-4',
      code: incident.id,
      status: isResolved ? 'RESOLVED' : 'CRITICAL',
      statusColor: isResolved ? 'emerald' : 'crimson',
      originCode: 'GND',
      destCode: 'P4-APP',
      duration: '14M',
      transitIcon: Truck,
      originCity: 'Guindy Hub A',
      destCity: 'Pier 4 Arterial Bridge',
      carrier: 'Civic Dispatch · ALS 4x4',
      carrierColor: 'bg-cyan-500',
      eta: isResolved ? 'Passable · Barrier Active' : 'Water: 68cm • 1.8 m/s',
      category: 'land',
      isCivicIncident: true,
    },
  ];

  const filtered = shipments.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.originCity.toLowerCase().includes(q) ||
        item.destCity.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full lg:w-[390px] xl:w-[410px] shrink-0 h-full flex flex-col bg-[#0B0D13] rounded-2xl border border-white/[0.08] p-3.5 space-y-3 shadow-2xl select-none min-h-0">
      {/* 1. Header (Matching Reference Image: "Tracking list" + pill "24 shipments" + icons) */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#EDEDEF] tracking-tight font-sans">
            Tracking list
          </h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#141620] text-[#8E8EA0] border border-white/[0.06]">
            <Package className="w-3 h-3 text-[#71717A]" />
            <span>24 shipments</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#71717A]">
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-white/[0.04]">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Search Input with ⌘K badge (Matching Reference) */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search order ID, port, carrier..."
          className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-[#11131A] border border-white/[0.08] text-xs text-[#EDEDEF] placeholder-[#52525B] focus:outline-none focus:border-cyan-500/50 transition-all font-sans"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono text-[#52525B] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          ⌘K
        </span>
      </div>

      {/* 3. Category Filter Pills (Exact Match to Reference: Active is solid white pill with bold black text) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none shrink-0 font-sans">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          All Shipments
        </button>
        <button
          onClick={() => setActiveTab('air')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'air'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          <Plane className="w-3 h-3" />
          <span>Air</span>
        </button>
        <button
          onClick={() => setActiveTab('sea')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'sea'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          <Ship className="w-3 h-3" />
          <span>Sea</span>
        </button>
        <button
          onClick={() => setActiveTab('land')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'land'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          <Truck className="w-3 h-3" />
          <span>Land</span>
        </button>
        <button
          onClick={() => setActiveTab('delayed')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
            activeTab === 'delayed'
              ? 'bg-white text-black font-bold shadow-md shadow-white/10'
              : 'bg-[#11131A] text-[#8E8EA0] hover:text-[#EDEDEF] border border-white/[0.06]'
          }`}
        >
          <AlertCircle className="w-3 h-3" />
          <span>Delayed</span>
        </button>
      </div>

      {/* 4. Shipment Card List (Flex-1 scrollable with exact styling match to reference) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin min-h-0">
        {filtered.map((item) => {
          const isSelected = selectedSectorId === item.id;
          const TransitIcon = item.transitIcon;

          // Status badge colors
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
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold border ${badgeClass}`}>
                  {item.status}
                </span>
              </div>

              {/* Row 2: Trajectory Line (Reference: JED ····· 3H ····· DXB) */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                  <span className="font-bold text-[#A1A1AA]">{item.originCode}</span>
                  <div className="flex-1 mx-3 flex items-center justify-center relative">
                    <div className="w-full h-px border-t border-dotted border-white/20" />
                    <div className="absolute px-2 py-0.2 bg-[#11131A] rounded text-[8.5px] font-mono text-[#71717A] border border-white/10 flex items-center gap-1">
                      {TransitIcon && <TransitIcon className="w-2.5 h-2.5 text-cyan-400" />}
                      <span>{item.duration}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#A1A1AA]">{item.destCode}</span>
                </div>

                {/* Subtitle City Names */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="truncate max-w-[145px] text-[#8E8EA0]">
                    {item.originCity}
                  </span>
                  <span className="truncate max-w-[145px] text-[#EDEDEF] text-right font-medium">
                    {item.destCity}
                  </span>
                </div>
              </div>

              {/* Row 3: Carrier & ETA */}
              <div className="flex items-center justify-between text-[10.5px] font-sans pt-1 border-t border-white/[0.04] text-[#71717A]">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <span className={`w-2 h-2 rounded-sm ${item.carrierColor} shrink-0`} />
                  <span className="text-[#8E8EA0] truncate">{item.carrier}</span>
                </div>
                <span className="text-[#A1A1AA] shrink-0 font-medium">{item.eta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
