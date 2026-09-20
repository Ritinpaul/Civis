'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useDemo } from '@/lib/store';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import {
  Plus,
  Minus,
  RotateCcw,
  Plane,
  Compass,
  MapPin,
  Sparkles,
  Radio,
} from 'lucide-react';

interface TacticalMapProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

interface MapNode {
  id: string;
  name: string;
  city: string;
  country: string;
  coords: [number, number]; // [lng, lat]
  role: 'origin' | 'transit' | 'dest' | 'hub';
  tag?: string;
  isCallout?: boolean;
}

const GLOBAL_NODES: MapNode[] = [
  {
    id: 'SIN',
    name: 'Singapore Changi International',
    city: 'Singapore',
    country: 'Singapore',
    coords: [103.8198, 1.3521],
    role: 'origin',
    tag: 'From  Singapore, Singapore',
    isCallout: true,
  },
  {
    id: 'VIE',
    name: 'Vienna / Austria Transit Hub',
    city: 'Vienna',
    country: 'Austria',
    coords: [16.3738, 48.2082],
    role: 'transit',
    tag: 'Transit  Austria',
    isCallout: true,
  },
  {
    id: 'LAX',
    name: 'Los Angeles International',
    city: 'Los Angeles',
    country: 'USA',
    coords: [-118.2437, 34.0522],
    role: 'dest',
    tag: 'Dest  Los Angeles, USA',
    isCallout: true,
  },
  {
    id: 'JED',
    name: 'King Abdulaziz International',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    coords: [39.1925, 21.4858],
    role: 'hub',
  },
  {
    id: 'DXB',
    name: 'Dubai International',
    city: 'Dubai',
    country: 'UAE',
    coords: [55.2708, 25.2048],
    role: 'hub',
  },
  {
    id: 'HND',
    name: 'Tokyo Haneda',
    city: 'Tokyo',
    country: 'Japan',
    coords: [139.6917, 35.6895],
    role: 'hub',
  },
  {
    id: 'CDG',
    name: 'Paris Charles de Gaulle',
    city: 'Paris',
    country: 'France',
    coords: [2.3522, 48.8566],
    role: 'hub',
  },
  {
    id: 'LHR',
    name: 'London Heathrow',
    city: 'London',
    country: 'UK',
    coords: [-0.1278, 51.5074],
    role: 'hub',
  },
  {
    id: 'NYC',
    name: 'John F. Kennedy International',
    city: 'New York',
    country: 'USA',
    coords: [-74.0060, 40.7128],
    role: 'hub',
  },
  {
    id: 'SAO',
    name: 'São Paulo–Guarulhos',
    city: 'São Paulo',
    country: 'Brazil',
    coords: [-46.6333, -23.5505],
    role: 'hub',
  },
  {
    id: 'SYD',
    name: 'Sydney Kingsford Smith',
    city: 'Sydney',
    country: 'Australia',
    coords: [151.2093, -33.8688],
    role: 'hub',
  },
  {
    id: 'CHN',
    name: 'Chennai International / CIVIS Ground Zero',
    city: 'Chennai',
    country: 'India',
    coords: [80.2707, 13.0827],
    role: 'hub',
  },
];

