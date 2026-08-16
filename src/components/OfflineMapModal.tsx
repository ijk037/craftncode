import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Compass, 
  Navigation, 
  ShieldCheck, 
  Droplets, 
  HeartPulse, 
  Home, 
  CheckCircle2
} from 'lucide-react';

interface Shelter {
  id: string;
  name: string;
  type: 'EVACUATION_CAMP' | 'MEDICAL_BASE' | 'WATER_FOOD_DEPOT';
  distanceKm: number;
  bearing: string;
  bearingDeg: number;
  capacityStatus: 'OPEN' | 'LIMITED' | 'FULL';
  supplies: string[];
  radioFreq: string;
  locationNote: string;
}

const SHELTERS: Shelter[] = [
  {
    id: 'sh-1',
    name: 'Sector 4 Civic Stadium Evacuation Camp',
    type: 'EVACUATION_CAMP',
    distanceKm: 1.2,
    bearing: 'Northeast',
    bearingDeg: 42,
    capacityStatus: 'OPEN',
    supplies: ['Emergency Tents', 'Power Generator', 'Dry Food Rations', 'LoRa Relief Node #GW-1'],
    radioFreq: 'Channel 1 (433.175 MHz)',
    locationNote: 'Stadium Gate 3, elevated concrete concourse'
  },
  {
    id: 'sh-2',
    name: 'North Central High School Emergency Medical Base',
    type: 'MEDICAL_BASE',
    distanceKm: 2.4,
    bearing: 'West-Northwest',
    bearingDeg: 295,
    capacityStatus: 'OPEN',
    supplies: ['Trauma Surgeons', 'Antibiotics & Sterile Bandages', 'Blood Pressure Monitors', 'Relay #R-04'],
    radioFreq: 'Channel 3 (433.550 MHz)',
    locationNote: 'Gymnasium & Indoor Basketball Court'
  },
  {
    id: 'sh-3',
    name: 'Municipal Water Tower Relief & Supply Depot',
    type: 'WATER_FOOD_DEPOT',
    distanceKm: 0.85,
    bearing: 'South',
    bearingDeg: 185,
    capacityStatus: 'OPEN',
    supplies: ['Potable Drinking Water (10,000L)', 'MRE Food Packs', 'Flashlight Batteries'],
    radioFreq: 'Channel 2 (433.300 MHz)',
    locationNote: 'Water Works Distribution Yard'
  }
];

interface OfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineMapModal: React.FC<OfflineMapModalProps> = ({ isOpen, onClose }) => {
  const [selectedShelterId, setSelectedShelterId] = useState<string>(SHELTERS[0].id);

  if (!isOpen) return null;

