'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDemo, SCENARIO_PRESETS } from '@/lib/store';
import {
  PlusIcon,
  MinusIcon,
  ResetIcon,
  GlobeIcon,
  TargetIcon,
} from '@radix-ui/react-icons';

interface TacticalMapProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

export interface CivicNode {
  id: string;
  name: string;
  tagTitle: string;
  tagSubtitle: string;
  lat: number;
  lng: number;
  role: 'origin' | 'transit' | 'hazard' | 'infra';
  zone: 'East' | 'South' | 'North' | 'Central' | 'West';
  isHazard?: boolean;
}

export const BENGALURU_NODES: CivicNode[] = [
  // EAST ZONE (Bellandur / Mahadevapura / ORR)
  {
    id: 'pier-4',
    name: 'Bellandur Spillway Arterial Bridge',
    tagTitle: 'Dest  Bellandur Spillway Bridge',
    tagSubtitle: 'Water: 68cm • 1.8 m/s Current',
    lat: 12.9333,
    lng: 77.6690,
    role: 'hazard',
    zone: 'East',
    isHazard: true,
  },
  {
    id: 'marathahalli-gate',
    name: 'Marathahalli ORR Traffic Gate',
    tagTitle: 'Transit  Marathahalli ORR',
    tagSubtitle: 'Hard Barrier • Sedans Diverted',
    lat: 12.9560,
    lng: 77.6980,
    role: 'transit',
    zone: 'East',
  },
  {
    id: 'varthur-outfall',
    name: 'Varthur Lake Channel Outfall',
    tagTitle: 'Outfall  Varthur Channel',
    tagSubtitle: 'Overflow Backflow Guard',
    lat: 12.9431,
    lng: 77.7470,
    role: 'infra',
    zone: 'East',
  },
  {
    id: 'itpl-hub',
    name: 'Whitefield ITPL Response Hub',
    tagTitle: 'East  Whitefield ITPL',
    tagSubtitle: 'Auxiliary Communication Node',
    lat: 12.9850,
    lng: 77.7490,
    role: 'infra',
    zone: 'East',
  },

  // SOUTH ZONE (Silk Board / Bommanahalli / Electronic City)
  {
    id: 'silkboard-hub',
    name: 'Silk Board Junction Staging Hub A',
    tagTitle: 'From  Silk Board Hub A',
    tagSubtitle: '4 ALS 4x4 Ambulances • 3 Boats',
    lat: 12.9177,
    lng: 77.6238,
    role: 'origin',
    zone: 'South',
  },
  {
    id: 'koramangala-pump',
    name: 'Koramangala Stormwater Pumping Station',
    tagTitle: 'Hydro  Koramangala Pumps',
    tagSubtitle: '12,000 LPM • 124% Overload',
    lat: 12.9380,
    lng: 77.6280,
    role: 'infra',
    zone: 'South',
  },
  {
    id: 'ecity-toll',
    name: 'Electronic City Flyover Ingress',
    tagTitle: 'Transit  E-City Expressway',
    tagSubtitle: 'Elevated Rapid Transit Corridor',
    lat: 12.8450,
    lng: 77.6650,
    role: 'transit',
    zone: 'South',
  },

  // NORTH ZONE (Hebbal / Yelahanka / Airport Expressway)
  {
    id: 'hebbal-hub',
    name: 'Hebbal Flyover Staging Hub B',
    tagTitle: 'North  Hebbal Hub B',
    tagSubtitle: '3 High-Clearance Rescue Units',
    lat: 13.0358,
    lng: 77.5920,
    role: 'origin',
    zone: 'North',
  },
  {
    id: 'manyata-gate',
    name: 'Manyata Tech Park Sump Gate',
    tagTitle: 'Drainage  Manyata Outfall',
    tagSubtitle: 'Telemetry Active • 85% Capacity',
    lat: 13.0480,
    lng: 77.6190,
    role: 'infra',
    zone: 'North',
  },

  // CENTRAL ZONE (Vidhana Soudha / MG Road / Majestic)
  {
    id: 'central-command',
    name: 'Vidhana Soudha Civic Command Core',
    tagTitle: 'Core  Vidhana Soudha',
    tagSubtitle: 'Municipal A2A Orchestrator Core',
    lat: 12.9750,
    lng: 77.5900,
    role: 'origin',
    zone: 'Central',
  },
  {
    id: 'ulsoor-gate',
    name: 'Ulsoor Lake Water Retention Gate',
    tagTitle: 'Hydro  Ulsoor Sluice',
    tagSubtitle: 'Controlled Spillway Flow',
    lat: 12.9820,
    lng: 77.6200,
    role: 'infra',
    zone: 'Central',
  },

  // WEST ZONE (Peenya / Mysore Road)
  {
    id: 'peenya-hub',
    name: 'Peenya Industrial Response Staging',
    tagTitle: 'West  Peenya Staging Hub',
    tagSubtitle: 'Industrial Emergency Base',
    lat: 13.0280,
    lng: 77.5250,
    role: 'origin',
    zone: 'West',
  },
];

