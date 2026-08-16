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
    <div className="bg-[#171A19] border border-[#333b37] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl text-xs font-sans">
      {/* Header */}
      <div className="p-3 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            inspectedPacket.priority === 0 ? 'bg-[#B84A3A]/20 text-[#B84A3A]' :
            inspectedPacket.isAck ? 'bg-[#3F8F78]/20 text-[#3F8F78]' : 'bg-[#879B54]/20 text-[#879B54]'
          }`}>
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold font-mono text-[#E8E6DE] text-sm">{inspectedPacket.messageId}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#9CA6A0]">
              <span className="font-semibold text-[#879B54]">{inspectedPacket.messageType}</span>
              <span>•</span>
              <span className="font-mono">Priority Tier {inspectedPacket.priority}</span>
              {inspectedPacket.isAck && <span className="text-[#3F8F78] font-bold font-mono">• REVERSE ACK</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isDelivered ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40' :
            isFailed ? 'bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40' :
            inspectedPacket.status === 'STORED' ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40' :
            'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40'
          }`}>
            {inspectedPacket.status}
          </span>

          <button
            onClick={() => selectPacket(null)}
            className="p-1 hover:bg-[#171A19] text-[#9CA6A0] hover:text-[#E8E6DE] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
        {/* Payload Box */}
        <div className="p-2.5 rounded-lg bg-[#242927] border border-[#333b37] font-mono text-[#E8E6DE] text-xs">
          <span className="text-[10px] text-[#9CA6A0] uppercase block mb-1 font-sans font-semibold">Message Payload:</span>
          "{inspectedPacket.payload}"
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#242927] p-2 rounded-lg border border-[#333b37]">
            <span className="text-[10px] text-[#9CA6A0] uppercase font-semibold">Hop Count</span>
            <div className="text-sm font-bold font-mono text-[#879B54] mt-0.5">{inspectedPacket.hopCount}</div>
          </div>

          <div className="bg-[#242927] p-2 rounded-lg border border-[#333b37]">
            <span className="text-[10px] text-[#9CA6A0] uppercase font-semibold">Remaining TTL</span>
            <div className="text-sm font-bold font-mono text-[#D49A3A] mt-0.5">{inspectedPacket.ttl} / 20</div>
          </div>

          <div className="bg-[#242927] p-2 rounded-lg border border-[#333b37]">
            <span className="text-[10px] text-[#9CA6A0] uppercase font-semibold">Retries</span>
            <div className="text-sm font-bold font-mono text-[#E8E6DE] mt-0.5">{inspectedPacket.retryCount}</div>
          </div>
        </div>

        {/* Chronological Hop History Trail */}
        <div>
          <span className="text-[11px] font-semibold text-[#E8E6DE] block mb-2 flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-[#879B54]" />
            Dynamic Hop Trail & Decision History:
          </span>

          <div className="relative pl-4 space-y-3 border-l-2 border-[#333b37] ml-2">
            {inspectedPacket.pathHistory.map((hop, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#171A19] ${
                  hop.action === 'ORIGINATED' ? 'bg-[#D49A3A]' :
                  hop.action === 'DELIVERED' ? 'bg-[#3F8F78]' :
                  hop.action === 'REROUTED' ? 'bg-[#879B54]' :
                  hop.action === 'DROPPED' ? 'bg-[#B84A3A]' :
                  hop.action === 'STORED' ? 'bg-[#D49A3A]' : 'bg-[#879B54]'
                }`} />

                <div className="bg-[#242927] hover:bg-[#2f3533] p-2 rounded-lg border border-[#333b37] transition-colors">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <button
                      onClick={() => selectNode(hop.nodeId)}
                      className="font-bold text-[#879B54] hover:underline flex items-center gap-1 font-mono"
                    >
                      {hop.nodeName || hop.nodeId}
                    </button>
                    <span className="text-[10px] font-mono text-[#9CA6A0]">Hop #{idx}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#9CA6A0] mb-1">
                    <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                      hop.action === 'ORIGINATED' ? 'bg-[#D49A3A]/20 text-[#D49A3A]' :
                      hop.action === 'DELIVERED' ? 'bg-[#3F8F78]/20 text-[#3F8F78]' :
                      hop.action === 'REROUTED' ? 'bg-[#879B54]/20 text-[#879B54]' :
                      hop.action === 'DROPPED' ? 'bg-[#B84A3A]/20 text-[#B84A3A]' : 'bg-[#879B54]/20 text-[#879B54]'
                    }`}>
                      {hop.action}
                    </span>
                    {hop.batteryAtHop !== undefined && (
                      <span className="font-mono text-[#9CA6A0]">Bat: {hop.batteryAtHop.toFixed(0)}%</span>
                    )}
                  </div>

                  {hop.note && (
                    <div className="text-[10px] text-[#9CA6A0] font-mono bg-[#171A19] p-1.5 rounded border border-[#333b37]">
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