export function TacticalMap({ selectedSectorId, onSelectSector }: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport dimensions
  const width = 940;
  const height = 520;

  // Transform state for pan and zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [flightProgress, setFlightProgress] = useState(0.48); // Near Austria!

  // Animate the airplane moving along the flight trajectory
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setFlightProgress((prev) => (prev >= 1 ? 0 : prev + 0.0008));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── D3 Mercator Projection calibrated to World Map (Matching Reference) ──
  const projection = useMemo(() => {
    return geoMercator()
      .scale(145)
      .translate([width / 2, height / 2 + 35]);
  }, [width, height]);

  // Generate World Land Vector Path
  const worldLandPath = useMemo(() => {
    const pathGenerator = geoPath(projection);
    const landFeature = topojson.feature(worldData as any, (worldData as any).objects.land);
    return pathGenerator(landFeature) || '';
  }, [projection]);

  // Project all city nodes
  const projectedNodes = useMemo(() => {
    return GLOBAL_NODES.map((node) => {
      const pos = projection(node.coords) || [0, 0];
      return {
        ...node,
        x: pos[0],
        y: pos[1],
      };
    });
  }, [projection]);

  // ── Trajectory Curve (Singapore ➔ Austria ➔ Los Angeles) matching Reference ──
  const trajectory = useMemo(() => {
    const pSin = projection([103.8198, 1.3521]) || [0, 0];
    const pVie = projection([16.3738, 48.2082]) || [0, 0];
    const pLax = projection([-118.2437, 34.0522]) || [0, 0];

    // Smooth cubic bezier arc: Singapore ➔ high arc over Eurasia ➔ Austria ➔ Atlantic arc ➔ Los Angeles
    // Segment 1: Singapore to Austria
    const cp1X = (pSin[0] + pVie[0]) / 2 + 40;
    const cp1Y = Math.min(pSin[1], pVie[1]) - 70;

    // Segment 2: Austria to Los Angeles (crossing Atlantic & North America)
    const cp2X = (pVie[0] + pLax[0]) / 2 - 30;
    const cp2Y = Math.min(pVie[1], pLax[1]) - 110;

    const pathD = `M ${pSin[0]} ${pSin[1]} Q ${cp1X} ${cp1Y} ${pVie[0]} ${pVie[1]} Q ${cp2X} ${cp2Y} ${pLax[0]} ${pLax[1]}`;

    // Secondary flight path 2: Tokyo to Paris (UJ3958271ZX)
    const pHnd = projection([139.6917, 35.6895]) || [0, 0];
    const pCdg = projection([2.3522, 48.8566]) || [0, 0];
    const cpTokyoParisX = (pHnd[0] + pCdg[0]) / 2;
    const cpTokyoParisY = Math.min(pHnd[1], pCdg[1]) - 90;
    const pathTokyoParis = `M ${pHnd[0]} ${pHnd[1]} Q ${cpTokyoParisX} ${cpTokyoParisY} ${pCdg[0]} ${pCdg[1]}`;

    // Secondary flight path 3: Singapore to London (GV7829105LK)
    const pLhr = projection([-0.1278, 51.5074]) || [0, 0];
    const cpSinLhrX = (pSin[0] + pLhr[0]) / 2 + 20;
    const cpSinLhrY = Math.min(pSin[1], pLhr[1]) - 80;
    const pathSinLondon = `M ${pSin[0]} ${pSin[1]} Q ${cpSinLhrX} ${cpSinLhrY} ${pLhr[0]} ${pLhr[1]}`;

    return {
      pathD,
      pathTokyoParis,
      pathSinLondon,
      pSin,
      pVie,
      pLax,
      cp1X,
      cp1Y,
      cp2X,
      cp2Y,
    };
  }, [projection]);

  // Calculate current airplane position and angle along the curve
  const currentPlanePos = useMemo(() => {
    const { pSin, pVie, pLax, cp1X, cp1Y, cp2X, cp2Y } = trajectory;

    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;

    if (flightProgress < 0.5) {
      // First segment: Singapore ➔ Austria
      const t = flightProgress * 2;
      x = (1 - t) * (1 - t) * pSin[0] + 2 * (1 - t) * t * cp1X + t * t * pVie[0];
      y = (1 - t) * (1 - t) * pSin[1] + 2 * (1 - t) * t * cp1Y + t * t * pVie[1];
      dx = 2 * (1 - t) * (cp1X - pSin[0]) + 2 * t * (pVie[0] - cp1X);
      dy = 2 * (1 - t) * (cp1Y - pSin[1]) + 2 * t * (pVie[1] - cp1Y);
    } else {
      // Second segment: Austria ➔ Los Angeles
      const t = (flightProgress - 0.5) * 2;
      x = (1 - t) * (1 - t) * pVie[0] + 2 * (1 - t) * t * cp2X + t * t * pLax[0];
      y = (1 - t) * (1 - t) * pVie[1] + 2 * (1 - t) * t * cp2Y + t * t * pLax[1];
      dx = 2 * (1 - t) * (cp2X - pVie[0]) + 2 * t * (pLax[0] - cp2X);
      dy = 2 * (1 - t) * (cp2Y - pVie[1]) + 2 * t * (pLax[1] - cp2Y);
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { x, y, angle };
  }, [trajectory, flightProgress]);

  // Center-anchored Zoom Function
  const applyZoom = (factor: number) => {
    setTransform((prev) => {
      const newK = Math.max(0.8, Math.min(prev.k * factor, 3.5));
      const newX = width / 2 - (width / 2 - prev.x) * (newK / prev.k);
      const newY = height / 2 - (height / 2 - prev.y) * (newK / prev.k);
      return { x: newX, y: newY, k: newK };
    });
  };

  // Mouse Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    applyZoom(factor);
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[350px] rounded-2xl bg-[#080A0F] border border-white/[0.08] overflow-hidden shadow-2xl select-none flex flex-col cursor-grab active:cursor-grabbing"
    >
      {/* SVG Canvas (World Dot-Matrix Map matching Reference Image) */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          {/* 1. Tactical Crosshair Grid (Matching Reference Image) */}
          <pattern id="tacticalGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <line x1="27" y1="30" x2="33" y2="30" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            <line x1="30" y1="27" x2="30" y2="33" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          </pattern>

          {/* 2. World Dot-Matrix / Stippled Continent Pattern (Matching Reference Image) */}
          <pattern id="worldDotMatrix" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.9" fill="rgba(255, 255, 255, 0.28)" />
          </pattern>

          {/* Glowing Filters */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Deep Space / Dark Radar Background */}
        <rect width={width} height={height} fill="#080A0F" />
        <rect width={width} height={height} fill="url(#tacticalGrid)" />

        {/* Pan and Zoom Container Group */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* ── 1. The Continents in Stippled Dot-Matrix Pattern ── */}
          <g>
            {/* Base continent shape filled with high-density stippled dots */}
            <path
              d={worldLandPath}
              fill="url(#worldDotMatrix)"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="0.85"
            />
            {/* Faint glowing contour line for continent borders */}
            <path
              d={worldLandPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.6"
              filter="url(#arcGlow)"
            />
          </g>

          {/* ── 2. Secondary Flight Trajectories (Dashed, faint, elegant) ── */}
          <path
            d={trajectory.pathTokyoParis}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d={trajectory.pathSinLondon}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* ── 3. Primary Glowing Flight Arc (Singapore ➔ Austria ➔ Los Angeles) ── */}
          <g>
            {/* Outer soft glow line */}
            <path
              d={trajectory.pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="4"
              filter="url(#arcGlow)"
            />
            {/* Main elegant white flight path */}
            <path
              d={trajectory.pathD}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeOpacity="0.85"
            />
            {/* Animated dotted pulse stream */}
            <path
              d={trajectory.pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1.6"
              strokeDasharray="5 7"
              className="animate-edge-flow"
            />
          </g>

          {/* ── 4. Flying Bright Yellow Airplane Icon (Matching Reference Image) ── */}
          <g
            transform={`translate(${currentPlanePos.x}, ${currentPlanePos.y}) rotate(${currentPlanePos.angle})`}
            className="filter drop-shadow-[0_0_8px_rgba(234,179,8,0.7)] cursor-pointer"
          >
            {/* Yellow Airplane SVG */}
            <path
              d="M 10 0 L -4 -9 L -2 -3 L -10 -4 L -11 -2 L -8 0 L -11 2 L -10 4 L -2 3 L -4 9 Z"
              fill="#EAB308"
              stroke="#FACC15"
              strokeWidth="0.8"
            />
          </g>

          {/* ── 5. Circular City Nodes with Radial Glow Rings (Matching Reference) ── */}
          {projectedNodes.map((node) => {
            const isCallout = node.isCallout;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectSector(node.id)}
                className="cursor-pointer group"
              >
                {/* Outer radial glow halo */}
                <circle
                  cx="0"
                  cy="0"
                  r={isCallout ? '11' : '8'}
                  fill="rgba(255, 255, 255, 0.15)"
                  filter="url(#nodeGlow)"
                />
                {/* Solid white circular node (Matching Reference White Dots) */}
                <circle
                  cx="0"
                  cy="0"
                  r={isCallout ? '4.5' : '3'}
                  fill="#FFFFFF"
                  stroke="#080A0F"
                  strokeWidth="1.2"
                />

                {/* ── 6. Floating Frosted Glass Callouts (Matching Reference Image) ── */}
                {/* 6A: "Dest Los Angeles, USA" */}
                {node.id === 'LAX' && (
                  <g transform="translate(-148, -32)">
                    <rect
                      x="0"
                      y="0"
                      width="142"
                      height="24"
                      rx="12"
                      fill="rgba(12, 14, 20, 0.88)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text x="12" y="15" fill="#FFFFFF" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">
                      Dest
                    </text>
                    <text x="38" y="15" fill="#D4D4D8" fontSize="9.5" fontFamily="sans-serif">
                      Los Angeles, USA
                    </text>
                  </g>
                )}

                {/* 6B: "Transit Austria" (Near the yellow plane in Europe) */}
                {node.id === 'VIE' && (
                  <g transform="translate(-40, -32)">
                    <rect
                      x="0"
                      y="0"
                      width="106"
                      height="24"
                      rx="12"
                      fill="rgba(12, 14, 20, 0.88)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text x="12" y="15" fill="#FFFFFF" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">
                      Transit
                    </text>
                    <text x="50" y="15" fill="#D4D4D8" fontSize="9.5" fontFamily="sans-serif">
                      Austria
                    </text>
                  </g>
                )}

                {/* 6C: "From Singapore, Singapore" */}
                {node.id === 'SIN' && (
                  <g transform="translate(-165, 14)">
                    <rect
                      x="0"
                      y="0"
                      width="158"
                      height="24"
                      rx="12"
                      fill="rgba(12, 14, 20, 0.88)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text x="12" y="15" fill="#FFFFFF" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">
                      From
                    </text>
                    <text x="44" y="15" fill="#D4D4D8" fontSize="9.5" fontFamily="sans-serif">
                      Singapore, Singapore
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Center-Anchored Floating Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#0C0E15]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] z-20 shadow-xl">
        <button
          onClick={() => applyZoom(1.25)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors text-xs font-bold"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => applyZoom(0.8)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors text-xs font-bold"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8EA0] hover:text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Reset Map View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Route Legend Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-[#0C0E15]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-sans z-20 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-[#EDEDEF] font-bold text-xs">
            Flight DH7871 · IN TRANSIT (17H)
          </span>
        </div>
        <span className="text-[#71717A] text-[11px] font-mono">
          SIN ➔ VIE ➔ LAX
        </span>
      </div>
    </div>
  );
}