  const selectedShelter = SHELTERS.find(s => s.id === selectedShelterId) || SHELTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F5F3EE] text-[#252826] border border-[#d8d1c3] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col h-[90vh] font-sans">
        
        {/* Header */}
        <div className="p-4 bg-[#E9E5DC] border-b border-[#d8d1c3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-[#8da999]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-[#173F35] font-mono">
                  Offline Disaster Map & Relief Shelters
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20">
                  Pre-Cached Vector Grid
                </span>
              </div>
              <p className="text-xs text-[#6F8F7D] flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#173F35]" />
                <span>12.8 MB Vector Geometry Saved Locally • GPS Hardware Direct</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F8F7D] hover:text-[#173F35] hover:bg-[#ded8cd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Interactive Vector Map Canvas Simulation */}
          <div className="flex-1 relative bg-[#E9E5DC] border-b md:border-b-0 md:border-r border-[#d8d1c3] p-4 flex flex-col justify-between overflow-hidden">
            
            {/* SVG Visual Offline Topography Map */}
            <div className="relative w-full flex-1 rounded-xl bg-[#ded8cd] border border-[#cfc8bc] overflow-hidden flex items-center justify-center shadow-inner min-h-[260px]">
              
              {/* Contour Grid Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#6F8F7D" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Topographic Elevation Contours */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 300">
                <path d="M 50 150 Q 150 50 250 120 T 380 200" fill="none" stroke="#173F35" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 30 220 Q 120 180 200 240 T 360 270" fill="none" stroke="#173F35" strokeWidth="1.5" />
                <path d="M 80 80 Q 200 20 300 80 T 390 140" fill="none" stroke="#173F35" strokeWidth="1.5" />
              </svg>

              {/* Your Location Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="relative">
                  <span className="w-5 h-5 rounded-full bg-[#C65D32] border-2 border-white flex items-center justify-center shadow-md animate-pulse" />
                  <span className="absolute -inset-2 rounded-full border border-[#C65D32] animate-ping opacity-60" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-[#173F35] text-[#F5F3EE] text-[10px] font-mono font-bold shadow">
                  YOU ARE HERE
                </span>
              </div>

              {/* Shelter 1 Pin (NE) */}
              <div 
                onClick={() => setSelectedShelterId('sh-1')}
                className="absolute top-[22%] right-[25%] flex flex-col items-center cursor-pointer z-10 hover:scale-110 transition-transform"
              >
                <div className={`p-1.5 rounded-full shadow-lg border-2 ${
                  selectedShelterId === 'sh-1' ? 'bg-[#173F35] text-white border-[#C65D32]' : 'bg-[#F5F3EE] text-[#173F35] border-[#d8d1c3]'
                }`}>
                  <Home className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold bg-[#E9E5DC] px-1.5 py-0.5 rounded border border-[#d8d1c3] mt-0.5">
                  Stadium Camp (1.2km)
                </span>
              </div>

              {/* Shelter 2 Pin (WNW) */}
              <div 
                onClick={() => setSelectedShelterId('sh-2')}
                className="absolute top-[32%] left-[18%] flex flex-col items-center cursor-pointer z-10 hover:scale-110 transition-transform"
              >
                <div className={`p-1.5 rounded-full shadow-lg border-2 ${
                  selectedShelterId === 'sh-2' ? 'bg-[#173F35] text-white border-[#C65D32]' : 'bg-[#F5F3EE] text-[#173F35] border-[#d8d1c3]'
                }`}>
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold bg-[#E9E5DC] px-1.5 py-0.5 rounded border border-[#d8d1c3] mt-0.5">
                  Medical Base (2.4km)
                </span>
              </div>

              {/* Shelter 3 Pin (S) */}
              <div 
                onClick={() => setSelectedShelterId('sh-3')}
                className="absolute bottom-[18%] left-[45%] flex flex-col items-center cursor-pointer z-10 hover:scale-110 transition-transform"
              >
                <div className={`p-1.5 rounded-full shadow-lg border-2 ${
                  selectedShelterId === 'sh-3' ? 'bg-[#173F35] text-white border-[#C65D32]' : 'bg-[#F5F3EE] text-[#173F35] border-[#d8d1c3]'
                }`}>
                  <Droplets className="w-4 h-4 text-[#3F8F78]" />
                </div>
                <span className="text-[9px] font-bold bg-[#E9E5DC] px-1.5 py-0.5 rounded border border-[#d8d1c3] mt-0.5">
                  Water Depot (0.85km)
                </span>
              </div>

              {/* Live Bearing Compass HUD Overlay */}
              <div className="absolute top-3 right-3 bg-[#F5F3EE]/90 backdrop-blur-sm border border-[#d8d1c3] rounded-xl p-2 flex items-center gap-2 text-xs shadow-sm">
                <Compass 
                  className="w-5 h-5 text-[#C65D32] transition-transform duration-500" 
                  style={{ transform: `rotate(${selectedShelter.bearingDeg}deg)` }}
                />
                <div>
                  <span className="text-[10px] text-[#6F8F7D] font-mono block">Bearing to target</span>
                  <span className="font-bold text-[#173F35] font-mono">{selectedShelter.bearingDeg}° {selectedShelter.bearing}</span>
                </div>
              </div>
            </div>

            {/* Offline GPS Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-[#6F8F7D] font-mono">
              <span>GPS Fix: 26.9124° N, 75.7873° E</span>
              <span>Elevation: 430m MSL</span>
            </div>
          </div>

          {/* Right: Shelter Directory & Route Information */}
          <div className="w-full md:w-80 bg-[#F5F3EE] p-4 flex flex-col justify-between overflow-y-auto space-y-4 user-scrollbar">
            
            <div>
              <h3 className="text-xs font-bold text-[#173F35] uppercase tracking-wider font-mono mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C65D32]" />
                Verified Relief Bases ({SHELTERS.length})
              </h3>

              {/* Shelter Selection List */}
              <div className="space-y-2">
                {SHELTERS.map(sh => {
                  const isSelected = sh.id === selectedShelter.id;
                  return (
                    <button
                      key={sh.id}
                      onClick={() => setSelectedShelterId(sh.id)}
                      className={`w-full p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#E9E5DC] border-[#173F35] shadow-sm'
                          : 'bg-[#E9E5DC]/60 hover:bg-[#E9E5DC] border-[#d8d1c3]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#173F35] truncate">{sh.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#C65D32] ml-2 shrink-0">
                          {sh.distanceKm} km
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6F8F7D] flex items-center justify-between mt-1">
                        <span>Heading: {sh.bearing}</span>
                        <span className="text-[#3F8F78] font-bold text-[10px]">{sh.capacityStatus}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Shelter Details Card */}
            <div className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="font-bold text-[#173F35] border-b border-[#d8d1c3] pb-1.5 flex items-center justify-between">
                <span>Shelter Resources</span>
                <span className="font-mono text-[10px] text-[#C65D32]">{selectedShelter.radioFreq}</span>
              </div>

              <div className="space-y-1 text-[11px] text-[#252826]">
                <div className="text-[#6F8F7D] italic mb-1">"{selectedShelter.locationNote}"</div>
                {selectedShelter.supplies.map((sup, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[#173F35]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3F8F78] shrink-0" />
                    <span>{sup}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
