import React from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { SimulatedTransport } from '../models/Transport';
import { 
  Server, 
  BatteryMedium, 
  Wifi, 
  Layers, 
  Skull, 
  RefreshCw, 
  BatteryLow, 
  Send, 
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Cpu
} from 'lucide-react';

const transport = new SimulatedTransport();

export const NodeInspector: React.FC = () => {
  const selectedNodeId = useMeshStore(state => state.selectedNodeId);
  const nodes = useMeshStore(state => state.nodes);
  const nodeQueues = useMeshStore(state => state.nodeQueues);
  const simulatedRangeKm = useMeshStore(state => state.simulatedRangeKm);
  const kmToPixelScale = useMeshStore(state => state.kmToPixelScale);
  const incidents = useMeshStore(state => state.incidents);
  const nodeAiDiagnostics = useMeshStore(state => state.nodeAiDiagnostics);
  const aiRoutingMode = useMeshStore(state => state.aiRoutingMode);

  const toggleNodeFailure = useMeshStore(state => state.toggleNodeFailure);
  const drainNodeBattery = useMeshStore(state => state.drainNodeBattery);
  const rechargeNodeBattery = useMeshStore(state => state.rechargeNodeBattery);
  const createPacket = useMeshStore(state => state.createPacket);
  const selectPacket = useMeshStore(state => state.selectPacket);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const nodesMap = new Map(nodes.map(n => [n.id, n]));

  if (!selectedNode) {
    return (
      <div className="bg-[#171A19] border border-[#333b37] rounded-xl p-4 flex flex-col items-center justify-center text-center h-full text-xs text-[#9CA6A0]">
        <Server className="w-8 h-8 text-[#6b7771] mb-2 animate-pulse" />
        <span className="font-semibold text-[#E8E6DE] font-mono">No Node Selected</span>
        <p className="text-[11px] text-[#9CA6A0] mt-1 max-w-[200px]">
          Click any node or gateway on the network map to inspect real-time TinyML routing, link forecasts, and packet buffers.
        </p>
      </div>
    );
  }

  const queue = nodeQueues[selectedNode.id] || [];
  const maxRangePixels = simulatedRangeKm * kmToPixelScale;
  const aiDiag = nodeAiDiagnostics[selectedNode.id];

  const neighborDetails = selectedNode.neighbours.map(nbrId => {
    const nbrNode = nodesMap.get(nbrId);
    if (!nbrNode) return null;
    const metrics = transport.calculateLinkMetrics(selectedNode, nbrNode, maxRangePixels, incidents);
    return {
      node: nbrNode,
      metrics
    };
  }).filter(Boolean);

  const handleQuickSos = () => {
    createPacket({
      sourceNodeId: selectedNode.id,
      messageType: 'SOS',
      payload: `Emergency SOS generated from ${selectedNode.name}`,
    });
  };

  return (
    <div className="bg-[#171A19] border border-[#333b37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl text-xs font-sans">
      {/* Header */}
      <div className="p-3 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            selectedNode.type === 'GATEWAY' ? 'bg-[#879B54]/20 text-[#879B54]' :
            selectedNode.type === 'COMMAND' ? 'bg-[#3F8F78]/20 text-[#3F8F78]' :
            selectedNode.type === 'VICTIM' ? 'bg-[#D49A3A]/20 text-[#D49A3A]' : 'bg-[#242927] text-[#E8E6DE]'
          }`}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#E8E6DE] text-sm font-mono">{selectedNode.name}</h3>
            <span className="text-[10px] text-[#9CA6A0] font-mono">
              ID: {selectedNode.id} • Type: {selectedNode.type}
            </span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          selectedNode.status === 'HEALTHY' ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40' :
          selectedNode.status === 'LOW_BATTERY' ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40' :
          selectedNode.status === 'CONGESTED' ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40' :
          'bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40'
        }`}>
          {selectedNode.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-[#242927] border border-[#333b37]">
            <div className="flex items-center justify-between text-[#9CA6A0] text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <BatteryMedium className="w-3.5 h-3.5 text-[#3F8F78]" />
                Battery
              </span>
              <span className="font-mono font-bold text-[#E8E6DE]">{selectedNode.battery.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#171A19] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  selectedNode.battery > 50 ? 'bg-[#3F8F78]' : selectedNode.battery > 20 ? 'bg-[#D49A3A]' : 'bg-[#B84A3A]'
                }`}
                style={{ width: `${selectedNode.battery}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#242927] border border-[#333b37]">
            <div className="flex items-center justify-between text-[#9CA6A0] text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#879B54]" />
                Queue Load
              </span>
              <span className="font-mono font-bold text-[#E8E6DE]">
                {selectedNode.queueSize} / {selectedNode.maxQueueSize}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#171A19] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  selectedNode.queueSize > 35 ? 'bg-[#B84A3A]' : selectedNode.queueSize > 15 ? 'bg-[#D49A3A]' : 'bg-[#879B54]'
                }`}
                style={{ width: `${(selectedNode.queueSize / selectedNode.maxQueueSize) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 🤖 ON-NODE TINYML ROUTING & NEURAL DECISION MATRIX */}
        <div className="p-3 rounded-xl bg-[#242927] border border-[#879B54]/40 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#879B54]" />
              <span className="font-bold text-[#E8E6DE] text-xs font-mono">On-Node TinyML Neural Router</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/30 uppercase">
              {aiRoutingMode}
            </span>
          </div>

          {/* Proactive Link Health Forecast */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#171A19] border border-[#333b37] text-[11px]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#9CA6A0]" />
              <span className="text-[#9CA6A0]">Predictive Link Health:</span>
            </div>
            <span className={`font-mono font-bold flex items-center gap-1 ${
              aiDiag?.linkHealthForecast === 'STABLE' ? 'text-[#3F8F78]' :
              aiDiag?.linkHealthForecast === 'DEGRADING' ? 'text-[#D49A3A]' : 'text-[#B84A3A]'
            }`}>
              {aiDiag?.linkHealthForecast === 'STABLE' ? <CheckCircle2 className="w-3 h-3 text-[#3F8F78]" /> : <AlertTriangle className="w-3 h-3 text-[#D49A3A]" />}
              {aiDiag?.linkHealthForecast || 'STABLE (0.94)'}
            </span>
          </div>

          {/* Neighbor Evaluation Probability Ranking */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#9CA6A0] font-mono uppercase block font-semibold">
              Candidate Neighbor Evaluation (P_Success):
            </span>

            {aiDiag && aiDiag.evaluations.length > 0 ? (
              <div className="space-y-1.5">
                {aiDiag.evaluations.map(ev => (
                  <div
                    key={ev.neighborId}
                    className={`p-2 rounded-lg border flex flex-col gap-1 text-[11px] font-mono transition-all ${
                      ev.isSelected
                        ? 'bg-[#171A19] border-[#879B54] text-[#E8E6DE] shadow-sm'
                        : 'bg-[#171A19]/60 border-[#333b37] text-[#9CA6A0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#E8E6DE] flex items-center gap-1.5">
                        {ev.neighborName}
                        {ev.isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#879B54] text-[#171A19] font-bold">
                            SELECTED NEXT-HOP
                          </span>
                        )}
                      </span>
                      <span className={`font-bold ${
                        ev.successProbability > 0.75 ? 'text-[#3F8F78]' :
                        ev.successProbability > 0.5 ? 'text-[#D49A3A]' : 'text-[#B84A3A]'
                      }`}>
                        {(ev.successProbability * 100).toFixed(0)}% P(Tx)
                      </span>
                    </div>

                    <div className="text-[10px] text-[#9CA6A0]">
                      {ev.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-[#171A19] border border-[#333b37] text-[#6b7771] text-center text-[10px] font-mono">
                Running continuous neighbor telemetry inference...
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="p-2.5 rounded-lg bg-[#242927] border border-[#333b37] grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-[#9CA6A0] block">Forwarded</span>
            <span className="font-mono font-bold text-[#879B54] text-xs">{selectedNode.totalPacketsForwarded}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA6A0] block">Dropped</span>
            <span className="font-mono font-bold text-[#B84A3A] text-xs">{selectedNode.totalPacketsDropped}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA6A0] block">Originated</span>
            <span className="font-mono font-bold text-[#3F8F78] text-xs">{selectedNode.totalPacketsOriginated}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => toggleNodeFailure(selectedNode.id)}
            className="p-1.5 rounded-lg bg-[#242927] hover:bg-[#B84A3A]/20 text-[#B84A3A] border border-[#333b37] hover:border-[#B84A3A]/40 font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Skull className="w-3.5 h-3.5" />
            <span>{selectedNode.status === 'FAILED' ? 'Revive' : 'Kill Node'}</span>
          </button>

          <button
            onClick={() => drainNodeBattery(selectedNode.id)}
            className="p-1.5 rounded-lg bg-[#242927] hover:bg-[#D49A3A]/20 text-[#D49A3A] border border-[#333b37] hover:border-[#D49A3A]/40 font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <BatteryLow className="w-3.5 h-3.5" />
            <span>Drain 5%</span>
          </button>

          <button
            onClick={() => rechargeNodeBattery(selectedNode.id)}
            className="p-1.5 rounded-lg bg-[#242927] hover:bg-[#3F8F78]/20 text-[#3F8F78] border border-[#333b37] hover:border-[#3F8F78]/40 font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recharge</span>
          </button>
        </div>

        {/* Quick SOS Trigger */}
        <button
          onClick={handleQuickSos}
          className="w-full py-2 px-3 rounded-lg bg-[#B84A3A] hover:bg-[#9c3d2f] text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Originate SOS from this Node</span>
        </button>

        {/* Neighbor Links */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[#9CA6A0]">
            <span className="font-semibold text-xs flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-[#879B54]" />
              Neighbor Physical Links ({neighborDetails.length})
            </span>
            <span className="text-[10px] font-mono">Range: {simulatedRangeKm}km</span>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {neighborDetails.map(item => {
              if (!item) return null;
              const { node: nbr, metrics } = item;
              return (
                <div
                  key={nbr.id}
                  className="p-2 rounded-lg bg-[#242927] border border-[#333b37] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#E8E6DE] font-mono">{nbr.name}</span>
                    <div className="text-[10px] text-[#9CA6A0] font-mono">
                      RSSI: {metrics.rssi.toFixed(0)} dBm • SNR: {metrics.snr.toFixed(1)} dB
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-[11px] ${
                      metrics.quality > 0.6 ? 'text-[#3F8F78]' : metrics.quality > 0.3 ? 'text-[#D49A3A]' : 'text-[#B84A3A]'
                    }`}>
                      {(metrics.quality * 100).toFixed(0)}% Link
                    </span>
                    <div className="text-[10px] text-[#9CA6A0] font-mono">
                      {(metrics.distance / kmToPixelScale).toFixed(1)} km
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Node Queue Details */}
        <div className="space-y-1.5">
          <span className="font-semibold text-xs text-[#9CA6A0] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#879B54]" />
            Node Packet Queue ({queue.length})
          </span>

          {queue.length === 0 ? (
            <div className="p-3 rounded-lg bg-[#242927] border border-[#333b37] text-center text-[#6b7771] text-[11px] font-mono">
              Queue buffer is empty
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {queue.map((pkt, i) => (
                <div
                  key={pkt.messageId + i}
                  onClick={() => selectPacket(pkt.messageId)}
                  className="p-1.5 rounded-lg bg-[#242927] hover:bg-[#2f3533] border border-[#333b37] flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`w-2 h-2 rounded-full ${
                      pkt.priority === 0 ? 'bg-[#B84A3A]' : pkt.priority === 1 ? 'bg-[#D49A3A]' : 'bg-[#3F8F78]'
                    }`} />
                    <span className="text-[#E8E6DE] font-bold">{pkt.messageId}</span>
                    <span className="text-[10px] text-[#9CA6A0]">[{pkt.messageType}]</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#879B54]">
                    <span>TTL:{pkt.ttl}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
