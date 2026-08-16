import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  Navigation, 
  ShieldCheck, 
  HeartPulse, 
  Home, 
  CheckCircle2
} from 'lucide-react';
import { IndiaVectorMap, INDIA_RELIEF_HUBS } from './IndiaVectorMap';

interface OfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineMapModal: React.FC<OfflineMapModalProps> = ({ isOpen, onClose }) => {
  const [selectedHubId, setSelectedHubId] = useState<string>(INDIA_RELIEF_HUBS[0].id);

  if (!isOpen) return null;

  const selectedHub = INDIA_RELIEF_HUBS.find(s => s.id === selectedHubId) || INDIA_RELIEF_HUBS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F5F3EE] text-[#252826] border border-[#d8d1c3] rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col h-[92vh] font-sans">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#E9E5DC] border-b border-[#d8d1c3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-[#8da999]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-[#173F35] font-mono">
                  Offline Disaster Topography Map (India)
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20">
                  Zero-Internet Vector Grid
                </span>
              </div>
              <p className="text-xs text-[#6F8F7D] flex items-center gap-1.5 mt-0.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#173F35]" />
                <span>Pre-Cached India Territory & Relief Hubs • Hardware GPS Direct</span>
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

        {/* Modal Body: Map + Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Full Interactive Offline India Vector Map */}
          <div className="flex-1 relative border-b md:border-b-0 md:border-r border-[#d8d1c3] flex flex-col min-h-[350px]">
            <IndiaVectorMap
              selectedHubId={selectedHubId}
              onSelectHub={(hub) => setSelectedHubId(hub.id)}
              userLat={26.9124}
              userLng={75.7873}
            />
          </div>

          {/* Right: Shelter / Relief Hub Information & Navigation HUD */}
          <div className="w-full md:w-96 bg-[#F5F3EE] flex flex-col justify-between overflow-y-auto user-scrollbar p-4 space-y-4 shrink-0">
            
            {/* Live Compass & Navigation Card */}
            <div className="p-4 rounded-xl bg-[#E9E5DC] border border-[#d8d1c3] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173F35] font-mono flex items-center gap-1.5 uppercase">
                  <Compass className="w-4 h-4 text-[#C65D32]" />
                  Live Navigation Vector
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#173F35] text-[#F5F3EE]">
                  {selectedHub.bearingText} ({selectedHub.bearingDeg}°)
                </span>
              </div>

              {/* Compass Bearing Visual */}
              <div className="flex items-center gap-4 bg-[#F5F3EE] p-3 rounded-xl border border-[#d8d1c3]">
                <div className="relative w-14 h-14 rounded-full border-2 border-[#173F35] flex items-center justify-center shrink-0 bg-[#E9E5DC]">
                  <span className="absolute top-0.5 text-[8px] font-bold text-[#173F35] font-mono">N</span>
                  <span className="absolute bottom-0.5 text-[8px] font-bold text-[#6F8F7D] font-mono">S</span>
                  <span className="absolute left-1 text-[8px] font-bold text-[#6F8F7D] font-mono">W</span>
                  <span className="absolute right-1 text-[8px] font-bold text-[#6F8F7D] font-mono">E</span>
                  
                  {/* Rotating Arrow Needle pointing directly to target */}
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${selectedHub.bearingDeg}deg)` }}
                  >
                    <div className="w-1 h-5 bg-[#C65D32] rounded-t-full shadow" />
                    <div className="w-1 h-5 bg-[#6F8F7D] rounded-b-full opacity-40" />
                  </div>
                </div>

                <div className="text-xs space-y-0.5 font-mono">
                  <span className="text-[10px] text-[#6F8F7D] uppercase block">Direct Line of Sight</span>
                  <p className="text-base font-bold text-[#173F35]">
                    {selectedHub.distanceFromUserKm < 5 ? `${selectedHub.distanceFromUserKm.toFixed(1)} km` : `${Math.round(selectedHub.distanceFromUserKm)} km`}
                  </p>
                  <p className="text-[10px] text-[#5c635f]">
                    Radio Channel: <strong className="text-[#173F35]">{selectedHub.radioChannel}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Relief Bases Across India */}
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold text-[#173F35] font-mono uppercase tracking-wider block">
                Disaster Relief Hubs ({INDIA_RELIEF_HUBS.length})
              </span>

              <div className="space-y-2">
                {INDIA_RELIEF_HUBS.map((hub) => {
                  const isSelected = hub.id === selectedHubId;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedHubId(hub.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E9E5DC] border-[#173F35] shadow-md'
                          : 'bg-[#F5F3EE] hover:bg-[#E9E5DC]/60 border-[#d8d1c3] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            hub.type === 'COMMAND_HQ' ? 'bg-[#A83F35] text-white' :
                            hub.type === 'MEDICAL_BASE' ? 'bg-[#173F35] text-white' :
                            'bg-[#6F8F7D] text-white'
                          }`}>
                            {hub.type === 'COMMAND_HQ' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                             hub.type === 'MEDICAL_BASE' ? <HeartPulse className="w-3.5 h-3.5" /> :
                             <Home className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#252826] leading-tight font-mono">{hub.city}</h4>
                            <span className="text-[10px] text-[#6F8F7D]">{hub.state}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#173F35]/10 text-[#173F35]">
                          {hub.distanceFromUserKm < 5 ? `${hub.distanceFromUserKm.toFixed(1)} km` : `${Math.round(hub.distanceFromUserKm)} km`}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#252826] mt-2 font-medium leading-snug">
                        {hub.name}
                      </p>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-[#d8d1c3] space-y-1.5 text-[10px] font-mono">
                          <div className="flex justify-between text-[#5c635f]">
                            <span>Capacity:</span>
                            <span className="font-bold text-[#173F35]">{hub.capacity}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hub.supplies.map((supp, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-[#F5F3EE] border border-[#d8d1c3] text-[9px] text-[#5c635f]">
                                {supp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offline GPS Hardware Reassurance */}
            <div className="p-3 bg-[#E9E5DC] rounded-xl border border-[#d8d1c3] text-[10px] text-[#6F8F7D] leading-relaxed font-mono">
              <span className="font-bold text-[#173F35] block mb-0.5">100% Offline Standalone Operation:</span>
              Vector geometries are rendered from local hardware cache. GPS fix operates autonomously via satellite receiver with 0 KB cellular connection.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
