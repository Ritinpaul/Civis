'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useDemo } from '@/lib/store';
import { geoMercator } from 'd3-geo';
import {
  PlusIcon,
  MinusIcon,
  ResetIcon,
  DrawingPinIcon,
  TargetIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

interface TacticalMapProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

interface CivicNode {
  id: string;
  name: string;
  tagTitle: string;
  tagSubtitle: string;
  coords: [number, number]; // [lng, lat]
  role: 'origin' | 'transit' | 'hazard' | 'infra';
  isHazard?: boolean;
}

const CHENNAI_ZONE4_NODES: CivicNode[] = [
  {
    id: 'guindy-hub',
    name: 'Guindy Race Course Staging Hub A',
    tagTitle: 'From  Guindy Staging Hub A',
    tagSubtitle: '4 ALS 4x4 Ambulances • 3 Boats',
    coords: [80.2080, 13.0035],
    role: 'origin',
  },
  {
    id: 'kathipara-gate',
    name: 'Kathipara Traffic Diversion Gate',
    tagTitle: 'Transit  Kathipara Bypass',
    tagSubtitle: 'Hard Barrier • Sedans Diverted',
    coords: [80.2067, 13.0078],
    role: 'transit',
  },
  {
    id: 'pier-4',
    name: 'Pier 4 Arterial Bridge (Saidapet Causeway)',
    tagTitle: 'Dest  Pier 4 Arterial Bridge',
    tagSubtitle: 'Water: 68cm • 1.8 m/s Current',
    coords: [80.2201, 13.0152],
    role: 'hazard',
    isHazard: true,
  },
  {
    id: 'saidapet-pump',
    name: 'Saidapet Stormwater Pumping Station',
    tagTitle: 'Hydro  Saidapet Pumps',
    tagSubtitle: '12,000 LPM • 124% Overload',
    coords: [80.2255, 13.0185],
    role: 'infra',
  },
  {
    id: 'velachery-outfall',
    name: 'Velachery Canal Outfall & AGS Colony',
    tagTitle: 'Outfall  Velachery Canal',
    tagSubtitle: 'High Tide Backflow Guard',
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
  const [vehicleProgress, setVehicleProgress] = useState(0.42);

  // Animate the ALS emergency vehicle moving along the detour trajectory
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setVehicleProgress((prev) => (prev >= 1 ? 0 : prev + 0.0012));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Precision D3 Mercator Projection calibrated specifically to Chennai Zone 4
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

  // Geographic Landmark Features
  const mapFeatures = useMemo(() => {
    // 1. Adyar River Channel Coordinates
    const adyarRiverCoords: [number, number][] = [
      [80.1860, 13.0070],
      [80.1940, 13.0085],
      [80.2030, 13.0105],
      [80.2110, 13.0125],
      [80.2201, 13.0150],
      [80.2280, 13.0175],
      [80.2370, 13.0170],
      [80.2470, 13.0140],
      [80.2540, 13.0115],
      [80.2640, 13.0080],
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
      [80.2660, 13.0450],
      [80.2650, 13.0300],
      [80.2640, 13.0180],
      [80.2640, 13.0080],
      [80.2635, 12.9980],
      [80.2630, 12.9800],
    ];
    const coastPoints = coastlineCoords.map((c) => projection(c) || [0, 0]);
    let coastPathD = `M ${coastPoints[0][0]} ${coastPoints[0][1]}`;
    for (let i = 1; i < coastPoints.length; i++) {
      coastPathD += ` L ${coastPoints[i][0]} ${coastPoints[i][1]}`;
    }

    // 3. Flood Inundation Polygon (3.42 sq km Adyar Floodplain)
    const floodPolygonCoords: [number, number][] = [
      [80.2140, 13.0120],
      [80.2170, 13.0160],
      [80.2201, 13.0185],
      [80.2260, 13.0205],
      [80.2310, 13.0180],
      [80.2270, 13.0135],
      [80.2200, 13.0115],
    ];
    const floodPoints = floodPolygonCoords.map((c) => projection(c) || [0, 0]);
    const floodPathD = `M ${floodPoints.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`;

    // 4. Mount Road / Anna Salai
    const mountRoadCoords: [number, number][] = [
      [80.2030, 13.0040],
      [80.2067, 13.0078],
      [80.2130, 13.0115],
      [80.2201, 13.0152],
      [80.2280, 13.0210],
      [80.2360, 13.0280],
    ];
    const mountRoadPoints = mountRoadCoords.map((c) => projection(c) || [0, 0]);
    const mountRoadD = `M ${mountRoadPoints.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`;

    // Submerged hazard section on Mount Road around Pier 4
    const submergedStart = projection([80.2165, 13.0135]) || [0, 0];
    const submergedMid = projection([80.2201, 13.0152]) || [0, 0];
    const submergedEnd = projection([80.2235, 13.0175]) || [0, 0];
    const submergedD = `M ${submergedStart[0]} ${submergedStart[1]} L ${submergedMid[0]} ${submergedMid[1]} L ${submergedEnd[0]} ${submergedEnd[1]}`;

    // 5. Emergency Detour Trajectory
    const detourCoords: [number, number][] = [
      [80.2080, 13.0035], // Guindy Staging Hub A (Origin)
      [80.2067, 13.0078], // Kathipara Traffic Gate
      [80.2045, 13.0150], // Inner Ring Road Northbound
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

    return {
      riverPathD,
      coastPathD,
      coastPoints,
      floodPathD,
      mountRoadD,
      submergedD,
      detourD,
      detourPoints,
    };
  }, [projection]);

  // Position of the ALS 4x4 Emergency vehicle along the detour
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    applyZoom(factor);
  };

  const resetToBasin = () => {
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
      className="relative w-full h-full min-h-[350px] rounded-2xl bg-[#080A0F] border border-white/[0.08] overflow-hidden shadow-2xl select-none flex flex-col cursor-grab active:cursor-grabbing font-sans"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          {/* Tactical Crosshair Grid */}
          <pattern id="tacticalCrossGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <line x1="27" y1="30" x2="33" y2="30" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            <line x1="30" y1="27" x2="30" y2="33" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          </pattern>

          {/* Stippled Dot Matrix Pattern for Urban Landmass */}
          <pattern id="urbanDotMatrix" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.8" fill="rgba(255, 255, 255, 0.14)" />
          </pattern>

          {/* Flood Inundation Diagonal Hatching */}
          <pattern id="floodHatchPattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={isResolved ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.35)'}
              strokeWidth="2.5"
            />
          </pattern>

          {/* Filters */}
          <filter id="nodeHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="trajectoryGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width={width} height={height} fill="#080A0F" />
        <rect width={width} height={height} fill="url(#tacticalCrossGrid)" />

        {/* Pan and Zoom Group */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* 1. Base Urban Landmass in Stippled Dot-Matrix */}
          <rect x="0" y="0" width={width * 1.5} height={height * 1.5} fill="#0A0C14" />
          <rect x="0" y="0" width={width * 1.5} height={height * 1.5} fill="url(#urbanDotMatrix)" />

          {/* 2. Bay of Bengal Oceanic Zone */}
          <path
            d={`${mapFeatures.coastPathD} L ${width * 1.5} ${mapFeatures.coastPoints[mapFeatures.coastPoints.length - 1][1]} L ${width * 1.5} 0 Z`}
            fill="#080F1D"
            stroke="#1E3A8A"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <text
            x={mapFeatures.coastPoints[2][0] + 45}
            y="180"
            transform={`rotate(90 ${mapFeatures.coastPoints[2][0] + 45} 180)`}
            fill="#38BDF8"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="4"
            opacity="0.5"
          >
            BAY OF BENGAL
          </text>

          {/* 3. Adyar River Channel */}
          <g>
            <path
              d={mapFeatures.riverPathD}
              fill="none"
              stroke="#0284C7"
              strokeWidth="16"
              strokeOpacity="0.25"
              filter="url(#trajectoryGlow)"
            />
            <path
              d={mapFeatures.riverPathD}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={mapFeatures.riverPathD}
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="1.8"
              strokeDasharray="12 8"
              strokeOpacity="0.75"
              className="animate-pulse"
            />
          </g>

          {/* 4. Flood Inundation Hazard Polygon */}
          <g>
            <path
              d={mapFeatures.floodPathD}
              fill="url(#floodHatchPattern)"
              stroke={isResolved ? '#10B981' : '#EF4444'}
              strokeWidth="1.6"
              strokeDasharray="5 3"
              className={!isResolved ? 'animate-pulse' : ''}
            />
          </g>

          {/* 5. Mount Road / Anna Salai */}
          <g>
            <path
              d={mapFeatures.mountRoadD}
              fill="none"
              stroke="#27272A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Submerged section */}
            <path
              d={mapFeatures.submergedD}
              fill="none"
              stroke={isResolved ? '#10B981' : '#EF4444'}
              strokeWidth="5"
              strokeDasharray="5 3"
              filter="url(#trajectoryGlow)"
              className={!isResolved ? 'animate-pulse' : ''}
            />
          </g>

          {/* 6. Emergency Detour Trajectory Arc */}
          <g>
            {/* Soft outer glow */}
            <path
              d={mapFeatures.detourD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="5"
              filter="url(#trajectoryGlow)"
            />
            {/* Main white route arc */}
            <path
              d={mapFeatures.detourD}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeOpacity="0.9"
            />
            {/* Dotted animation */}
            <path
              d={mapFeatures.detourD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.8"
              strokeDasharray="6 6"
              className="animate-edge-flow"
            />

            {/* Moving Emergency Vehicle Icon */}
            <g
              transform={`translate(${currentVehiclePos.x}, ${currentVehiclePos.y}) rotate(${currentVehiclePos.angle})`}
              className="filter drop-shadow-[0_0_8px_rgba(234,179,8,0.7)] cursor-pointer"
            >
              <rect
                x="-9"
                y="-6"
                width="18"
                height="12"
                rx="3"
                fill="#0B0D13"
                stroke="#EAB308"
                strokeWidth="1.8"
              />
              <circle cx="-3" cy="0" r="2" fill="#EAB308" />
              <circle cx="4" cy="0" r="2" fill="#EAB308" />
            </g>
          </g>

          {/* 7. Circular City / Sector Nodes & Frosted Callouts */}
          {projectedNodes.map((node) => {
            const isSelected = selectedSectorId === node.id;
            const isHazard = node.isHazard;

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
                  r={isHazard ? '14' : '10'}
                  fill={
                    isHazard
                      ? isResolved
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(255, 255, 255, 0.15)'
                  }
                  filter="url(#nodeHaloGlow)"
                  className={isHazard && !isResolved ? 'animate-ping' : ''}
                />
                {/* Solid circular node */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHazard ? '5.5' : '4'}
                  fill="#FFFFFF"
                  stroke="#080A0F"
                  strokeWidth="1.2"
                />

                {/* Floating Frosted Glass Callout Pills */}
                {node.id === 'pier-4' && (
                  <g transform="translate(-215, -34)">
                    <rect
                      x="0"
                      y="0"
                      width="210"
                      height="26"
                      rx="13"
                      fill="rgba(12, 14, 20, 0.9)"
                      stroke={isResolved ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
                      strokeWidth="1"
                    />
                    <text x="12" y="16" fill={isResolved ? '#10B981' : '#EF4444'} fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                      Dest
                    </text>
                    <text x="42" y="16" fill="#EDEDEF" fontSize="10" fontFamily="sans-serif">
                      Pier 4 Arterial Bridge
                    </text>
                  </g>
                )}

                {node.id === 'kathipara-gate' && (
                  <g transform="translate(-165, 14)">
                    <rect
                      x="0"
                      y="0"
                      width="160"
                      height="26"
                      rx="13"
                      fill="rgba(12, 14, 20, 0.9)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text x="12" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                      Transit
                    </text>
                    <text x="56" y="16" fill="#D4D4D8" fontSize="10" fontFamily="sans-serif">
                      Kathipara Bypass
                    </text>
                  </g>
                )}

                {node.id === 'guindy-hub' && (
                  <g transform="translate(-185, 16)">
                    <rect
                      x="0"
                      y="0"
                      width="180"
                      height="26"
                      rx="13"
                      fill="rgba(12, 14, 20, 0.9)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text x="12" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                      From
                    </text>
                    <text x="48" y="16" fill="#D4D4D8" fontSize="10" fontFamily="sans-serif">
                      Guindy Staging Hub A
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Center-Anchored Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#0C0E15]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] z-20 shadow-xl">
        <button
          onClick={() => applyZoom(1.25)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => applyZoom(0.8)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetToBasin}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8EA0] hover:text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Reset Map View"
        >
          <ResetIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Route Legend Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-[#0C0E15]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-sans z-20 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-[#EDEDEF] font-bold text-xs">
            {isResolved ? 'Pier 4 Hazard Mitigated' : 'ALS 4x4 · IN TRANSIT (14M ETA)'}
          </span>
        </div>
        <span className="text-[#71717A] text-[11px] font-mono">
          GND ➔ KTH ➔ P4-APP
        </span>
      </div>
    </div>
  );
}
