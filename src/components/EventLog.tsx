import React, { useState, useRef } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Download, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info 
} from 'lucide-react';

export const EventLog: React.FC = () => {
  const logs = useMeshStore(state => state.logs);
  const clearLogs = useMeshStore(state => state.clearLogs);
  const selectPacket = useMeshStore(state => state.selectPacket);
  const selectNode = useMeshStore(state => state.selectNode);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const categories = ['ALL', 'SOS', 'ROUTING', 'FAILURE', 'ACK', 'GATEWAY', 'STORE_FORWARD'];

  const filteredLogs = logs.filter(log => {
    if (filterCategory !== 'ALL' && log.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.packetId && log.packetId.toLowerCase().includes(q)) ||
        (log.nodeId && log.nodeId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `resq-mesh-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-[#171A19] border border-[#333b37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl text-xs font-sans">
      {/* Top Filter & Toolbar */}
      <div className="p-2.5 bg-[#242927] border-b border-[#333b37] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#879B54]" />
          <span className="font-bold text-[#E8E6DE] text-xs font-mono">Mission Event Terminal</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171A19] text-[#9CA6A0] border border-[#333b37]">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-[#9CA6A0] absolute left-2 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs, packet ID..."
              className="bg-[#171A19] border border-[#333b37] rounded-lg pl-6 pr-2 py-1 text-[11px] text-[#E8E6DE] placeholder-[#6b7771] focus:outline-none focus:border-[#879B54] w-36"
            />
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-[#9CA6A0] hover:text-[#E8E6DE] transition-colors ${autoScroll ? 'text-[#879B54]' : ''}`}
            title={autoScroll ? 'Auto-scroll Locked' : 'Auto-scroll Paused'}
          >
            {autoScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportLogsAsJson}
            className="p-1 text-[#9CA6A0] hover:text-[#E8E6DE] rounded hover:bg-[#171A19] transition-colors"
            title="Export JSON Log"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-1 text-[#9CA6A0] hover:text-[#B84A3A] rounded hover:bg-[#171A19] transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-2.5 py-1.5 bg-[#1d2220] border-b border-[#333b37] flex items-center gap-1 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40'
                : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrolling Log Output */}
      <div className="p-3 flex-1 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#171A19]">
        {filteredLogs.length === 0 ? (
          <div className="text-[#6b7771] text-center py-6 italic font-sans text-xs">
            No events match current filter criteria.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-1.5 rounded flex items-start gap-2 border leading-relaxed transition-colors ${
                log.level === 'CRITICAL' ? 'bg-[#B84A3A]/15 border-[#B84A3A]/30 text-[#B84A3A]' :
                log.level === 'WARN' ? 'bg-[#D49A3A]/15 border-[#D49A3A]/30 text-[#D49A3A]' :
                log.level === 'SUCCESS' ? 'bg-[#3F8F78]/15 border-[#3F8F78]/30 text-[#3F8F78]' :
                'bg-[#242927] border-[#333b37] text-[#E8E6DE]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {log.level === 'CRITICAL' && <AlertOctagon className="w-3.5 h-3.5 text-[#B84A3A]" />}
                {log.level === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-[#D49A3A]" />}
                {log.level === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F78]" />}
                {log.level === 'INFO' && <Info className="w-3.5 h-3.5 text-[#879B54]" />}
              </div>

              <span className="text-[#9CA6A0] shrink-0 select-none">[{log.timeString}]</span>

              <span className={`shrink-0 font-bold ${
                log.category === 'SOS' ? 'text-[#B84A3A]' :
                log.category === 'FAILURE' ? 'text-[#B84A3A]' :
                log.category === 'ACK' ? 'text-[#3F8F78]' :
                log.category === 'GATEWAY' ? 'text-[#879B54]' :
                log.category === 'STORE_FORWARD' ? 'text-[#D49A3A]' : 'text-[#879B54]'
              }`}>
                [{log.category}]
              </span>

              <div className="flex-1 break-words">
                <span>{log.message}</span>
                {log.packetId && (
                  <button
                    onClick={() => selectPacket(log.packetId!)}
                    className="ml-1.5 text-[#879B54] underline hover:text-[#9db364]"
                  >
                    View #{log.packetId}
                  </button>
                )}
                {log.nodeId && (
                  <button
                    onClick={() => selectNode(log.nodeId!)}
                    className="ml-1.5 text-[#D49A3A] underline hover:text-[#ba842e]"
                  >
                    Inspect {log.nodeId}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
