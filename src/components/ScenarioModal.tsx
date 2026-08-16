import React from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  Layers, 
  Play, 
  X, 
  CheckCircle2, 
  Radio, 
  ShieldAlert, 
  Zap, 
  BatteryLow, 
  RefreshCw, 
  Server
} from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose }) => {
  const loadScenario = useMeshStore(state => state.loadScenario);
  const activeScenarioId = useMeshStore(state => state.activeScenarioId);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 1,
      title: '1. Normal Multi-Hop SOS Delivery & Reverse ACK',
      icon: Radio,
      tag: 'BASELINE PROTOCOL',
      color: 'text-[#879B54] bg-[#879B54]/20 border-[#879B54]/40',
      description: 'Demonstrates end-to-end SOS transmission across multi-hop relays to relief gateway, triggering automatic reverse ACK back to victim node.',
      invariants: ['TTL decrements per hop', 'Deduplication cache active', 'Gateway generates Reverse ACK'],
    },
    {
      id: 2,
      title: '2. Mid-Transit Node Failure & Dynamic Reroute',
      icon: ShieldAlert,
      tag: 'FAULT TOLERANCE',
      color: 'text-[#B84A3A] bg-[#B84A3A]/20 border-[#B84A3A]/40',
      description: 'Injects an emergency packet, simulates an unexpected relay node power failure mid-transit, and demonstrates real-time dynamic rerouting.',
      invariants: ['In-flight hop failure detection', 'Zero packet loss fallback', 'Dynamic neighbor re-evaluation'],
    },
    {
      id: 3,
      title: '3. Heavy Congestion & Priority 0 Preemption',
      icon: Zap,
      tag: 'CONGESTION CONTROL',
      color: 'text-[#D49A3A] bg-[#D49A3A]/20 border-[#D49A3A]/40',
      description: 'Floods node memory queues with background logistics packets (Priority 2), then injects a Critical SOS (Priority 0) demonstrating preemption eviction.',
      invariants: ['Priority 0 preemption over Tier 2', 'Drop-tail buffer safety', 'Node congestion alert state'],
    },
    {
      id: 4,
      title: '4. Low-Battery Avoidance Energy Routing',
      icon: BatteryLow,
      tag: 'ENERGY AWARENESS',
      color: 'text-[#3F8F78] bg-[#3F8F78]/20 border-[#3F8F78]/40',
      description: 'Drains primary corridor relay nodes to 5%, demonstrating how heuristic weight W3 automatically steers packets along healthier battery paths.',
      invariants: ['Heuristic W3 battery penalty', 'Avoidance of dying relays', 'Power-save mode preservation'],
    },
    {
      id: 5,
      title: '5. Store-and-Forward Network Partition Recovery',
      icon: RefreshCw,
      tag: 'DTN STORE & FORWARD',
      color: 'text-[#879B54] bg-[#879B54]/20 border-[#879B54]/40',
      description: 'Simulates complete network partition by reducing range; packets enter non-volatile STORED state until communication links are restored.',
      invariants: ['No packet drops on link collapse', 'Local buffer preservation', 'Automatic forwarding on link restore'],
    },
    {
      id: 6,
      title: '6. Gateway Outage & Egress Failover',
      icon: Server,
      tag: 'GATEWAY HANDOFF',
      color: 'text-[#3F8F78] bg-[#3F8F78]/20 border-[#3F8F78]/40',
      description: 'Takes primary SatCom gateway offline; active packets dynamically discover and hand off traffic to alternate LTE/Drone relief gateways.',
      invariants: ['Gateway status broadcast', 'Multi-gateway heuristic selection', 'Seamless cloud uplink failover'],
    },
  ];

  const handleRunScenario = (id: number) => {
    loadScenario(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A19] border border-[#333b37] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#E8E6DE] font-mono">Pre-Configured Test Scenarios</h2>
              <p className="text-xs text-[#9CA6A0]">One-click test vectors validating disaster mesh protocol innovations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#171A19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Scenarios */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isCurrent = activeScenarioId === `scenario-${sc.id}`;

            return (
              <div
                key={sc.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#242927] border-[#879B54] shadow-lg shadow-[#879B54]/10'
                    : 'bg-[#242927] hover:bg-[#2f3533] border-[#333b37]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border ${sc.color} mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#E8E6DE] text-sm font-mono">{sc.title}</h3>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${sc.color}`}>
                          {sc.tag}
                        </span>
                      </div>
                      <p className="text-[#9CA6A0] text-xs leading-relaxed mb-2">
                        {sc.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {sc.invariants.map((inv, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] text-[#9CA6A0] bg-[#171A19] px-2 py-0.5 rounded border border-[#333b37] font-mono">
                            <CheckCircle2 className="w-3 h-3 text-[#3F8F78]" />
                            {inv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunScenario(sc.id)}
                    className="px-3 py-2 rounded-lg bg-[#879B54] hover:bg-[#748647] text-[#171A19] font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-[#879B54]/20 text-xs transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#171A19]" />
                    <span>Run Scenario</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
