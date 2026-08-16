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
  PlusCircle,
  Bot
} from 'lucide-react';

export const CommandDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SOS' | 'DISASTER' | 'CHAOS' | 'STRESS' | 'HEURISTICS'>('SOS');

  // Store
  const nodes = useMeshStore(state => state.nodes);
  const gateways = useMeshStore(state => state.gateways);
  const incidents = useMeshStore(state => state.incidents);
  const weights = useMeshStore(state => state.weights);
  const selectedNodeId = useMeshStore(state => state.selectedNodeId);
  const aiRoutingMode = useMeshStore(state => state.aiRoutingMode);
  const setAiRoutingMode = useMeshStore(state => state.setAiRoutingMode);

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
    <div className="bg-[#171A19] border border-[#333b37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl text-xs font-sans">
      {/* Dashboard Tab Navigation */}
      <div className="flex border-b border-[#333b37] bg-[#1d2220] p-1 gap-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('SOS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'SOS'
              ? 'bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40 shadow-sm font-bold'
              : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>SOS Inject</span>
        </button>

        <button
          onClick={() => setActiveTab('DISASTER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'DISASTER'
              ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40 shadow-sm font-bold'
              : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Disasters</span>
        </button>

        <button
          onClick={() => setActiveTab('CHAOS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'CHAOS'
              ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 shadow-sm font-bold'
              : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
          }`}
        >
          <Skull className="w-3.5 h-3.5" />
          <span>Fault Inject</span>
        </button>

        <button
          onClick={() => setActiveTab('STRESS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'STRESS'
              ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40 shadow-sm font-bold'
              : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Stress Test</span>
        </button>

        <button
          onClick={() => setActiveTab('HEURISTICS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'HEURISTICS'
              ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 shadow-sm font-bold'
              : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Routing Weights</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-3.5 flex-1 overflow-y-auto">
        {/* TAB 1: SOS Generator */}
        {activeTab === 'SOS' && (
          <form onSubmit={handleSendSos} className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E8E6DE] text-sm flex items-center gap-1.5 font-mono">
                <AlertOctagon className="w-4 h-4 text-[#B84A3A]" />
                Dispatch Emergency Message
              </span>
              <span className="px-2 py-0.5 rounded bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40 text-[10px] font-mono font-bold">
                PRIORITY 0 PREEMPTION
              </span>
            </div>

            <div>
              <label className="block text-[#9CA6A0] mb-1 font-medium">Source Mesh Node</label>
              <select
                value={sosSourceNode}
                onChange={(e) => setSosSourceNode(e.target.value)}
                className="w-full bg-[#242927] border border-[#333b37] rounded-lg px-2.5 py-1.5 text-[#E8E6DE] font-mono text-xs focus:border-[#879B54] focus:outline-none"
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
                <label className="block text-[#9CA6A0] mb-1 font-medium">Incident Type</label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value as MessageType)}
                  className="w-full bg-[#242927] border border-[#333b37] rounded-lg px-2.5 py-1.5 text-[#E8E6DE] text-xs focus:border-[#879B54] focus:outline-none"
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
                <label className="block text-[#9CA6A0] mb-1 font-medium">Triage Priority</label>
                <div className="flex items-center h-[34px] px-3 bg-[#242927] border border-[#333b37] rounded-lg font-mono text-[#E8E6DE]">
                  {sosType === 'SOS' || sosType === 'MEDICAL' || sosType === 'TRAPPED' ? (
                    <span className="text-[#B84A3A] font-bold">Tier 0 (CRITICAL)</span>
                  ) : sosType === 'EVACUATION' || sosType === 'WATER' || sosType === 'FOOD' ? (
                    <span className="text-[#D49A3A] font-bold">Tier 1 (URGENT)</span>
                  ) : (
                    <span className="text-[#3F8F78] font-bold">Tier 2 (NORMAL)</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#9CA6A0] mb-1 font-medium">Payload Message</label>
              <textarea
                rows={2}
                value={sosPayload}
                onChange={(e) => setSosPayload(e.target.value)}
                className="w-full bg-[#242927] border border-[#333b37] rounded-lg p-2 text-[#E8E6DE] text-xs focus:border-[#879B54] focus:outline-none font-mono"
                placeholder="Describe victim count, injuries, hazards..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-[#B84A3A] hover:bg-[#9c3d2f] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-[#B84A3A]/25 transition-all text-xs"
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
              <span className="font-semibold text-[#E8E6DE] text-sm flex items-center gap-1.5 font-mono">
                <Flame className="w-4 h-4 text-[#D49A3A]" />
                Spawn Environmental Hazard
              </span>
              {incidents.length > 0 && (
                <button
                  type="button"
                  onClick={clearIncidents}
                  className="text-[#B84A3A] hover:text-[#9c3d2f] text-[11px] font-medium"
                >
                  Clear All ({incidents.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9CA6A0] mb-1 font-medium">Hazard Category</label>
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
                  className="w-full bg-[#242927] border border-[#333b37] rounded-lg px-2.5 py-1.5 text-[#E8E6DE] text-xs focus:border-[#D49A3A] focus:outline-none"
                >
                  <option value="EARTHQUAKE">Earthquake / Tremor</option>
                  <option value="FLOOD">Flash Flood</option>
                  <option value="FIRE">Wildfire / Smoke</option>
                  <option value="CYCLONE">Cyclone / Storm</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9CA6A0] mb-1 font-medium">Severity Level</label>
                <select
                  value={disasterSeverity}
                  onChange={(e) => setDisasterSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-[#242927] border border-[#333b37] rounded-lg px-2.5 py-1.5 text-[#E8E6DE] text-xs focus:border-[#D49A3A] focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9CA6A0] mb-1 font-medium">Incident Name</label>
              <input
                type="text"
                value={disasterName}
                onChange={(e) => setDisasterName(e.target.value)}
                className="w-full bg-[#242927] border border-[#333b37] rounded-lg px-2.5 py-1.5 text-[#E8E6DE] text-xs focus:border-[#D49A3A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9CA6A0] mb-1 font-medium">Blast Radius: {disasterRadius} px</label>
                <input
                  type="range"
                  min="60"
                  max="220"
                  value={disasterRadius}
                  onChange={(e) => setDisasterRadius(parseInt(e.target.value))}
                  className="w-full accent-[#D49A3A]"
                />
              </div>

              <div>
                <label className="block text-[#9CA6A0] mb-1 font-medium">RF Noise: {(disasterRfLoss * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={disasterRfLoss}
                  onChange={(e) => setDisasterRfLoss(parseFloat(e.target.value))}
                  className="w-full accent-[#D49A3A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-[#D49A3A] hover:bg-[#ba842e] text-[#171A19] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#D49A3A]/25 transition-all text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Deploy Hazard Zone</span>
            </button>

            {incidents.length > 0 && (
              <div className="pt-2 border-t border-[#333b37] space-y-1.5">
                <span className="text-[11px] font-semibold text-[#9CA6A0]">ACTIVE HAZARD ZONES:</span>
                {incidents.map(inc => (
                  <div key={inc.id} className="flex items-center justify-between p-2 rounded-lg bg-[#242927] border border-[#333b37] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${inc.active ? 'bg-[#D49A3A] animate-ping' : 'bg-[#6b7771]'}`} />
                      <span className="text-[#E8E6DE] font-medium">{inc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleIncident(inc.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inc.active ? 'bg-[#B84A3A]/20 text-[#B84A3A]' : 'bg-[#171A19] text-[#9CA6A0]'
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
              <span className="font-semibold text-[#E8E6DE] text-sm flex items-center gap-1.5 font-mono">
                <Skull className="w-4 h-4 text-[#879B54]" />
                Chaos Engineering Testbench
              </span>
              <span className="text-[#879B54] text-[11px] font-mono">Test Self-Healing</span>
            </div>

            <p className="text-[#9CA6A0] text-[11px]">
              Inject hardware failures, drop batteries, or take gateways offline to test automatic reroute discovery.
            </p>

            <div className="p-3 rounded-xl bg-[#242927] border border-[#333b37] space-y-2">
              <span className="font-semibold text-[#879B54] text-xs flex items-center gap-1 font-mono">
                <Radio className="w-3.5 h-3.5" />
                Relief Gateways Status:
              </span>
              <div className="space-y-1.5">
                {gateways.map(gw => (
                  <div key={gw.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#E8E6DE]">{gw.name}</span>
                    <button
                      onClick={() => toggleGatewayStatus(gw.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        gw.status === 'AVAILABLE'
                          ? 'bg-[#B84A3A]/20 hover:bg-[#B84A3A]/30 text-[#B84A3A] border border-[#B84A3A]/40'
                          : 'bg-[#3F8F78]/20 hover:bg-[#3F8F78]/30 text-[#3F8F78] border border-[#3F8F78]/40'
                      }`}
                    >
                      {gw.status === 'AVAILABLE' ? 'Simulate Outage' : 'Restore Online'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#242927] border border-[#333b37] space-y-2">
              <span className="font-semibold text-[#E8E6DE] text-xs font-mono">
                Target Node: {selectedNodeId ? nodes.find(n => n.id === selectedNodeId)?.name : 'Click a node on map'}
              </span>
              {selectedNodeId ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => toggleNodeFailure(selectedNodeId)}
                    className="p-2 rounded-lg bg-[#B84A3A]/20 hover:bg-[#B84A3A]/30 text-[#B84A3A] border border-[#B84A3A]/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Skull className="w-3 h-3" />
                    <span>Kill / Revive</span>
                  </button>

                  <button
                    onClick={() => drainNodeBattery(selectedNodeId)}
                    className="p-2 rounded-lg bg-[#D49A3A]/20 hover:bg-[#D49A3A]/30 text-[#D49A3A] border border-[#D49A3A]/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <BatteryLow className="w-3 h-3" />
                    <span>Drain to 5%</span>
                  </button>

                  <button
                    onClick={() => rechargeNodeBattery(selectedNodeId)}
                    className="p-2 rounded-lg bg-[#3F8F78]/20 hover:bg-[#3F8F78]/30 text-[#3F8F78] border border-[#3F8F78]/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Recharge</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-[#9CA6A0] italic">
                  Select any node on the canvas map to inject individual node faults.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Stress Test */}
        {activeTab === 'STRESS' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E8E6DE] text-sm flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-[#879B54]" />
                Burst Congestion Stress Test
              </span>
              <span className="px-2 py-0.5 rounded bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 text-[10px] font-mono font-bold">
                CONCURRENCY BENCH
              </span>
            </div>

            <p className="text-[#9CA6A0] text-[11px]">
              Inject massive packet bursts simultaneously to evaluate queue congestion, drop-tail buffers, and Tier-0 SOS priority preemption in real-time.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => triggerStressTest(100)}
                className="p-3 rounded-xl bg-[#242927] hover:bg-[#2f3533] text-[#3F8F78] border border-[#333b37] hover:border-[#3F8F78]/40 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">100</span>
                <span className="text-[10px] text-[#9CA6A0]">Light Burst</span>
              </button>

              <button
                onClick={() => triggerStressTest(500)}
                className="p-3 rounded-xl bg-[#242927] hover:bg-[#2f3533] text-[#D49A3A] border border-[#333b37] hover:border-[#D49A3A]/40 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">500</span>
                <span className="text-[10px] text-[#9CA6A0]">Heavy Storm</span>
              </button>

              <button
                onClick={() => triggerStressTest(1000)}
                className="p-3 rounded-xl bg-[#242927] hover:bg-[#2f3533] text-[#B84A3A] border border-[#333b37] hover:border-[#B84A3A]/40 flex flex-col items-center gap-1.5 transition-all group"
              >
                <span className="text-base font-bold font-mono group-hover:scale-110 transition-transform">1,000</span>
                <span className="text-[10px] text-[#9CA6A0]">Extreme Flood</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#242927] border border-[#333b37] text-[11px] text-[#9CA6A0] space-y-1">
              <span className="font-semibold text-[#E8E6DE] font-mono">Test Invariants:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[#9CA6A0]">
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
              <span className="font-semibold text-[#E8E6DE] text-sm flex items-center gap-1.5 font-mono">
                <Sliders className="w-4 h-4 text-[#879B54]" />
                Multi-Attribute Routing Weights
              </span>
            </div>

            {/* Distributed AI Routing Mode Switcher */}
            <div className="p-3 rounded-xl bg-[#171A19] border border-[#879B54]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#E8E6DE] flex items-center gap-1.5 font-mono">
                  <Bot className="w-3.5 h-3.5 text-[#879B54]" />
                  Distributed Routing Mode
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#879B54]/20 text-[#879B54]">
                  {aiRoutingMode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAiRoutingMode('BASELINE_HEURISTIC')}
                  className={`p-1.5 rounded-lg text-center font-mono text-[10px] border transition-all ${
                    aiRoutingMode === 'BASELINE_HEURISTIC'
                      ? 'bg-[#242927] border-[#879B54] text-[#E8E6DE] font-bold shadow-sm'
                      : 'bg-[#171A19] border-[#333b37] text-[#9CA6A0]'
                  }`}
                >
                  Baseline Formula
                </button>

                <button
                  type="button"
                  onClick={() => setAiRoutingMode('TINYML_HYBRID')}
                  className={`p-1.5 rounded-lg text-center font-mono text-[10px] border transition-all ${
                    aiRoutingMode === 'TINYML_HYBRID'
                      ? 'bg-[#879B54]/20 border-[#879B54] text-[#879B54] font-bold shadow-sm'
                      : 'bg-[#171A19] border-[#333b37] text-[#9CA6A0]'
                  }`}
                >
                  TinyML Hybrid
                </button>

                <button
                  type="button"
                  onClick={() => setAiRoutingMode('PROACTIVE_AI')}
                  className={`p-1.5 rounded-lg text-center font-mono text-[10px] border transition-all ${
                    aiRoutingMode === 'PROACTIVE_AI'
                      ? 'bg-[#3F8F78]/20 border-[#3F8F78] text-[#3F8F78] font-bold shadow-sm'
                      : 'bg-[#171A19] border-[#333b37] text-[#9CA6A0]'
                  }`}
                >
                  Proactive AI
                </button>
              </div>
            </div>

            {/* Quick Weight Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[#9CA6A0] text-[11px] shrink-0">Presets:</span>
              <button
                onClick={() => applyWeightPreset('BALANCED')}
                className="px-2 py-0.5 rounded bg-[#242927] hover:bg-[#2f3533] text-[#E8E6DE] border border-[#333b37] text-[10px] font-bold"
              >
                Balanced
              </button>
              <button
                onClick={() => applyWeightPreset('ENERGY')}
                className="px-2 py-0.5 rounded bg-[#3F8F78]/20 hover:bg-[#3F8F78]/30 text-[#3F8F78] border border-[#3F8F78]/40 text-[10px] font-bold"
              >
                Energy Saver
              </button>
              <button
                onClick={() => applyWeightPreset('RELIABILITY')}
                className="px-2 py-0.5 rounded bg-[#879B54]/20 hover:bg-[#879B54]/30 text-[#879B54] border border-[#879B54]/40 text-[10px] font-bold"
              >
                Max Reliability
              </button>
              <button
                onClick={() => applyWeightPreset('SPEED')}
                className="px-2 py-0.5 rounded bg-[#D49A3A]/20 hover:bg-[#D49A3A]/30 text-[#D49A3A] border border-[#D49A3A]/40 text-[10px] font-bold"
              >
                Low Latency
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W1: Gateway Progress</span>
                  <span className="font-mono text-[#879B54] font-bold">{weights.w1GatewayProgress}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w1GatewayProgress}
                  onChange={(e) => setWeights({ w1GatewayProgress: parseInt(e.target.value) })}
                  className="w-full accent-[#879B54]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W2: Link Quality (SNR/RSSI)</span>
                  <span className="font-mono text-[#3F8F78] font-bold">{weights.w2LinkQuality}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w2LinkQuality}
                  onChange={(e) => setWeights({ w2LinkQuality: parseInt(e.target.value) })}
                  className="w-full accent-[#3F8F78]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W3: Battery Health</span>
                  <span className="font-mono text-[#D49A3A] font-bold">{weights.w3BatteryHealth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w3BatteryHealth}
                  onChange={(e) => setWeights({ w3BatteryHealth: parseInt(e.target.value) })}
                  className="w-full accent-[#D49A3A]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W4: Node Reliability</span>
                  <span className="font-mono text-[#879B54] font-bold">{weights.w4Reliability}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w4Reliability}
                  onChange={(e) => setWeights({ w4Reliability: parseInt(e.target.value) })}
                  className="w-full accent-[#879B54]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W5: Congestion Penalty</span>
                  <span className="font-mono text-[#D49A3A] font-bold">{weights.w5Congestion}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w5Congestion}
                  onChange={(e) => setWeights({ w5Congestion: parseInt(e.target.value) })}
                  className="w-full accent-[#D49A3A]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[#E8E6DE]">W6: Hop Penalty (Loop Avoidance)</span>
                  <span className="font-mono text-[#B84A3A] font-bold">{weights.w6HopPenalty}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={weights.w6HopPenalty}
                  onChange={(e) => setWeights({ w6HopPenalty: parseInt(e.target.value) })}
                  className="w-full accent-[#B84A3A]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
