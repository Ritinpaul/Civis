'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useDemo } from '@/lib/store';
import { geoMercator } from 'd3-geo';
import {
  MapPin,
  RotateCcw,
  Radio,
  Plus,
  Minus,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Droplets,
  Waves,
  Navigation,
  Activity,
  Eye,
  Zap,
} from 'lucide-react';

interface TacticalMapProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

interface CivicNode {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  coords: [number, number]; // [lng, lat]
  role: 'origin' | 'transit' | 'hazard' | 'infra' | 'sensor';
  isHazard?: boolean;
}

// ── Chennai Zone 4 Simulation Nodes (Adyar River Basin & Emergency Detour Corridor) ──
const CHENNAI_ZONE4_NODES: CivicNode[] = [
  {
    id: 'guindy-hub',
    name: 'Guindy Race Course Staging Hub A',
    tag: 'From: Guindy Staging Hub A',
    subtitle: '4 ALS 4x4 Ambulances • 3 Boats',
    coords: [80.2080, 13.0035],
    role: 'origin',
  },
  {
    id: 'kathipara-gate',
    name: 'Kathipara Traffic Diversion Gate',
    tag: 'Transit: Kathipara Gate',
    subtitle: 'Hard Barrier • Sedans Diverted',
    coords: [80.2067, 13.0078],
    role: 'transit',
  },
  {
    id: 'pier-4',
    name: 'Pier 4 Arterial Bridge (Saidapet Causeway)',
    tag: 'Dest: Pier 4 Bridge (68cm Surge)',
    subtitle: 'Adyar Causeway • Stalled Sedans',
    coords: [80.2201, 13.0152],
    role: 'hazard',
    isHazard: true,
  },
  {
    id: 'saidapet-pump',
    name: 'Saidapet Stormwater Pumping Station',
    tag: 'Hydro: Saidapet Pumps (12,000 LPM)',
    subtitle: 'Station #1 & #2 • 124% Overload',
    coords: [80.2255, 13.0185],
    role: 'infra',
  },
  {
    id: 'velachery-outfall',
    name: 'Velachery Canal Outfall & AGS Colony',
    tag: 'Outfall: Velachery Canal',
    subtitle: 'High Tide Backflow Risk',
    coords: [80.2240, 12.9850],
    role: 'infra',
  },
];

