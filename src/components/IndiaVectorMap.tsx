import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  ShieldCheck, 
  Navigation,
  Crosshair
} from 'lucide-react';

export interface IndiaShelterHub {
  id: string;
  name: string;
  state: string;
  city: string;
  type: 'COMMAND_HQ' | 'EVACUATION_CAMP' | 'MEDICAL_BASE' | 'SUPPLY_DEPOT' | 'COASTAL_BASE';
  lat: number;
  lng: number;
  capacity: string;
  radioChannel: string;
  distanceFromUserKm: number;
  bearingDeg: number;
  bearingText: string;
  status: 'ACTIVE' | 'HIGH_CAPACITY' | 'STANDBY';
  supplies: string[];
}

export const INDIA_RELIEF_HUBS: IndiaShelterHub[] = [
  {
    id: 'hub-jpr-1',
    name: 'Sector 4 Civic Stadium Relief Camp (Jaipur)',
    state: 'Rajasthan',
    city: 'Jaipur',
    type: 'EVACUATION_CAMP',
    lat: 26.9124,
    lng: 75.7873,
    capacity: '4,500 Persons (82% Available)',
    radioChannel: 'LoRa Ch 1 (433.175 MHz)',
    distanceFromUserKm: 1.2,
    bearingDeg: 42,
    bearingText: 'Northeast',
    status: 'ACTIVE',
    supplies: ['Potable Water 20,000L', 'MRE Food Packs', 'Emergency Tents', 'LoRa GW #1']
  },
  {
    id: 'hub-del-1',
    name: 'NDRF National Incident Command Centre',
    state: 'Delhi NCR',
    city: 'New Delhi',
    type: 'COMMAND_HQ',
    lat: 28.6139,
    lng: 77.2090,
    capacity: 'National HQ (Strategic Dispatch)',
    radioChannel: 'Tactical UHF 446.000 MHz',
    distanceFromUserKm: 235,
    bearingDeg: 35,
    bearingText: 'Northeast',
    status: 'ACTIVE',
    supplies: ['Air Extraction Fleet', 'SatCom Relays', 'Mobile Surgical Units', 'Heavy Excavators']
  },
  {
    id: 'hub-bom-1',
    name: 'Western Maritime & Coastal Rescue Base',
    state: 'Maharashtra',
    city: 'Mumbai',
    type: 'COASTAL_BASE',
    lat: 19.0760,
    lng: 72.8777,
    capacity: '8,000 Persons (65% Available)',
    radioChannel: 'Marine VHF Ch 16 / LoRa 868 MHz',
    distanceFromUserKm: 920,
    bearingDeg: 195,
    bearingText: 'South-Southwest',
    status: 'ACTIVE',
    supplies: ['Amphibious Zodiac Boats', 'Desalination Units', 'Trauma Field Hospital']
  },
  {
    id: 'hub-blr-1',
    name: 'Peninsular Telemetry & Medical Support Hub',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'MEDICAL_BASE',
    lat: 12.9716,
    lng: 77.5946,
    capacity: '6,200 Persons (90% Available)',
    radioChannel: 'LoRa 865.2 MHz / UHF 434.1 MHz',
    distanceFromUserKm: 1560,
    bearingDeg: 172,
    bearingText: 'South',
    status: 'ACTIVE',
    supplies: ['Blood Plasma Bank', 'ICU Ventilators', 'Solar Battery Stations']
  },
  {
    id: 'hub-ccu-1',
    name: 'Eastern Delta Cyclone & Flood Evacuation Hub',
    state: 'West Bengal',
    city: 'Kolkata',
    type: 'EVACUATION_CAMP',
    lat: 22.5726,
    lng: 88.3639,
    capacity: '12,000 Persons (54% Available)',
    radioChannel: 'LoRa Ch 4 (433.800 MHz)',
    distanceFromUserKm: 1310,
    bearingDeg: 108,
    bearingText: 'East-Southeast',
    status: 'ACTIVE',
    supplies: ['Water Purification Skids', 'High-Raft Inflatables', 'Pediatric Antibiotics']
  },
  {
    id: 'hub-gau-1',
    name: 'Brahmaputra Flood Disaster Response Base',
    state: 'Assam',
    city: 'Guwahati',
    type: 'SUPPLY_DEPOT',
    lat: 26.1445,
    lng: 91.7362,
    capacity: '5,000 Persons (70% Available)',
    radioChannel: 'LoRa Ch 5 (433.925 MHz)',
    distanceFromUserKm: 1620,
    bearingDeg: 88,
    bearingText: 'East',
    status: 'ACTIVE',
    supplies: ['Airdrop Rations', 'Deep Water Rescue Gear', 'Anti-Venom Kits']
  },
  {
    id: 'hub-sxr-1',
    name: 'Himalayan High-Altitude Avalanche & Seismic Base',
    state: 'Jammu & Kashmir',
    city: 'Srinagar',
    type: 'COMMAND_HQ',
    lat: 34.0837,
    lng: 74.7973,
    capacity: '3,000 Persons (88% Available)',
    radioChannel: 'VHF Emergency 145.500 MHz',
    distanceFromUserKm: 810,
    bearingDeg: 352,
    bearingText: 'North-Northwest',
    status: 'ACTIVE',
    supplies: ['Thermal Snow Gear', 'Oxygen Concentrators', 'Seismic Geophones']
  }
];

