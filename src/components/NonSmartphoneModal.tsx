import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  Smartphone, 
  Send, 
  X, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';

interface NonSmartphoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NonSmartphoneModal: React.FC<NonSmartphoneModalProps> = ({ isOpen, onClose }) => {
  const injectSmsPacket = useMeshStore(state => state.injectSmsPacket);

  const [smsText, setSmsText] = useState<string>('SOS 2 PEOPLE MEDICAL AT 26.91, 75.78');
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const parseSms = (text: string) => {
    const upper = text.toUpperCase();
    
    let type = 'SOS';
    if (upper.includes('MEDICAL')) type = 'MEDICAL';
    else if (upper.includes('TRAPPED')) type = 'TRAPPED';
    else if (upper.includes('EVACUAT')) type = 'EVACUATION';
    else if (upper.includes('WATER')) type = 'WATER';
    else if (upper.includes('FOOD')) type = 'FOOD';

    const victimMatch = upper.match(/(\d+)\s*(PEOPLE|PERSON|VICTIM|SURVIVOR|CASUALT)/);
    const victimCount = victimMatch ? victimMatch[1] : 'Unknown';

    const coordMatch = upper.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    const coords = coordMatch ? { lat: coordMatch[1], lng: coordMatch[2] } : { lat: '26.9124', lng: '75.7873' };

    const hexHeader = '0xAA55';
    const hexType = type === 'SOS' ? '01' : type === 'MEDICAL' ? '02' : type === 'TRAPPED' ? '03' : '04';
    const hexPayload = text.slice(0, 24).split('').map(c => c.charCodeAt(0).toString(16)).join('');
    const binaryFrame = `${hexHeader} [TYPE:${hexType}] [PRIORITY:00] [PAYLOAD:${hexPayload.slice(0, 16)}...] [CRC16:F4B2]`;

    return { type, victimCount, coords, binaryFrame };
  };

  const parsed = parseSms(smsText);

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    injectSmsPacket(smsText, {
      lat: parseFloat(parsed.coords.lat),
      lng: parseFloat(parsed.coords.lng),
    });

    setInjectedSuccess(true);
    setTimeout(() => {
      setInjectedSuccess(false);
      onClose();
    }, 1200);
  };

  const templates = [
    'SOS 2 PEOPLE MEDICAL AT 26.91, 75.78',
    'TRAPPED 4 SURVIVORS ROOF WATER RISING AT 26.93, 75.81',
    'EVACUATION COLLAPSED ROAD NEED TRANSPORT 12 PEOPLE',
    'FOOD WATER REQUEST 25 VICTIMS ISOLATED SCHOOL',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A19] border border-[#333b37] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#E8E6DE] font-mono">Non-Smartphone SMS Gateway Bridge</h2>
              <p className="text-xs text-[#9CA6A0]">Encapsulates 2G/GSM raw SMS into compact LoRa mesh packets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#171A19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Templates */}
          <div>
            <span className="text-[11px] font-semibold text-[#9CA6A0] block mb-1.5 font-mono">Preset Feature-Phone SMS:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSmsText(tpl)}
                  className="p-2 text-left rounded-lg bg-[#242927] hover:bg-[#2f3533] text-[#E8E6DE] font-mono text-[11px] border border-[#333b37] transition-colors truncate"
                >
                  "{tpl}"
                </button>
              ))}
            </div>
          </div>

          {/* SMS Composer */}
          <form onSubmit={handleTransmit} className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#E8E6DE] font-medium">Raw SMS Text Input:</label>
                <span className="text-[11px] font-mono text-[#9CA6A0]">{smsText.length} / 160 chars</span>
              </div>
              <textarea
                rows={3}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full bg-[#242927] border border-[#333b37] rounded-xl p-3 text-[#E8E6DE] font-mono text-xs focus:border-[#879B54] focus:outline-none"
                placeholder="Type raw emergency SMS..."
              />
            </div>

            {/* Real-time Gateway NLP Parsing Matrix */}
            <div className="p-3 rounded-xl bg-[#242927] border border-[#333b37] space-y-2.5">
              <span className="font-semibold text-[#879B54] text-xs flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-[#879B54]" />
                Live SMS Decoder & Binary Encapsulation:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#171A19] p-2 rounded-lg border border-[#333b37]">
                  <span className="text-[10px] text-[#9CA6A0] uppercase block font-mono">Extracted Intent</span>
                  <span className="font-bold text-[#B84A3A] font-mono text-xs">{parsed.type}</span>
                </div>

                <div className="bg-[#171A19] p-2 rounded-lg border border-[#333b37]">
                  <span className="text-[10px] text-[#9CA6A0] uppercase block font-mono">Victims Detected</span>
                  <span className="font-bold text-[#D49A3A] font-mono text-xs">{parsed.victimCount}</span>
                </div>

                <div className="bg-[#171A19] p-2 rounded-lg border border-[#333b37]">
                  <span className="text-[10px] text-[#9CA6A0] uppercase block font-mono">Geo Coordinates</span>
                  <span className="font-mono text-[#E8E6DE] text-[11px]">{parsed.coords.lat}, {parsed.coords.lng}</span>
                </div>
              </div>

              <div className="bg-[#171A19] p-2 rounded-lg border border-[#333b37] font-mono text-[10px] text-[#9CA6A0]">
                <span className="text-[#9CA6A0] block mb-0.5 font-sans font-semibold">LoRa Compact Packet Frame (48 Bytes):</span>
                <span className="text-[#879B54]">{parsed.binaryFrame}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={injectedSuccess}
              className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs ${
                injectedSuccess
                  ? 'bg-[#3F8F78] text-[#171A19]'
                  : 'bg-[#879B54] hover:bg-[#748647] text-[#171A19]'
              }`}
            >
              {injectedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SMS Injected into Nearest Mesh Node!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit via SMS Gateway Bridge</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