export function TacticalMap({ selectedSectorId, onSelectSector }: TacticalMapProps) {
  const { metrics } = useDemo();
  const containerRef = useRef<HTMLDivElement>(null);

  const isResolved = metrics.activeIncidents === 0;

  // Viewport dimensions
  const width = 940;
  const height = 520;

  // Transform state for pan and zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [vehicleProgress, setVehicleProgress] = useState(0.35);

  // Animate the ALS emergency vehicle moving along the detour trajectory
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setVehicleProgress((prev) => (prev >= 1 ? 0 : prev + 0.0016));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Precision D3 Mercator Projection calibrated specifically to Chennai Zone 4 ──
  // Center: [80.226, 13.010] (Adyar Basin / Saidapet centroid)
  // Scale: 460,000 provides crystal clear urban corridor resolution!
  const projection = useMemo(() => {
    return geoMercator()
      .center([80.226, 13.010])
      .scale(460000)
      .translate([width / 2 - 20, height / 2]);
  }, [width, height]);

  // Project all civic nodes
  const projectedNodes = useMemo(() => {
    return CHENNAI_ZONE4_NODES.map((node) => {
      const pos = projection(node.coords) || [0, 0];
      return {
        ...node,
        x: pos[0],
        y: pos[1],
      };
    });
  }, [projection]);

  // ── Geographic Landmarks: Adyar River, Coromandel Coastline, Roads, Flood Inundation ──
  const mapFeatures = useMemo(() => {
    // 1. Adyar River Channel Coordinates (West to East entering Bay of Bengal)
    const adyarRiverCoords: [number, number][] = [
      [80.1860, 13.0070], // Nandambakkam / Upstream
      [80.1940, 13.0085], // Manapakkam Bend
      [80.2030, 13.0105], // North of Kathipara
      [80.2110, 13.0125], // Guindy North Boundary
      [80.2201, 13.0150], // Pier 4 Arterial Bridge / Saidapet Causeway crossing!
      [80.2280, 13.0175], // Saidapet Lowlands / Pump Station discharge
      [80.2370, 13.0170], // Kotturpuram Meander
      [80.2470, 13.0140], // Turnbulls Road / Chamiers approach
      [80.2540, 13.0115], // Malar Hospital / Adyar Bridge
      [80.2640, 13.0080], // Adyar Estuary mouth into Bay of Bengal
    ];

    const riverPoints = adyarRiverCoords.map((c) => projection(c) || [0, 0]);
    let riverPathD = `M ${riverPoints[0][0]} ${riverPoints[0][1]}`;
    for (let i = 1; i < riverPoints.length; i++) {
      const pPrev = riverPoints[i - 1];
      const pCurr = riverPoints[i];
      const cpX = (pPrev[0] + pCurr[0]) / 2;
      const cpY = (pPrev[1] + pCurr[1]) / 2;
      riverPathD += ` Q ${pPrev[0]} ${pPrev[1]} ${cpX} ${cpY} T ${pCurr[0]} ${pCurr[1]}`;
    }

    // 2. Bay of Bengal Coastline (Eastern Boundary)
    const coastlineCoords: [number, number][] = [
      [80.2660, 13.0450], // Marina / Santhome North
      [80.2650, 13.0300], // Santhome Beach
      [80.2640, 13.0180], // Foreshore Estate
      [80.2640, 13.0080], // Adyar River Estuary mouth
      [80.2635, 12.9980], // Elliot's Beach / Besant Nagar
      [80.2630, 12.9800], // Thiruvanmiyur / ECR South
    ];
    const coastPoints = coastlineCoords.map((c) => projection(c) || [0, 0]);
    let coastPathD = `M ${coastPoints[0][0]} ${coastPoints[0][1]}`;
    for (let i = 1; i < coastPoints.length; i++) {
      coastPathD += ` L ${coastPoints[i][0]} ${coastPoints[i][1]}`;
    }

    // 3. Flood Inundation Polygon (3.42 sq km Adyar Floodplain & Saidapet Lowlands)
    const floodPolygonCoords: [number, number][] = [
      [80.2140, 13.0120], // Guindy Riverbank
      [80.2170, 13.0160], // Saidapet West Approach
      [80.2201, 13.0185], // Pier 4 Bridge North
      [80.2260, 13.0205], // Saidapet Lowlands (near Pump Station)
      [80.2310, 13.0180], // Kotturpuram Margin
      [80.2270, 13.0135], // Adyar South Bank
      [80.2200, 13.0115], // Saidapet Causeway South
    ];
    const floodPoints = floodPolygonCoords.map((c) => projection(c) || [0, 0]);
    const floodPathD = `M ${floodPoints.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`;

    // 4. Mount Road / Anna Salai (Flooded at Pier 4 Causeway)
    const mountRoadCoords: [number, number][] = [
      [80.2030, 13.0040], // Below Kathipara
      [80.2067, 13.0078], // Kathipara Junction Gate
      [80.2130, 13.0115], // Guindy Industrial Estate
      [80.2201, 13.0152], // Pier 4 Causeway crossing (Hazard)
      [80.2280, 13.0210], // Saidapet Metro / Nandanam
      [80.2360, 13.0280], // Anna Salai towards Central
    ];
    const mountRoadPoints = mountRoadCoords.map((c) => projection(c) || [0, 0]);
    const mountRoadD = `M ${mountRoadPoints.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`;

    // Submerged hazard section on Mount Road around Pier 4
    const submergedStart = projection([80.2165, 13.0135]) || [0, 0];
    const submergedMid = projection([80.2201, 13.0152]) || [0, 0];
    const submergedEnd = projection([80.2235, 13.0175]) || [0, 0];
    const submergedD = `M ${submergedStart[0]} ${submergedStart[1]} L ${submergedMid[0]} ${submergedMid[1]} L ${submergedEnd[0]} ${submergedEnd[1]}`;

    // 5. Emergency Detour Trajectory (The Active 14m ETA Route)
    // Guindy Hub A ➔ Kathipara Gate ➔ Inner Ring Road Bypass ➔ Saidapet West Approach ➔ Pier 4 Arterial Bridge
    const detourCoords: [number, number][] = [
      [80.2080, 13.0035], // Guindy Staging Hub A (Origin)
      [80.2067, 13.0078], // Kathipara Traffic Gate
      [80.2045, 13.0150], // Inner Ring Road (100 Ft Rd) Northbound
      [80.2060, 13.0220], // Jafferkhanpet Bypass
      [80.2120, 13.0235], // High Elevation Bypass Crossing
      [80.2175, 13.0195], // Saidapet West Approach
      [80.2201, 13.0152], // Pier 4 Arterial Bridge (Destination)
    ];
    const detourPoints = detourCoords.map((c) => projection(c) || [0, 0]);
    let detourD = `M ${detourPoints[0][0]} ${detourPoints[0][1]}`;
    for (let i = 1; i < detourPoints.length; i++) {
      const pPrev = detourPoints[i - 1];
      const pCurr = detourPoints[i];
      const cpX = (pPrev[0] + pCurr[0]) / 2;
      const cpY = (pPrev[1] + pCurr[1]) / 2;
      detourD += ` Q ${pPrev[0]} ${pPrev[1]} ${cpX} ${cpY} T ${pCurr[0]} ${pCurr[1]}`;
    }

    // 6. Secondary Roads & Velachery Canal Link
    const velacheryRoadCoords: [number, number][] = [
      [80.2100, 13.0035], // Near Guindy Hub
      [80.2180, 12.9960], // Velachery Main Rd
      [80.2240, 12.9850], // Velachery Outfall Canal
    ];
    const velRoadPoints = velacheryRoadCoords.map((c) => projection(c) || [0, 0]);
    const velRoadD = `M ${velRoadPoints.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`;

    return {
      riverPathD,
      coastPathD,
      coastPoints,
      floodPathD,
      mountRoadD,
      submergedD,
      detourD,
      detourPoints,
      velRoadD,
    };
  }, [projection]);

  // Moving vehicle position along the emergency detour trajectory
  const currentVehiclePos = useMemo(() => {
    const pts = mapFeatures.detourPoints;
    if (pts.length < 2) return { x: 0, y: 0, angle: 0 };

    const totalSegs = pts.length - 1;
    const scaledT = vehicleProgress * totalSegs;
    const segIndex = Math.min(Math.floor(scaledT), totalSegs - 1);
    const segT = scaledT - segIndex;

    const pA = pts[segIndex];
    const pB = pts[segIndex + 1];

    const cpX = (pA[0] + pB[0]) / 2;
    const cpY = (pA[1] + pB[1]) / 2;

    const x = (1 - segT) * (1 - segT) * pA[0] + 2 * (1 - segT) * segT * cpX + segT * segT * pB[0];
    const y = (1 - segT) * (1 - segT) * pA[1] + 2 * (1 - segT) * segT * cpY + segT * segT * pB[1];

    const dx = 2 * (1 - segT) * (cpX - pA[0]) + 2 * segT * (pB[0] - cpX);
    const dy = 2 * (1 - segT) * (cpY - pA[1]) + 2 * segT * (pB[1] - cpY);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle };
  }, [mapFeatures.detourPoints, vehicleProgress]);

  // Center-anchored Zoom Function
  const applyZoom = (factor: number) => {
    setTransform((prev) => {
      const newK = Math.max(0.75, Math.min(prev.k * factor, 4.0));
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

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    applyZoom(factor);
  };

  // View Preset 1: Full Chennai Zone 4 Basin Overview
  const resetToBasin = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  // View Preset 2: Focus on the Pier 4 Hazard & Detour Corridor
  const focusCorridor = () => {
    const pier4Pos = projection([80.2201, 13.0152]) || [width / 2, height / 2];
    const targetK = 1.85;
    const targetX = width / 2 - pier4Pos[0] * targetK;
    const targetY = height / 2 - pier4Pos[1] * targetK;
    setTransform({ x: targetX, y: targetY, k: targetK });
    onSelectSector('pier-4');
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[340px] rounded-2xl bg-[#07080B] border border-white/10 overflow-hidden shadow-2xl shadow-black select-none flex flex-col cursor-grab active:cursor-grabbing"
    >
      {/* Top Floating HUD Header */}
      <div className="absolute top-0 left-0 right-0 h-14 px-6 bg-gradient-to-b from-[#07080B] via-[#07080B]/90 to-transparent z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0B0F]/90 border border-white/10 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-indigo animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#EDEDEF]">
              CHENNAI RESILIENCE RADAR
            </span>
          </div>
          <span className="hidden md:inline text-xs font-mono text-[#8E8EA0]">
            ZONE 4 ADYAR BASIN // EMERGENCY DETOUR CORRIDOR
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToBasin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              transform.k <= 1.2
                ? 'bg-[#14151B] text-white border-white/30 font-bold shadow-md'
                : 'bg-[#0F1015]/80 text-[#8E8EA0] hover:text-[#EDEDEF] border-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Zone 4 Basin (Overview)</span>
          </button>

          <button
            onClick={focusCorridor}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              transform.k > 1.4
                ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 font-bold shadow-md shadow-[#10B981]/20'
                : 'bg-[#0F1015]/80 text-[#8E8EA0] hover:text-[#EDEDEF] border-white/10'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Corridor Focus (Pier 4)</span>
          </button>
        </div>
      </div>

      {/* Main SVG Tactical Canvas (Chennai Zone 4 Urban Corridor) */}
      <div className="relative flex-1 w-full h-full bg-[#07080B] overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            {/* Tactical Grid with Crosshair '+' Marks */}
            <pattern id="tacticalCrossGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
              <line x1="26" y1="30" x2="34" y2="30" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <line x1="30" y1="26" x2="30" y2="34" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            </pattern>

            {/* Tactical Dot Stipple Matrix for Landmass */}
            <pattern id="landStipple" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="0.8" fill="rgba(255, 255, 255, 0.12)" />
            </pattern>

            {/* Flood Risk Diagonal Hatching Pattern */}
            <pattern id="floodHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke={isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(229, 37, 42, 0.35)'} strokeWidth="2.5" />
            </pattern>

            {/* Glowing Filters */}
            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="hazardGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="waterGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Adyar River Gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
            </linearGradient>

            {/* Bay of Bengal Oceanic Gradient */}
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c192c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#07111e" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width={width} height={height} fill="#07080B" />
          <rect width={width} height={height} fill="url(#tacticalCrossGrid)" />

          {/* Pan & Zoom Group */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {/* ── 1. Base Landmass & Urban Zoning ── */}
            <rect x="0" y="0" width={width * 1.5} height={height * 1.5} fill="#0c0e14" />
            <rect x="0" y="0" width={width * 1.5} height={height * 1.5} fill="url(#landStipple)" />

            {/* ── 2. Bay of Bengal Oceanic Zone (Eastern Coastline) ── */}
            <path
              d={`${mapFeatures.coastPathD} L ${width * 1.5} ${mapFeatures.coastPoints[mapFeatures.coastPoints.length - 1][1]} L ${width * 1.5} 0 Z`}
              fill="url(#oceanGradient)"
              stroke="#1e3a8a"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            {/* Ocean Tactical Water Depth Contours */}
            <g opacity="0.35" stroke="#38BDF8" strokeWidth="0.75" fill="none">
              <path d={`M ${mapFeatures.coastPoints[0][0] + 35} 0 L ${mapFeatures.coastPoints[mapFeatures.coastPoints.length - 1][0] + 35} ${height * 1.5}`} strokeDasharray="6 6" />
              <path d={`M ${mapFeatures.coastPoints[0][0] + 80} 0 L ${mapFeatures.coastPoints[mapFeatures.coastPoints.length - 1][0] + 80} ${height * 1.5}`} strokeDasharray="8 8" />
            </g>
            <g opacity="0.4" fill="#38BDF8" fontSize="11" fontFamily="monospace" letterSpacing="5">
              <text x={mapFeatures.coastPoints[2][0] + 50} y="180" transform={`rotate(90 ${mapFeatures.coastPoints[2][0] + 50} 180)`}>
                BAY OF BENGAL // COROMANDEL COAST
              </text>
            </g>

            {/* ── 3. Adyar River Basin Channel (West to East) ── */}
            <g>
              {/* Outer river illumination halo */}
              <path
                d={mapFeatures.riverPathD}
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="20"
                strokeOpacity="0.2"
                strokeLinecap="round"
                filter="url(#waterGlow)"
              />
              {/* Main River Stream */}
              <path
                d={mapFeatures.riverPathD}
                fill="none"
                stroke="url(#riverGradient)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* High-Velocity Flow Core line */}
              <path
                d={mapFeatures.riverPathD}
                fill="none"
                stroke="#BAE6FD"
                strokeWidth="2"
                strokeDasharray="14 10"
                strokeOpacity="0.8"
                className="animate-pulse"
              />
              {/* River Flow Direction Label */}
              <text
                x="200"
                y="275"
                fill="#38BDF8"
                fontSize="10"
                fontFamily="monospace"
                letterSpacing="3"
                opacity="0.7"
              >
                ADYAR RIVER (1.8 m/s SURGE ➔)
              </text>
            </g>

            {/* ── 4. Flood Inundation Hazard Polygon (Saidapet / Pier 4 Basin) ── */}
            <g>
              <path
                d={mapFeatures.floodPathD}
                fill="url(#floodHatch)"
                stroke={isResolved ? '#10B981' : '#E5252A'}
                strokeWidth="1.8"
                strokeDasharray="6 4"
                filter="url(#hazardGlow)"
                className={!isResolved ? 'animate-pulse' : ''}
              />
              {/* Flood Polygon Label */}
              <g transform="translate(480, 240)">
                <rect
                  x="-10"
                  y="-14"
                  width="190"
                  height="22"
                  rx="4"
                  fill="rgba(11, 13, 19, 0.9)"
                  stroke={isResolved ? '#10B981' : '#E5252A'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="1"
                  fill={isResolved ? '#10B981' : '#E5252A'}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isResolved ? 'SURGE CREST MITIGATED' : 'INUNDATION EXTENT (3.42 SQ KM)'}
                </text>
              </g>
            </g>

            {/* ── 5. Urban Road Arterial Network ── */}
            {/* Velachery Main Road */}
            <path
              d={mapFeatures.velRoadD}
              fill="none"
              stroke="#27272A"
              strokeWidth="3.5"
              strokeDasharray="4 2"
            />
            <text x="360" y="440" fill="#71717A" fontSize="9" fontFamily="monospace" opacity="0.6">
              Velachery Main Rd
            </text>

            {/* Mount Road / Anna Salai (Arterial 1) */}
            <g>
              <path
                d={mapFeatures.mountRoadD}
                fill="none"
                stroke="#3F3F46"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d={mapFeatures.mountRoadD}
                fill="none"
                stroke="#71717A"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              {/* Submerged section across Pier 4 Causeway */}
              <path
                d={mapFeatures.submergedD}
                fill="none"
                stroke={isResolved ? '#10B981' : '#E5252A'}
                strokeWidth="6"
                strokeDasharray="6 4"
                filter="url(#hazardGlow)"
                className={!isResolved ? 'animate-pulse' : ''}
              />
              <text x="500" y="145" fill="#A1A1AA" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                Mount Road / Anna Salai
              </text>
              {!isResolved && (
                <text x="330" y="195" fill="#EF4444" fontSize="8.5" fontFamily="monospace">
                  ⚠ CAUSEWAY IMPASSABLE (68cm)
                </text>
              )}
            </g>

            {/* ── 6. Emergency Detour Trajectory Corridor (Active 14m ETA Path) ── */}
            {/* Guindy Hub A ➔ Kathipara Gate ➔ Inner Ring Road Bypass ➔ Saidapet West ➔ Pier 4 */}
            <g>
              {/* Outer soft glow line */}
              <path
                d={mapFeatures.detourD}
                fill="none"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="6"
                filter="url(#corridorGlow)"
              />
              {/* Main glowing corridor dash */}
              <path
                d={mapFeatures.detourD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.4"
                strokeDasharray="7 5"
                strokeOpacity="0.95"
              />
              {/* Corridor Route Label */}
              <text x="260" y="110" fill="#34D399" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                EMERGENCY DETOUR: INNER RING ROAD BYPASS (14m ETA)
              </text>

              {/* Animated ALS 4x4 Emergency Dispatch Ambulance Unit */}
              <g
                transform={`translate(${currentVehiclePos.x}, ${currentVehiclePos.y}) rotate(${currentVehiclePos.angle})`}
              >
                <circle cx="0" cy="0" r="12" fill="rgba(234, 179, 8, 0.3)" className="animate-ping" />
                <rect
                  x="-8"
                  y="-5"
                  width="16"
                  height="10"
                  rx="2.5"
                  fill="#0B0D13"
                  stroke="#EAB308"
                  strokeWidth="1.8"
                />
                <circle cx="0" cy="0" r="2.5" fill="#EAB308" />
                {/* Emergency Cross Symbol on Vehicle */}
                <path d="M -3 0 L 3 0 M 0 -3 L 0 3" stroke="#FFFFFF" strokeWidth="1" />
              </g>
            </g>

            {/* ── 7. Tactical Civic Nodes & Frosted Glass Callout Badges ── */}
            {projectedNodes.map((node) => {
              const isSelected = selectedSectorId === node.id;
              const isHazard = node.isHazard;

              // Badge stroke & theme colors
              let nodeColor = '#FFFFFF';
              if (isHazard) {
                nodeColor = isResolved ? '#10B981' : '#E5252A';
              } else if (node.role === 'origin') {
                nodeColor = '#10B981';
              } else if (node.role === 'transit') {
                nodeColor = '#F59E0B';
              } else if (node.role === 'infra') {
                nodeColor = '#06B6D4';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => onSelectSector(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer Concentric Radar Rings */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHazard ? '16' : '12'}
                    fill={
                      isHazard
                        ? isResolved
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(229, 37, 42, 0.25)'
                        : 'rgba(255, 255, 255, 0.15)'
                    }
                    className={isHazard && !isResolved ? 'animate-ping' : ''}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r={isHazard ? '9' : '7'}
                    fill="#0B0D13"
                    stroke={nodeColor}
                    strokeWidth="2"
                    filter="url(#corridorGlow)"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r={isHazard ? '4' : '3'}
                    fill={nodeColor}
                  />

                  {/* Frosted Glass Callout Pill */}
                  <g
                    transform={
                      node.id === 'pier-4'
                        ? 'translate(-232, -48)'
                        : node.id === 'guindy-hub'
                        ? 'translate(-95, 24)'
                        : node.id === 'kathipara-gate'
                        ? 'translate(-205, 16)'
                        : node.id === 'saidapet-pump'
                        ? 'translate(28, -20)'
                        : node.id === 'velachery-outfall'
                        ? 'translate(-85, -48)'
                        : 'translate(14, 10)'
                    }
                  >
                    <rect
                      x="0"
                      y="0"
                      width={node.tag.length * 6.8 + 22}
                      height="34"
                      rx="7"
                      fill="rgba(11, 13, 19, 0.92)"
                      stroke={
                        isHazard
                          ? isResolved
                            ? '#10B981'
                            : '#E5252A'
                          : isSelected
                          ? '#6366F1'
                          : nodeColor
                      }
                      strokeWidth={isSelected ? '2' : '1.2'}
                      style={{ backdropFilter: 'blur(10px)' }}
                    />
                    {/* Primary Tag Title */}
                    <text
                      x="10"
                      y="15"
                      fill={
                        isHazard
                          ? isResolved
                            ? '#10B981'
                            : '#E5252A'
                          : nodeColor
                      }
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.tag}
                    </text>
                    {/* Subtitle Telemetry line */}
                    <text
                      x="10"
                      y="27"
                      fill="#A1A1AA"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {node.subtitle}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Sensor Telemetry Indicators: CCTV & Rain Gauge */}
            {/* Gemini Vision Sensor at Pier 4 */}
            <g transform={`translate(${projection([80.2155, 13.0185])?.[0] || 0}, ${projection([80.2155, 13.0185])?.[1] || 0})`}>
              <circle cx="0" cy="0" r="4" fill="#6366F1" className="animate-pulse" />
              <rect x="7" y="-8" width="96" height="15" rx="3" fill="rgba(15, 23, 42, 0.85)" stroke="#6366F1" strokeWidth="0.8" />
              <text x="11" y="3" fill="#A5B4FC" fontSize="8" fontFamily="monospace">
                CHN-Z4-CAM-18
              </text>
            </g>
            {/* Rainfall Gauge at Adyar Basin */}
            <g transform={`translate(${projection([80.2030, 13.0125])?.[0] || 0}, ${projection([80.2030, 13.0125])?.[1] || 0})`}>
              <circle cx="0" cy="0" r="4" fill="#38BDF8" />
              <rect x="7" y="-8" width="105" height="15" rx="3" fill="rgba(15, 23, 42, 0.85)" stroke="#38BDF8" strokeWidth="0.8" />
              <text x="11" y="3" fill="#BAE6FD" fontSize="8" fontFamily="monospace">
                CHN-Z4-RG (142mm)
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Center-Anchored Zoom Controls (Bottom Left) */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#0B0B0F]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20 shadow-xl">
          <button
            onClick={() => applyZoom(1.25)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-[#14151B] transition-colors text-xs font-bold"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyZoom(0.8)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-[#14151B] transition-colors text-xs font-bold"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetToBasin}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8EA0] hover:text-[#EDEDEF] hover:bg-[#14151B] transition-colors"
            title="Reset to Zone 4 Basin View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Corridor Status Pill (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-[#0B0B0F]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono z-20 shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-[#10B981]' : 'bg-[#E5252A] animate-ping'}`} />
            <span className="text-[#EDEDEF] font-bold">
              {isResolved ? 'PIER 4 HAZARD MITIGATED' : 'CHENNAI ZONE 4 CORRIDOR'}
            </span>
          </div>
          <span className="text-[#52525B]">|</span>
          <span className="text-[#8E8EA0]">
            Guindy Hub A ➔ Kathipara ➔ Pier 4 Bridge
          </span>
          <span className="text-[#10B981] font-bold">(14m ETA)</span>
        </div>
      </div>
    </div>
  );
}
