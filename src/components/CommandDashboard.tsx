import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import type { MessageType } from '../models/Packet';
import type { IncidentType, IncidentSeverity } from '../models/Incident';
import { DEFAULT_ROUTING_WEIGHTS } from '../simulation/RoutingEngine';
import { 
  AlertOctagon, 
  Flame, 
  Send, 
  Skull, 
  BatteryLow, 
  Radio, 
  Sliders, 
  Zap, 
  RefreshCw, 
  PlusCircle
} from 'lucide-react';

export const CommandDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SOS' | 'DISASTER' | 'CHAOS' | 'STRESS' | 'HEURISTICS'>('SOS');

  // Store
  const nodes = useMeshStore(state => state.nodes);
  const gateways = useMeshStore(state => state.gateways);
  const incidents = useMeshStore(state => state.incidents);
  const weights = useMeshStore(state => state.weights);
  const selectedNodeId = useMeshStore(state => state.selectedNodeId);

  // Actions
  const createPacket = useMeshStore(state => state.createPacket);
  const createIncident = useMeshStore(state => state.createIncident);
  const toggleIncident = useMeshStore(state => state.toggleIncident);
  const clearIncidents = useMeshStore(state => state.clearIncidents);
  const toggleNodeFailure = useMeshStore(state => state.toggleNodeFailure);
  const drainNodeBattery = useMeshStore(state => state.drainNodeBattery);
  const rechargeNodeBattery = useMeshStore(state => state.rechargeNodeBattery);
  const toggleGatewayStatus = useMeshStore(state => state.toggleGatewayStatus);
  const triggerStressTest = useMeshStore(state => state.triggerStressTest);
  const setWeights = useMeshStore(state => state.setWeights);

  // SOS Form state
  const [sosSourceNode, setSosSourceNode] = useState<string>('');
  const [sosType, setSosType] = useState<MessageType>('SOS');
  const [sosPayload, setSosPayload] = useState<string>('Trapped on 2nd floor, 3 survivors, building compromised.');

  // Disaster Form state
  const [disasterType, setDisasterType] = useState<IncidentType>('EARTHQUAKE');
  const [disasterSeverity, setDisasterSeverity] = useState<IncidentSeverity>('HIGH');
  const [disasterName, setDisasterName] = useState<string>('Sector 6 Structural Collapse');
  const [disasterRadius, setDisasterRadius] = useState<number>(140);
  const [disasterRfLoss, setDisasterRfLoss] = useState<number>(0.5);

  const victimNodes = nodes.filter(n => n.type === 'VICTIM');

  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    const source = sosSourceNode || (victimNodes.length > 0 ? victimNodes[0].id : nodes[0]?.id);
    if (!source) return;

    createPacket({
      sourceNodeId: source,
      messageType: sosType,
      payload: sosPayload,
    });
  };

  const handleCreateDisaster = (e: React.FormEvent) => {
    e.preventDefault();
    createIncident({
      type: disasterType,
      name: disasterName,
      epicenterX: Math.round(200 + Math.random() * 500),
      epicenterY: Math.round(150 + Math.random() * 350),
      radius: disasterRadius,
      severity: disasterSeverity,
      active: true,
      description: `Simulated ${disasterType} with ${(disasterRfLoss * 100).toFixed(0)}% RF attenuation.`,
      rfInterferenceFactor: disasterRfLoss,
    });
  };

  const applyWeightPreset = (preset: 'BALANCED' | 'ENERGY' | 'RELIABILITY' | 'SPEED') => {
    switch (preset) {
      case 'BALANCED':
        setWeights({ ...DEFAULT_ROUTING_WEIGHTS });
        break;
      case 'ENERGY':
        setWeights({
          w1GatewayProgress: 25,
          w2LinkQuality: 20,
          w3BatteryHealth: 45,
          w4Reliability: 10,
          w5Congestion: 15,
          w6HopPenalty: 10,
        });
        break;
      case 'RELIABILITY':
        setWeights({
          w1GatewayProgress: 25,
          w2LinkQuality: 40,
          w3BatteryHealth: 15,
          w4Reliability: 35,
          w5Congestion: 20,
          w6HopPenalty: 10,
        });
        break;
      case 'SPEED':
        setWeights({
          w1GatewayProgress: 55,
          w2LinkQuality: 15,
          w3BatteryHealth: 10,
          w4Reliability: 10,
          w5Congestion: 25,
          w6HopPenalty: 25,
        });
        break;
    }
  };

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Dashboard Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 gap-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('SOS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'SOS'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>SOS Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('DISASTER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'DISASTER'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Disasters</span>
        </button>

        <button
          onClick={() => setActiveTab('CHAOS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'CHAOS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Skull className="w-3.5 h-3.5" />
          <span>Fault Inject</span>
        </button>

        <button
          onClick={() => setActiveTab('STRESS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'STRESS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Stress Test</span>
        </button>

        <button
          onClick={() => setActiveTab('HEURISTICS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'HEURISTICS'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Routing Weights</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 1: SOS Generator */}
        {activeTab === 'SOS' && (
          <form onSubmit={handleSendSos} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Dispatch Emergency Message
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono">
                PRIORITY 0 PREEMPTION
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Source Mesh Node</label>
              <select
                value={sosSourceNode}
                onChange={(e) => setSosSourceNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:border-red-500 focus:outline-none"
              >
                <option value="">-- Auto-select Victim Node --</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    [{n.type}] {n.name} (Battery: {n.battery.toFixed(0)}% | Queue: {n.queueSize})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Incident Type</label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value as MessageType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="SOS">SOS (Critical Emergency)</option>
                  <option value="MEDICAL">MEDICAL (Triage Level 1)</option>
                  <option value="TRAPPED">TRAPPED (Structural Search)</option>
                  <option value="EVACUATION">EVACUATION (Corridor)</option>
                  <option value="WATER">WATER (Logistics Aid)</option>
                  <option value="FOOD">FOOD (Logistics Aid)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Triage Priority</label>
                <div className="flex items-center h-[34px] px-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-slate-300">
                  {sosType === 'SOS' || sosType === 'MEDICAL' || sosType === 'TRAPPED' ? (
                    <span className="text-red-400 font-bold">Tier 0 (CRITICAL)</span>
                  ) : sosType === 'EVACUATION' || sosType === 'WATER' || sosType === 'FOOD' ? (
                    <span className="text-amber-400 font-bold">Tier 1 (URGENT)</span>
                  ) : (
                    <span className="text-blue-400 font-bold">Tier 2 (NORMAL)</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payload Message</label>
              <textarea
                rows={2}
                value={sosPayload}
                onChange={(e) => setSosPayload(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-red-500 focus:outline-none font-mono"
                placeholder="Describe victim count, injuries, hazards..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Mesh Packet</span>
            </button>
          </form>
        )}

        {/* TAB 2: Disaster Generator */}
        {activeTab === 'DISASTER' && (
          <form onSubmit={handleCreateDisaster} className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Spawn Environmental Hazard
              </span>
              {incidents.length > 0 && (
                <button
                  type="button"
                  onClick={clearIncidents}
                  className="text-red-400 hover:text-red-300 text-[11px] font-medium"
                >
                  Clear All ({incidents.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Hazard Category</label>
                <select
                  value={disasterType}
                  onChange={(e) => {
                    const t = e.target.value as IncidentType;
                    setDisasterType(t);
                    setDisasterName(
                      t === 'EARTHQUAKE' ? 'M6.8 Seismic Fault Rupture' :
                      t === 'FLOOD' ? 'River Breach Inundation' :
                      t === 'FIRE' ? 'Wildfire Dense Smoke Corridor' : 'Tropical Cyclone Gale'
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="EARTHQUAKE">Earthquake / Tremor</option>
                  <option value="FLOOD">Flash Flood</option>
                  <option value="FIRE">Wildfire / Smoke</option>
                  <option value="CYCLONE">Cyclone / Storm</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Severity Level</label>
                <select
                  value={disasterSeverity}
                  onChange={(e) => setDisasterSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Incident Name</label>
              <input
                type="text"
                value={disasterName}
                onChange={(e) => setDisasterName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Blast Radius: {disasterRadius} px</label>
                <input
                  type="range"
                  min="60"
                  max="220"
                  value={disasterRadius}
                  onChange={(e) => setDisasterRadius(parseInt(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">RF Noise: {(disasterRfLoss * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={disasterRfLoss}
                  onChange={(e) => setDisasterRfLoss(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Deploy Hazard Zone</span>
            </button>

            {incidents.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">ACTIVE HAZARD ZONES:</span>
                {incidents.map(inc => (
                  <div key={inc.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${inc.active ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
                      <span className="text-slate-200 font-medium">{inc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleIncident(inc.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        inc.active ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {inc.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        )}

        {/* TAB 3: Fault Injection */}
        {activeTab === 'CHAOS' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-purple-400" />
                Chaos Engineering Testbench
              </span>
              <span className="text-slate-400 text-[11px]">Test Self-Healing</span>
            </div>

            <p className="text-slate-400 text-[11px]">
              Inject hardware failures, drop batteries, or take gateways offline to test automatic reroute discovery.
            </p>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-semibold text-purple-300 text-xs flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                Relief Gateways Status:
              </span>
              <div className="space-y-1.5">
                {gateways.map(gw => (
                  <div key={gw.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{gw.name}</span>
                    <button
                      onClick={() => toggleGatewayStatus(gw.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                        gw.status === 'AVAILABLE'
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {gw.status === 'AVAILABLE' ? 'Simulate Outage' : 'Restore Online'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 text-xs">
                Target Node: {selectedNodeId ? nodes.find(n => n.id === selectedNodeId)?.name : 'Click a node on map'}
              </span>
              {selectedNodeId ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => toggleNodeFailure(selectedNodeId)}
                    className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <Skull className="w-3 h-3" />
                    <span>Kill / Revive</span>
                  </button>

                  <button
                    onClick={() => drainNodeBattery(selectedNodeId)}
                    className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <BatteryLow className="w-3 h-3" />
                    <span>Drain to 5%</span>
                  </button>

                  <button
                    onClick={() => rechargeNodeBattery(selectedNodeId)}
                    className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Recharge</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Select any node on the canvas map to inject individual node faults.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Stress Test */}
        {activeTab === 'STRESS' && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Burst Congestion Stress Test
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                CONCURRENCY BENCH
              </span>
            </div>

            <p className="text-slate-400 text-[11px]">
              Inject massive packet bursts simultaneously to evaluate queue congestion, drop-tail buffers, and Tier-0 SOS priority preemption in real-time.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => triggerStressTest(100)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">100</span>
                <span className="text-[10px] text-slate-400">Light Burst</span>
              </button>

              <button
                onClick={() => triggerStressTest(500)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">500</span>
                <span className="text-[10px] text-slate-400">Heavy Storm</span>
              </button>

              <button
                onClick={() => triggerStressTest(1000)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-red-500/20 text-red-300 border border-red-500/30 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">1,000</span>
                <span className="text-[10px] text-slate-400">Extreme Flood</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200">Test Invariants:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                <li>Priority 0 SOS packets will never be dropped if Priority 2 packets exist in queue.</li>
                <li>Congested nodes automatically alert upstream routing engines.</li>
                <li>Drop-tail triggers when node buffer reaches max capacity (50).</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: Routing Weights */}
        {activeTab === 'HEURISTICS' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                Multi-Attribute Routing Weights
              </span>
            </div>

            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <span className="text-slate-400 text-[11px]">Presets:</span>
              <button
                onClick={() => applyWeightPreset('BALANCED')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px]"
              >
                Balanced
              </button>
              <button
                onClick={() => applyWeightPreset('ENERGY')}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px]"
              >
                Energy Saver
              </button>
              <button
                onClick={() => applyWeightPreset('RELIABILITY')}
                className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px]"
              >
                Max Reliability
              </button>
              <button
                onClick={() => applyWeightPreset('SPEED')}
                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px]"
              >
                Low Latency
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W1: Gateway Progress</span>
                  <span className="font-mono text-cyan-300">{weights.w1GatewayProgress}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w1GatewayProgress}
                  onChange={(e) => setWeights({ w1GatewayProgress: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W2: Link Quality (SNR/RSSI)</span>
                  <span className="font-mono text-emerald-300">{weights.w2LinkQuality}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w2LinkQuality}
                  onChange={(e) => setWeights({ w2LinkQuality: parseInt(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W3: Battery Health</span>
                  <span className="font-mono text-amber-300">{weights.w3BatteryHealth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w3BatteryHealth}
                  onChange={(e) => setWeights({ w3BatteryHealth: parseInt(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W4: Node Reliability</span>
                  <span className="font-mono text-purple-300">{weights.w4Reliability}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w4Reliability}
                  onChange={(e) => setWeights({ w4Reliability: parseInt(e.target.value) })}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W5: Congestion Penalty</span>
                  <span className="font-mono text-orange-300">{weights.w5Congestion}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w5Congestion}
                  onChange={(e) => setWeights({ w5Congestion: parseInt(e.target.value) })}
                  className="w-full accent-orange-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">W6: Hop Penalty (Loop Avoidance)</span>
                  <span className="font-mono text-red-300">{weights.w6HopPenalty}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w6HopPenalty}
                  onChange={(e) => setWeights({ w6HopPenalty: parseInt(e.target.value) })}
                  className="w-full accent-red-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
