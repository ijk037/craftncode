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
      color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
      description: 'Demonstrates end-to-end SOS transmission across multi-hop relays to relief gateway, triggering automatic reverse ACK back to victim node.',
      invariants: ['TTL decrements per hop', 'Deduplication cache active', 'Gateway generates Reverse ACK'],
    },
    {
      id: 2,
      title: '2. Mid-Transit Node Failure & Dynamic Reroute',
      icon: ShieldAlert,
      tag: 'FAULT TOLERANCE',
      color: 'text-red-400 bg-red-500/20 border-red-500/30',
      description: 'Injects an emergency packet, simulates an unexpected relay node power failure mid-transit, and demonstrates real-time dynamic rerouting.',
      invariants: ['In-flight hop failure detection', 'Zero packet loss fallback', 'Dynamic neighbor re-evaluation'],
    },
    {
      id: 3,
      title: '3. Heavy Congestion & Priority 0 Preemption',
      icon: Zap,
      tag: 'CONGESTION CONTROL',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      description: 'Floods node memory queues with background logistics packets (Priority 2), then injects a Critical SOS (Priority 0) demonstrating preemption eviction.',
      invariants: ['Priority 0 preemption over Tier 2', 'Drop-tail buffer safety', 'Node congestion alert state'],
    },
    {
      id: 4,
      title: '4. Low-Battery Avoidance Energy Routing',
      icon: BatteryLow,
      tag: 'ENERGY AWARENESS',
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'Drains primary corridor relay nodes to 5%, demonstrating how heuristic weight W3 automatically steers packets along healthier battery paths.',
      invariants: ['Heuristic W3 battery penalty', 'Avoidance of dying relays', 'Power-save mode preservation'],
    },
    {
      id: 5,
      title: '5. Store-and-Forward Network Partition Recovery',
      icon: RefreshCw,
      tag: 'DTN STORE & FORWARD',
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      description: 'Simulates complete network partition by reducing range; packets enter non-volatile STORED state until communication links are restored.',
      invariants: ['No packet drops on link collapse', 'Local buffer preservation', 'Automatic forwarding on link restore'],
    },
    {
      id: 6,
      title: '6. Gateway Outage & Egress Failover',
      icon: Server,
      tag: 'GATEWAY HANDOFF',
      color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
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
      <div className="bg-[#0b1120] border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pre-Configured Test Scenarios</h2>
              <p className="text-xs text-slate-400">One-click test vectors validating disaster mesh protocol innovations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border ${sc.color} mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-100 text-sm">{sc.title}</h3>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] border ${sc.color}`}>
                          {sc.tag}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-2">
                        {sc.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {sc.invariants.map((inv, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {inv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunScenario(sc.id)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20 text-xs transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
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
