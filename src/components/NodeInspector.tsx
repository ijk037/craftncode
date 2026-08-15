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
  ArrowRight
} from 'lucide-react';

const transport = new SimulatedTransport();

export const NodeInspector: React.FC = () => {
  const selectedNodeId = useMeshStore(state => state.selectedNodeId);
  const nodes = useMeshStore(state => state.nodes);
  const nodeQueues = useMeshStore(state => state.nodeQueues);
  const simulatedRangeKm = useMeshStore(state => state.simulatedRangeKm);
  const kmToPixelScale = useMeshStore(state => state.kmToPixelScale);
  const incidents = useMeshStore(state => state.incidents);

  const toggleNodeFailure = useMeshStore(state => state.toggleNodeFailure);
  const drainNodeBattery = useMeshStore(state => state.drainNodeBattery);
  const rechargeNodeBattery = useMeshStore(state => state.rechargeNodeBattery);
  const createPacket = useMeshStore(state => state.createPacket);
  const selectPacket = useMeshStore(state => state.selectPacket);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const nodesMap = new Map(nodes.map(n => [n.id, n]));

  if (!selectedNode) {
    return (
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full text-xs text-slate-400">
        <Server className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <span className="font-semibold text-slate-300">No Node Selected</span>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Click any node or gateway on the network map to inspect real-time telemetry and queue buffers.
        </p>
      </div>
    );
  }

  const queue = nodeQueues[selectedNode.id] || [];
  const maxRangePixels = simulatedRangeKm * kmToPixelScale;

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
      payload: `Emergency SOS triggered from inspected node ${selectedNode.name}`,
    });
  };

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl text-xs">
      {/* Node Header */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            selectedNode.type === 'GATEWAY' ? 'bg-purple-500/20 text-purple-400' :
            selectedNode.type === 'VICTIM' ? 'bg-pink-500/20 text-pink-400' :
            selectedNode.type === 'COMMAND' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm leading-tight">{selectedNode.name}</h3>
            <span className="text-[10px] font-mono text-slate-400">ID: {selectedNode.id} • [{selectedNode.type}]</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          selectedNode.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
          selectedNode.status === 'LOW_BATTERY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
          selectedNode.status === 'CONGESTED' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
          'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {selectedNode.status}
        </span>
      </div>

      {/* Body Telemetry */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                Battery
              </span>
              <span className="font-mono font-bold text-emerald-300">{selectedNode.battery.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedNode.battery > 50 ? 'bg-emerald-500' : selectedNode.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${selectedNode.battery}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Buffer Queue
              </span>
              <span className="font-mono font-bold text-cyan-300">{selectedNode.queueSize}/{selectedNode.maxQueueSize}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedNode.queueSize / selectedNode.maxQueueSize > 0.7 ? 'bg-orange-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${(selectedNode.queueSize / selectedNode.maxQueueSize) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Power Profile</span>
            <div className="font-mono font-semibold text-slate-200 mt-0.5">{selectedNode.powerMode}</div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase">Packets Fwd / Drop</span>
            <div className="font-mono font-semibold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{selectedNode.totalPacketsForwarded}</span> / <span className="text-red-400">{selectedNode.totalPacketsDropped}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleNodeFailure(selectedNode.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-all ${
              selectedNode.status === 'FAILED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
            }`}
          >
            <Skull className="w-3 h-3" />
            <span>{selectedNode.status === 'FAILED' ? 'Revive Node' : 'Simulate Failure'}</span>
          </button>

          <button
            onClick={() => drainNodeBattery(selectedNode.id)}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
            title="Drain Battery to 5%"
          >
            <BatteryLow className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => rechargeNodeBattery(selectedNode.id)}
            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
            title="Recharge Battery to 100%"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleQuickSos}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white"
            title="Dispatch SOS from this node"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Neighbors */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1.5">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              Active Wireless Neighbors ({neighborDetails.length})
            </span>
          </div>

          {neighborDetails.length === 0 ? (
            <div className="p-2 rounded bg-slate-900 text-slate-500 text-[11px] text-center italic">
              Node is isolated (no neighbors within {simulatedRangeKm.toFixed(1)} km)
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {neighborDetails.map(item => (
                <div key={item!.node.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900/70 border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      item!.node.status === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-slate-200 font-medium">{item!.node.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-cyan-400">{item!.metrics.quality}% Link</span>
                    <span className="text-slate-400">{item!.metrics.snr}dB SNR</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue Buffer */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Node Memory Queue ({queue.length})
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="p-2 rounded bg-slate-900 text-slate-500 text-[11px] text-center italic">
              Buffer empty (ready for transmissions)
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {queue.map(pkt => (
                <div
                  key={pkt.messageId}
                  onClick={() => selectPacket(pkt.messageId)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                      pkt.priority === 0 ? 'bg-red-500/20 text-red-300' :
                      pkt.priority === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      P{pkt.priority}
                    </span>
                    <span className="font-mono text-slate-200">{pkt.messageId}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>{pkt.messageType}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
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
