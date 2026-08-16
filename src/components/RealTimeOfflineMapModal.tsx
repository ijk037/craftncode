import React from 'react';
import { 
  X, 
  Radio, 
  HeartPulse, 
  CheckCircle2, 
  Navigation, 
  Truck
} from 'lucide-react';
import { RealTimeLeafletMap } from './RealTimeLeafletMap';

interface RealTimeOfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealTimeOfflineMapModal: React.FC<RealTimeOfflineMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A19] text-[#E8E6DE] border border-[#333b37] rounded-2xl max-w-6xl w-full overflow-hidden shadow-2xl flex flex-col h-[92vh] font-sans">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#242927] border-b border-[#333b37] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3F8F78] text-[#171A19] flex items-center justify-center shadow-md font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-[#E8E6DE] font-mono">
                  Real-Time Offline GPS & Mesh Map
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F8F78] animate-ping" />
                  Live GIS Satellite Engine
                </span>
              </div>
              <p className="text-xs text-[#9CA6A0] flex items-center gap-1.5 mt-0.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F78]" />
                <span>Leaflet.js + Hardware GPS WatchPosition (0 KB Cellular / Internet Required)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#333b37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Leaflet Map + Live Telemetry Dock */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Leaflet Map Engine */}
          <div className="flex-1 relative border-b md:border-b-0 md:border-r border-[#333b37] flex flex-col min-h-[360px]">
            <RealTimeLeafletMap />
          </div>

          {/* Right Sidebar: Real-Time Radio Nodes & Telemetry Feed */}
          <div className="w-full md:w-80 bg-[#171A19] flex flex-col justify-between overflow-y-auto user-scrollbar p-4 space-y-4 shrink-0 font-mono text-xs">
            
            {/* Live Mesh Radio Status */}
            <div className="p-3.5 rounded-xl bg-[#242927] border border-[#333b37] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#333b37] pb-2">
                <span className="text-xs font-bold text-[#879B54] uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  Mesh Radio Telemetry
                </span>
                <span className="text-[10px] bg-[#3F8F78]/20 text-[#3F8F78] px-1.5 py-0.5 rounded font-bold">
                  4 Nodes Active
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-[#E8E6DE]">
                  <span className="text-[#9CA6A0]">Command Gateway:</span>
                  <span className="font-bold text-[#879B54]">GW-01 (Online)</span>
                </div>
                <div className="flex justify-between items-center text-[#E8E6DE]">
                  <span className="text-[#9CA6A0]">Local Relay Hops:</span>
                  <span className="font-bold">R-01 ➔ R-02 ➔ GW-01</span>
                </div>
                <div className="flex justify-between items-center text-[#E8E6DE]">
                  <span className="text-[#9CA6A0]">Radio Frequencies:</span>
                  <span className="font-bold text-[#D49A3A]">433.175 - 433.925 MHz</span>
                </div>
                <div className="flex justify-between items-center text-[#E8E6DE]">
                  <span className="text-[#9CA6A0]">Packet Success Rate:</span>
                  <span className="font-bold text-[#3F8F78]">99.4% (LoRa SF7)</span>
                </div>
              </div>
            </div>

            {/* Active Moving Responders */}
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold text-[#E8E6DE] uppercase tracking-wider block">
                Active Ground Responders
              </span>

              <div className="space-y-2">
                {/* Squad 1 */}
                <div className="p-3 rounded-xl bg-[#242927] border border-[#879B54]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#879B54] text-[#171A19] flex items-center justify-center font-bold">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#E8E6DE]">NDRF Squad #1</h4>
                        <span className="text-[10px] text-[#9CA6A0]">Mobile Extraction Unit</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#879B54] bg-[#879B54]/15 px-1.5 py-0.5 rounded">
                      En Route
                    </span>
                  </div>
                  <div className="text-[10px] text-[#9CA6A0] pt-1 border-t border-[#333b37] flex justify-between">
                    <span>Speed: 18 km/h</span>
                    <span>ETA to Sector 4: 8 mins</span>
                  </div>
                </div>

                {/* Squad 2 */}
                <div className="p-3 rounded-xl bg-[#242927] border border-[#333b37] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#3F8F78] text-[#171A19] flex items-center justify-center font-bold">
                        <HeartPulse className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#E8E6DE]">Paramedic Unit 4</h4>
                        <span className="text-[10px] text-[#9CA6A0]">Civil Hospital Base</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#3F8F78] bg-[#3F8F78]/15 px-1.5 py-0.5 rounded">
                      Stationary
                    </span>
                  </div>
                  <div className="text-[10px] text-[#9CA6A0] pt-1 border-t border-[#333b37] flex justify-between">
                    <span>Blood Bank: Available</span>
                    <span>Triage Capacity: 45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Satellite Reassurance */}
            <div className="p-3 bg-[#242927] rounded-xl border border-[#333b37] text-[10px] text-[#9CA6A0] leading-relaxed">
              <span className="font-bold text-[#3F8F78] block mb-0.5">🛰️ Zero Internet Architecture:</span>
              Leaflet renders pre-cached vector tiles directly from local device storage while your hardware GPS satellite receiver tracks your exact position in real time.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
