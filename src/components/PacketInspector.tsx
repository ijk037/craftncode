import React from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  Package, 
  X, 
  Activity
} from 'lucide-react';

export const PacketInspector: React.FC = () => {
  const inspectedPacket = useMeshStore(state => state.inspectedPacket);
  const selectPacket = useMeshStore(state => state.selectPacket);
  const selectNode = useMeshStore(state => state.selectNode);

  if (!inspectedPacket) return null;

  const isDelivered = inspectedPacket.status === 'DELIVERED';
  const isFailed = inspectedPacket.status === 'FAILED' || inspectedPacket.status === 'EXPIRED';

  return (
    <div className="bg-[#0b1120] border border-cyan-500/40 rounded-xl flex flex-col h-full overflow-hidden shadow-2xl text-xs backdrop-blur-md">
      {/* Header */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            inspectedPacket.priority === 0 ? 'bg-red-500/20 text-red-400' :
            inspectedPacket.isAck ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold font-mono text-slate-100 text-sm">{inspectedPacket.messageId}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="font-semibold text-cyan-300">{inspectedPacket.messageType}</span>
              <span>•</span>
              <span className="font-mono">Priority Tier {inspectedPacket.priority}</span>
              {inspectedPacket.isAck && <span className="text-emerald-400 font-bold">• REVERSE ACK</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isDelivered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            isFailed ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            inspectedPacket.status === 'STORED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            {inspectedPacket.status}
          </span>

          <button
            onClick={() => selectPacket(null)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
        {/* Payload Box */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-slate-200 text-xs">
          <span className="text-[10px] text-slate-500 uppercase block mb-1 font-sans font-semibold">Message Payload:</span>
          "{inspectedPacket.payload}"
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Hop Count</span>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">{inspectedPacket.hopCount}</div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining TTL</span>
            <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">{inspectedPacket.ttl} / 20</div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Retries</span>
            <div className="text-sm font-bold font-mono text-slate-300 mt-0.5">{inspectedPacket.retryCount}</div>
          </div>
        </div>

        {/* Chronological Hop History Trail */}
        <div>
          <span className="text-[11px] font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Dynamic Hop Trail & Decision History:
          </span>

          <div className="relative pl-4 space-y-3 border-l-2 border-slate-800 ml-2">
            {inspectedPacket.pathHistory.map((hop, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0b1120] ${
                  hop.action === 'ORIGINATED' ? 'bg-purple-400' :
                  hop.action === 'DELIVERED' ? 'bg-emerald-400' :
                  hop.action === 'REROUTED' ? 'bg-amber-400' :
                  hop.action === 'DROPPED' ? 'bg-red-400' :
                  hop.action === 'STORED' ? 'bg-orange-400' : 'bg-cyan-400'
                }`} />

                <div className="bg-slate-900/70 hover:bg-slate-900 p-2 rounded-lg border border-slate-800/80 transition-colors">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <button
                      onClick={() => selectNode(hop.nodeId)}
                      className="font-bold text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      {hop.nodeName || hop.nodeId}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">Hop #{idx}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                      hop.action === 'ORIGINATED' ? 'bg-purple-500/20 text-purple-300' :
                      hop.action === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' :
                      hop.action === 'REROUTED' ? 'bg-amber-500/20 text-amber-300' :
                      hop.action === 'DROPPED' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {hop.action}
                    </span>
                    {hop.batteryAtHop !== undefined && (
                      <span className="font-mono text-slate-400">Bat: {hop.batteryAtHop.toFixed(0)}%</span>
                    )}
                  </div>

                  {hop.note && (
                    <div className="text-[10px] text-slate-400 font-mono bg-slate-950/40 p-1 rounded border border-slate-800/50">
                      {hop.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