// Detour trajectory coordinates (Silk Board to Bellandur via HAL Airport Road)
const DETOUR_COORDS: [number, number][] = [
  [12.9177, 77.6238], // Silk Board Hub A
  [12.9350, 77.6320], // Koramangala Ingress
  [12.9520, 77.6480], // Domlur / Intermediate Ring Road
  [12.9600, 77.6650], // Old Airport Road Bypass
  [12.9580, 77.6850], // HAL Elevation Corridor
  [12.9560, 77.6980], // Marathahalli ORR
  [12.9420, 77.6820], // Devarabeesanahalli Elevated Slip
  [12.9333, 77.6690], // Bellandur Spillway Bridge
];

// Bellandur Spillway Flood Polygon coordinates
const FLOOD_POLYGON_COORDS: [number, number][] = [
  [12.9300, 77.6620],
  [12.9360, 77.6650],
  [12.9385, 77.6690],
  [12.9370, 77.6740],
  [12.9330, 77.6780],
  [12.9290, 77.6720],
  [12.9280, 77.6650],
];

export function TacticalMap({ selectedSectorId, onSelectSector }: TacticalMapProps) {
  const { metrics, activeScenario } = useDemo();
  const currentScenario = SCENARIO_PRESETS[activeScenario] || SCENARIO_PRESETS['bellandur-flood'];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const vehicleMarkerRef = useRef<any>(null);
  const hazardPolygonRef = useRef<any>(null);
  const detourPolylineRef = useRef<any>(null);

  const [viewMode, setViewMode] = useState<'city' | 'corridor'>('corridor');
  const [isMapReady, setIsMapReady] = useState(false);

  const isResolved = metrics.activeIncidents === 0;
  const selectedNode = BENGALURU_NODES.find((n) => n.id === selectedSectorId) || BENGALURU_NODES[0];

  // Initialize real Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load Leaflet on client side
    import('leaflet')
      .then((module) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Prevent re-initialization
        if (mapInstanceRef.current) return;

        const L = (module as any).default || module;
        if (!L || typeof L.map !== 'function') {
          console.error('Leaflet failed to load L.map', L);
          return;
        }

        const map = L.map(mapContainerRef.current, {
          center: currentScenario.center,
          zoom: currentScenario.zoom,
          zoomControl: false,
          attributionControl: false,
        });

      mapInstanceRef.current = map;

      // 100% Free / Open-Source GIS Layers (No API Key required, zero watermarks)
      // Esri World Dark Gray Base & Reference layers
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          attribution: 'Esri, DeLorme, NAVTEQ',
        }
      ).addTo(map);

      // Dark Gray Street & District Reference Overlay
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          opacity: 0.8,
        }
      ).addTo(map);

      // 1. Initial Hazard Inundation Polygon (Scenario reactive)
      hazardPolygonRef.current = L.polygon(currentScenario.hazardPolygon, {
        color: isResolved ? '#10B981' : '#EF4444',
        weight: 2,
        opacity: 0.8,
        fillColor: isResolved ? '#10B981' : '#EF4444',
        fillOpacity: 0.25,
        dashArray: '6, 6',
      }).addTo(map);

      // 2. Initial Emergency Detour Trajectory Polyline (Scenario reactive)
      detourPolylineRef.current = L.polyline(currentScenario.detourCoords, {
        color: '#38BDF8',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '10, 6',
      }).addTo(map);

      // 3. Moving Emergency Vehicle Marker
      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-icon',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #0B0D13;
            border: 2px solid #38BDF8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="font-size: 11px; font-weight: bold; color: #38BDF8;">4x4</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const vehicleMarker = L.marker(DETOUR_COORDS[0], { icon: vehicleIcon }).addTo(map);
      vehicleMarkerRef.current = vehicleMarker;

      // 4. Civic Node Markers
      markersMapRef.current.clear();
      BENGALURU_NODES.forEach((node) => {
        const isHazard = node.isHazard;
        const markerColor = isHazard ? (isResolved ? '#10B981' : '#EF4444') : '#38BDF8';

        const nodeIcon = L.divIcon({
          className: 'custom-node-icon',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="
                position: absolute;
                width: ${isHazard ? '28px' : '20px'};
                height: ${isHazard ? '28px' : '20px'};
                border-radius: 50%;
                background: ${markerColor};
                opacity: 0.25;
              "></div>
              <div style="
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #FFFFFF;
                border: 2px solid ${markerColor};
                box-shadow: 0 0 8px ${markerColor};
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([node.lat, node.lng], { icon: nodeIcon }).addTo(map);
        marker.on('click', () => {
          onSelectSector(node.id);
        });

        // Tooltip
        marker.bindTooltip(`
          <div style="
            background: rgba(12, 14, 20, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #EDEDEF;
            padding: 4px 8px;
            border-radius: 6px;
            font-family: sans-serif;
            font-size: 11px;
            font-weight: 600;
          ">
            ${node.name}
          </div>
        `, {
          permanent: false,
          direction: 'top',
          className: 'leaflet-tactical-tooltip',
          offset: [0, -10],
        });

        markersMapRef.current.set(node.id, marker);
      });

      setIsMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectSector, isResolved]);

  // Re-synchronize map layers, hazard polygon, detour line & camera when activeScenario changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet')
      .then((module) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const L = (module as any).default || module;
        if (!L || typeof L.polygon !== 'function') return;

        // 1. Update Hazard Polygon
        if (hazardPolygonRef.current) {
          map.removeLayer(hazardPolygonRef.current);
        }
      hazardPolygonRef.current = L.polygon(currentScenario.hazardPolygon, {
        color: isResolved ? '#10B981' : '#EF4444',
        weight: 2,
        opacity: 0.8,
        fillColor: isResolved ? '#10B981' : '#EF4444',
        fillOpacity: 0.25,
        dashArray: '6, 6',
      }).addTo(map);

      // 2. Update Detour Polyline
      if (detourPolylineRef.current) {
        map.removeLayer(detourPolylineRef.current);
      }
      detourPolylineRef.current = L.polyline(currentScenario.detourCoords, {
        color: '#38BDF8',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '10, 6',
      }).addTo(map);

      // 3. Smooth flyTo scenario center & zoom
      map.flyTo(currentScenario.center, currentScenario.zoom, {
        animate: true,
        duration: 1.2,
      });

      // 4. Reset vehicle marker to start coordinate of detour
      if (vehicleMarkerRef.current && currentScenario.detourCoords.length > 0) {
        vehicleMarkerRef.current.setLatLng(currentScenario.detourCoords[0]);
      }
    });
  }, [activeScenario, isMapReady, isResolved]);

  // Animate the vehicle along the active scenario's detour path
  useEffect(() => {
    if (!isMapReady || !vehicleMarkerRef.current) return;

    let step = 0;
    const coords = currentScenario.detourCoords;
    const interval = setInterval(() => {
      if (!coords || coords.length === 0) return;
      step = (step + 1) % coords.length;
      const targetCoord = coords[step];
      vehicleMarkerRef.current.setLatLng(targetCoord);
    }, 1800);

    return () => clearInterval(interval);
  }, [isMapReady, activeScenario]);

  // Center on selected sector with smooth flying animation and open tooltip
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const selected = BENGALURU_NODES.find((n) => n.id === selectedSectorId);
    if (selected) {
      mapInstanceRef.current.flyTo([selected.lat, selected.lng], 14, {
        animate: true,
        duration: 0.9,
      });

      markersMapRef.current.forEach((marker, id) => {
        if (id === selected.id) {
          marker.openTooltip();
        } else {
          marker.closeTooltip();
        }
      });
    }
  }, [selectedSectorId, isMapReady]);

  // View Mode: Macro vs Corridor
  const handleToggleViewMode = (mode: 'city' | 'corridor') => {
    setViewMode(mode);
    if (!mapInstanceRef.current) return;

    if (mode === 'city') {
      mapInstanceRef.current.flyTo([12.9716, 77.5946], 11, {
        animate: true,
        duration: 1.2,
      });
    } else {
      mapInstanceRef.current.flyTo(currentScenario.center, currentScenario.zoom, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(currentScenario.center, currentScenario.zoom, {
        animate: true,
        duration: 1,
      });
      setViewMode('corridor');
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl bg-[#080A0F] border border-white/[0.08] overflow-hidden shadow-2xl select-none flex flex-col font-sans">
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* View Mode Toggle Pill (Top Left) */}
      <div className="absolute top-3 left-3 flex items-center bg-[#0C0E15]/90 backdrop-blur-md p-1 rounded-xl border border-white/[0.08] z-10 shadow-xl">
        <button
          onClick={() => handleToggleViewMode('city')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'city'
              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
              : 'text-[#8E8EA0] hover:text-white'
          }`}
        >
          <GlobeIcon className="w-3.5 h-3.5" />
          <span>Greater Bengaluru (Macro)</span>
        </button>
        <button
          onClick={() => handleToggleViewMode('corridor')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'corridor'
              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
              : 'text-[#8E8EA0] hover:text-white'
          }`}
        >
          <TargetIcon className="w-3.5 h-3.5" />
          <span>Corridor Focus (Micro)</span>
        </button>
      </div>

      {/* Tactical Focus HUD Pill (Bottom Left, adjacent to zoom controls) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-36 hidden md:flex items-center gap-2 bg-[#0C0E15]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 z-10 shadow-xl font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[#71717A] uppercase text-[10px]">FOCUS:</span>
          <span className="text-white font-bold truncate max-w-[130px] lg:max-w-[190px]">{selectedNode.name}</span>
          <span className="text-cyan-400 font-bold hidden xl:inline">[{selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}]</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9.5px]">
            {selectedNode.zone.toUpperCase()}
          </span>
        </div>
      )}

      {/* Center-Anchored Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#0C0E15]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] z-10 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8E8EA0] hover:text-[#EDEDEF] hover:bg-white/10 transition-colors"
          title="Reset Map View"
        >
          <ResetIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Route / Sector Legend Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-[#0C0E15]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-sans z-10 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
          <span className="text-[#EDEDEF] font-bold text-xs">
            {viewMode === 'city'
              ? 'Bengaluru Real-Time Civic Radar'
              : isResolved
              ? `${currentScenario.name} · Mitigated`
              : currentScenario.vehicleLabel}
          </span>
        </div>
        <span className="text-[#71717A] text-[11px] font-mono">
          {viewMode === 'city' ? 'OPEN GIS / ESRI DARK' : currentScenario.detourLabel}
        </span>
      </div>
    </div>
  );
}

export default TacticalMap;
