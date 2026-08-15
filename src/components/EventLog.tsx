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
    <div className="bg-[#080d1a] border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl text-xs">
      {/* Top Filter & Toolbar */}
      <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-xs">Mission Event Terminal</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs, packet ID..."
              className="bg-slate-950 border border-slate-800 rounded-md pl-6 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36"
            />
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-slate-400 hover:text-slate-200 transition-colors ${autoScroll ? 'text-cyan-400' : ''}`}
            title={autoScroll ? 'Auto-scroll Locked' : 'Auto-scroll Paused'}
          >
            {autoScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportLogsAsJson}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
            title="Export JSON Log"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-2.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrolling Log Output */}
      <div className="p-3 flex-1 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#060911]">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 italic font-sans text-xs">
            No events match current filter criteria.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-1.5 rounded flex items-start gap-2 border leading-relaxed transition-colors ${
                log.level === 'CRITICAL' ? 'bg-red-950/30 border-red-900/40 text-red-300' :
                log.level === 'WARN' ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' :
                log.level === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' :
                'bg-slate-900/30 border-slate-800/40 text-slate-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {log.level === 'CRITICAL' && <AlertOctagon className="w-3.5 h-3.5 text-red-400" />}
                {log.level === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                {log.level === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {log.level === 'INFO' && <Info className="w-3.5 h-3.5 text-cyan-400" />}
              </div>

              <span className="text-slate-500 shrink-0 select-none">[{log.timeString}]</span>

              <span className={`shrink-0 font-bold ${
                log.category === 'SOS' ? 'text-red-400' :
                log.category === 'FAILURE' ? 'text-purple-400' :
                log.category === 'ACK' ? 'text-emerald-400' :
                log.category === 'GATEWAY' ? 'text-blue-400' :
                log.category === 'STORE_FORWARD' ? 'text-orange-400' : 'text-cyan-400'
              }`}>
                [{log.category}]
              </span>

              <div className="flex-1 break-words">
                <span>{log.message}</span>
                {log.packetId && (
                  <button
                    onClick={() => selectPacket(log.packetId!)}
                    className="ml-1.5 text-cyan-400 underline hover:text-cyan-200"
                  >
                    View Packet #{log.packetId}
                  </button>
                )}
                {log.nodeId && (
                  <button
                    onClick={() => selectNode(log.nodeId!)}
                    className="ml-1.5 text-purple-400 underline hover:text-purple-200"
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