// Helper to convert geographic Lat/Lng to SVG coordinate frame (India bounds approx: Lat 7-38, Lng 67-98)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLat = 6.5;
  const maxLat = 37.5;
  const minLng = 67.0;
  const maxLng = 98.0;

  const svgWidth = 800;
  const svgHeight = 900;

  const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * svgHeight;

  return { x, y };
}

interface IndiaVectorMapProps {
  selectedHubId: string;
  onSelectHub: (hub: IndiaShelterHub) => void;
  userLat?: number;
  userLng?: number;
}

export const IndiaVectorMap: React.FC<IndiaVectorMapProps> = ({
  selectedHubId,
  onSelectHub,
  userLat = 26.9124,
  userLng = 75.7873,
}) => {
  // Zoom & Pan transforms
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeSector, setActiveSector] = useState<'ALL' | 'NORTH_WEST' | 'NORTH' | 'WEST' | 'EAST' | 'SOUTH' | 'NORTH_EAST'>('ALL');

  const containerRef = useRef<HTMLDivElement | null>(null);

  const userSvg = geoToSvg(userLat, userLng);
  const selectedHub = INDIA_RELIEF_HUBS.find(h => h.id === selectedHubId) || INDIA_RELIEF_HUBS[0];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.35, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveSector('ALL');
  };

  const handleSectorJump = (sector: 'ALL' | 'NORTH_WEST' | 'NORTH' | 'WEST' | 'EAST' | 'SOUTH' | 'NORTH_EAST') => {
    setActiveSector(sector);
    if (sector === 'ALL') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else if (sector === 'NORTH_WEST') {
      // Zoom into Rajasthan / Delhi region
      setZoom(2.2);
      setPan({ x: 120, y: 140 });
    } else if (sector === 'NORTH') {
      // J&K, Ladakh, HP
      setZoom(2.4);
      setPan({ x: 130, y: 320 });
    } else if (sector === 'WEST') {
      // Maharashtra, Gujarat
      setZoom(2.2);
      setPan({ x: 220, y: -40 });
    } else if (sector === 'EAST') {
      // Bengal, Bihar, Odisha
      setZoom(2.2);
      setPan({ x: -160, y: -20 });
    } else if (sector === 'SOUTH') {
      // Karnataka, TN, Kerala
      setZoom(2.2);
      setPan({ x: 80, y: -240 });
    } else if (sector === 'NORTH_EAST') {
      // Assam & NE
      setZoom(2.4);
      setPan({ x: -320, y: 110 });
    }
  };

  // Mouse Drag Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-[#171A19] overflow-hidden select-none flex flex-col font-sans">
      
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Sector Quick Jump Pills */}
        <div className="flex items-center gap-1 bg-[#242927]/90 backdrop-blur-md p-1 rounded-xl border border-[#333b37] pointer-events-auto overflow-x-auto user-scrollbar shadow-lg">
          <span className="text-[10px] font-bold text-[#879B54] px-2 font-mono flex items-center gap-1 shrink-0">
            <Crosshair className="w-3.5 h-3.5" />
            Sector:
          </span>
          {[
            { id: 'ALL', label: '🇮🇳 India Grid' },
            { id: 'NORTH_WEST', label: '📍 Jaipur / NW Sector' },
            { id: 'NORTH', label: '⛰️ J&K / North' },
            { id: 'WEST', label: '🌊 Mumbai / West' },
            { id: 'EAST', label: '🌾 Kolkata / East' },
            { id: 'SOUTH', label: '🌴 South Peninsula' },
            { id: 'NORTH_EAST', label: '🌲 North-East' },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => handleSectorJump(sec.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all shrink-0 ${
                activeSector === sec.id
                  ? 'bg-[#879B54] text-[#171A19] font-bold shadow-sm'
                  : 'text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#333b37]'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Live GPS Fix Badge */}
        <div className="bg-[#242927]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#3F8F78]/40 flex items-center gap-2 pointer-events-auto shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[#3F8F78] animate-ping" />
          <span className="text-[11px] font-mono font-bold text-[#E8E6DE]">
            GPS Fix: {userLat.toFixed(4)}° N, {userLng.toFixed(4)}° E
          </span>
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-[#242927]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#333b37] shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#333b37] transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#333b37] transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#333b37] transition-colors"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Shelter Bearing Overlay Card */}
      {selectedHub && (
        <div className="absolute bottom-4 left-4 z-20 max-w-xs bg-[#242927]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#879B54]/40 shadow-2xl text-xs font-mono">
          <div className="flex items-center justify-between text-[#879B54] mb-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Target Relief Hub
            </span>
            <span className="text-[10px] bg-[#879B54]/20 text-[#879B54] px-1.5 py-0.5 rounded">
              {selectedHub.distanceFromUserKm < 5 ? `${(selectedHub.distanceFromUserKm).toFixed(1)} km (Walk)` : `${Math.round(selectedHub.distanceFromUserKm)} km`}
            </span>
          </div>

          <h4 className="font-bold text-[#E8E6DE] text-xs leading-snug">{selectedHub.name}</h4>
          <p className="text-[10px] text-[#9CA6A0] mt-0.5">{selectedHub.city}, {selectedHub.state}</p>

          <div className="mt-2 pt-2 border-t border-[#333b37] grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-[#9CA6A0] block">Compass Bearing</span>
              <span className="font-bold text-[#E8E6DE] flex items-center gap-1">
                <Navigation 
                  className="w-3 h-3 text-[#3F8F78]" 
                  style={{ transform: `rotate(${selectedHub.bearingDeg}deg)` }}
                />
                {selectedHub.bearingDeg}° {selectedHub.bearingText}
              </span>
            </div>
            <div>
              <span className="text-[#9CA6A0] block">Radio Frequency</span>
              <span className="font-bold text-[#879B54]">{selectedHub.radioChannel}</span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas for Interactive India Map */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full flex-1 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        <svg
          viewBox="0 0 800 900"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          }}
        >
          <defs>
            {/* Topographic Background Grid */}
            <pattern id="india-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#242927" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="user-radar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3F8F78" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3F8F78" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid Pattern */}
          <rect width="800" height="900" fill="url(#india-grid)" />

          {/* Ocean Watermark */}
          <g opacity="0.4" className="text-[10px] font-mono fill-[#6b7771]">
            <text x="120" y="650">ARABIAN SEA (ARAB SAGAR)</text>
            <text x="560" y="650">BAY OF BENGAL (VANGA SAGAR)</text>
            <text x="340" y="860">INDIAN OCEAN (HIND MAHASAGAR)</text>
          </g>

          {/* Latitude & Longitude Reference Lines */}
          <g stroke="#333b37" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6">
            {/* Latitudes */}
            <line x1="40" y1="120" x2="760" y2="120" /> <text x="50" y="115" fill="#6b7771" fontSize="9" fontFamily="monospace">32° N (Himalayan / Kashmir Sector)</text>
            <line x1="40" y1="280" x2="760" y2="280" /> <text x="50" y="275" fill="#6b7771" fontSize="9" fontFamily="monospace">26° N (Jaipur / Delhi / UP Sector)</text>
            <line x1="40" y1="460" x2="760" y2="460" /> <text x="50" y="455" fill="#6b7771" fontSize="9" fontFamily="monospace">20° N (Maharashtra / Odisha Sector)</text>
            <line x1="40" y1="640" x2="760" y2="640" /> <text x="50" y="635" fill="#6b7771" fontSize="9" fontFamily="monospace">14° N (Karnataka / Andhra Sector)</text>
            <line x1="40" y1="800" x2="760" y2="800" /> <text x="50" y="795" fill="#6b7771" fontSize="9" fontFamily="monospace">8° N (Kanyakumari Sector)</text>

            {/* Longitudes */}
            <line x1="160" y1="60" x2="160" y2="860" /> <text x="165" y="875" fill="#6b7771" fontSize="9" fontFamily="monospace">72° E</text>
            <line x1="320" y1="60" x2="320" y2="860" /> <text x="325" y="875" fill="#6b7771" fontSize="9" fontFamily="monospace">78° E</text>
            <line x1="480" y1="60" x2="480" y2="860" /> <text x="485" y="875" fill="#6b7771" fontSize="9" fontFamily="monospace">84° E</text>
            <line x1="640" y1="60" x2="640" y2="860" /> <text x="645" y="875" fill="#6b7771" fontSize="9" fontFamily="monospace">90° E</text>
          </g>

          {/* =========================================================
              ACCURATE VECTOR PATH GEOMETRY OF INDIA TERRITORY
             ========================================================= */}
          <g id="india-landmass">
            {/* Main Landmass Polygon Outline */}
            <path
              d="
                M 215,68
                L 260,60 L 305,65 L 340,95 L 348,135 L 315,160 L 330,195
                L 380,210 L 440,225 L 485,245 L 530,265 L 565,270 L 590,245
                L 640,240 L 685,255 L 720,290 L 710,335 L 675,360 L 635,355
                L 615,385 L 585,395 L 555,365 L 535,395 L 515,445 L 505,495
                L 475,540 L 440,590 L 395,660 L 370,725 L 345,790 L 335,825
                L 325,790 L 310,730 L 285,670 L 265,615 L 245,550 L 225,505
                L 185,490 L 155,475 L 140,430 L 160,390 L 195,385 L 210,350
                L 175,325 L 155,275 L 180,230 L 195,175 L 190,120 L 215,68
                Z
              "
              fill="#1d2220"
              stroke="#879B54"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-colors hover:fill-[#202724]"
            />

            {/* Regional State Division Boundaries (Sub-vectors) */}
            {/* North: J&K / Ladakh / Punjab */}
            <path
              d="M 215,68 L 260,115 L 315,160 L 245,185 L 195,175 Z"
              fill="#242927"
              stroke="#333b37"
              strokeWidth="1.2"
              opacity="0.8"
            />
            {/* North-West: Rajasthan / Gujarat */}
            <path
              d="M 195,175 L 245,185 L 275,275 L 210,350 L 155,275 Z"
              fill="#282f2c"
              stroke="#879B54"
              strokeWidth="1.5"
              opacity="0.9"
            />
            {/* Central / Gangetic: Delhi, UP, MP, Bihar */}
            <path
              d="M 245,185 L 380,210 L 485,245 L 445,365 L 330,360 L 275,275 Z"
              fill="#222725"
              stroke="#333b37"
              strokeWidth="1.2"
            />
            {/* Eastern & Odisha */}
            <path
              d="M 485,245 L 535,395 L 505,495 L 445,365 Z"
              fill="#252b29"
              stroke="#333b37"
              strokeWidth="1.2"
            />
            {/* North-East Corridor: Assam & Seven Sisters */}
            <path
              d="M 565,270 L 685,255 L 720,290 L 675,360 L 585,395 L 565,270 Z"
              fill="#242a27"
              stroke="#333b37"
              strokeWidth="1.2"
            />
            {/* Western Peninsular: Maharashtra & Goa */}
            <path
              d="M 210,350 L 330,360 L 350,490 L 225,505 L 185,490 Z"
              fill="#232926"
              stroke="#333b37"
              strokeWidth="1.2"
            />
            {/* Southern Peninsula: Karnataka, Andhra, TN, Kerala */}
            <path
              d="M 225,505 L 350,490 L 475,540 L 395,660 L 335,825 L 285,670 Z"
              fill="#252c29"
              stroke="#333b37"
              strokeWidth="1.2"
            />
          </g>

          {/* Regional Labels */}
          <g className="fill-[#9CA6A0] text-[11px] font-mono font-bold select-none pointer-events-none opacity-85">
            <text x="245" y="130">JAMMU & KASHMIR</text>
            <text x="180" y="260" fill="#879B54">RAJASTHAN (ACTIVE MESH)</text>
            <text x="280" y="240">DELHI NCR</text>
            <text x="330" y="320">MADHYA PRADESH</text>
            <text x="430" y="290">UTTAR PRADESH / BIHAR</text>
            <text x="615" y="310">ASSAM / NORTH EAST</text>
            <text x="180" y="440">GUJARAT</text>
            <text x="240" y="460">MAHARASHTRA</text>
            <text x="440" y="460">ODISHA</text>
            <text x="270" y="620">KARNATAKA</text>
            <text x="370" y="640">ANDHRA / TELANGANA</text>
            <text x="290" y="760">TAMIL NADU / KERALA</text>
          </g>

          {/* User Location Radar Wave & Pin */}
          <g transform={`translate(${userSvg.x}, ${userSvg.y})`}>
            {/* Pulsing Radar Ring */}
            <circle r="45" fill="url(#user-radar)" className="animate-pulse" />
            <circle r="25" fill="none" stroke="#3F8F78" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3" />
            <circle r="8" fill="#3F8F78" stroke="#171A19" strokeWidth="2" />
            <circle r="3" fill="#E8E6DE" />
            
            {/* User Label Callout */}
            <g transform="translate(14, -10)">
              <rect x="0" y="-12" width="130" height="24" rx="6" fill="#171A19" stroke="#3F8F78" strokeWidth="1.2" />
              <text x="8" y="4" fill="#3F8F78" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ● YOU (CITIZEN FIX)
              </text>
            </g>
          </g>

          {/* Connection Vector Lines between User and Selected Shelter */}
          {selectedHub && (
            (() => {
              const hubSvg = geoToSvg(selectedHub.lat, selectedHub.lng);
              return (
                <g>
                  <line
                    x1={userSvg.x}
                    y1={userSvg.y}
                    x2={hubSvg.x}
                    y2={hubSvg.y}
                    stroke="#879B54"
                    strokeWidth="1.8"
                    strokeDasharray="5 4"
                    opacity="0.8"
                  />
                  {/* Midpoint Distance Tag */}
                  <g transform={`translate(${(userSvg.x + hubSvg.x) / 2}, ${(userSvg.y + hubSvg.y) / 2})`}>
                    <rect x="-35" y="-9" width="70" height="18" rx="4" fill="#171A19" stroke="#879B54" strokeWidth="1" />
                    <text x="0" y="4" fill="#E8E6DE" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      {selectedHub.distanceFromUserKm < 5 ? `${selectedHub.distanceFromUserKm}km` : `${Math.round(selectedHub.distanceFromUserKm)}km`}
                    </text>
                  </g>
                </g>
              );
            })()
          )}

          {/* Plotted India Relief Shelters & Bases */}
          {INDIA_RELIEF_HUBS.map((hub) => {
            const pos = geoToSvg(hub.lat, hub.lng);
            const isSelected = hub.id === selectedHubId;

            return (
              <g
                key={hub.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHub(hub);
                }}
                className="cursor-pointer group"
              >
                {/* Selection Aura */}
                {isSelected && (
                  <circle r="18" fill="none" stroke="#879B54" strokeWidth="2" className="animate-ping" opacity="0.6" />
                )}

                {/* Marker Outer Circle */}
                <circle
                  r={isSelected ? 10 : 7}
                  fill={isSelected ? '#879B54' : '#242927'}
                  stroke={isSelected ? '#E8E6DE' : '#879B54'}
                  strokeWidth="2"
                  className="transition-all group-hover:scale-125"
                />

                {/* Inner Icon Dot */}
                <circle
                  r="3.5"
                  fill={hub.type === 'COMMAND_HQ' ? '#B84A3A' : hub.type === 'MEDICAL_BASE' ? '#3F8F78' : '#E8E6DE'}
                />

                {/* Name Label */}
                <g transform="translate(12, 4)">
                  <rect
                    x="-2"
                    y="-11"
                    width={hub.city.length * 8 + 14}
                    height="18"
                    rx="4"
                    fill="#171A19"
                    stroke={isSelected ? '#879B54' : '#333b37'}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="4"
                    y="2"
                    fill={isSelected ? '#E8E6DE' : '#9CA6A0'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {hub.city}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
};
