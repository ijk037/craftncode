import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  AlertOctagon, 
  MapPin, 
  Radio, 
  Send, 
  Target,
  MessageSquare,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface CitizenRequestsPanelProps {
  onTrackRoute?: () => void;
}

export const CitizenRequestsPanel: React.FC<CitizenRequestsPanelProps> = ({ onTrackRoute }) => {
  const citizenTickets = useMeshStore(state => state.citizenTickets);
  const resolvedTicketsHistory = useMeshStore(state => state.resolvedTicketsHistory);
  const packets = useMeshStore(state => state.packets);
  const authAuthority = useMeshStore(state => state.authAuthority);
  const selectPacket = useMeshStore(state => state.selectPacket);
  const selectNode = useMeshStore(state => state.selectNode);
  const dispatchRescueMission = useMeshStore(state => state.dispatchRescueMission);
  const resolveAndPurgeTicket = useMeshStore(state => state.resolveAndPurgeTicket);
  const sendTwoWayAuthorityMessage = useMeshStore(state => state.sendTwoWayAuthorityMessage);

  // Dispatch parameters
  const [selectedUnit, setSelectedUnit] = useState<string>('NDRF Squad Alpha-4');
  const [etaVal, setEtaVal] = useState<number>(15);
  const [directiveText, setDirectiveText] = useState<string>('Rescue en route. ETA 15m. Stay visible.');
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (citizenTickets.length === 0 && !showHistory) {
    return (
      <div className="bg-[#0f131d] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full text-xs text-slate-400 space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-bold text-slate-200 text-sm">ALL SOS REQUESTS RESOLVED</h3>
          <p className="text-slate-500 text-[11px] mt-1 max-w-xs leading-relaxed font-mono">
            Sector-01 mesh is clear. All emergency packets and relay queues have been purged from cache.
          </p>
        </div>

        {resolvedTicketsHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(true)}
            className="mt-2 text-cyan-400 hover:text-cyan-300 text-[11px] underline font-mono"
          >
            View Resolved Missions ({resolvedTicketsHistory.length})
          </button>
        )}
      </div>
    );
  }

  const handleTrack = (packetId: string, sourceNodeId?: string) => {
    selectPacket(packetId);
    if (sourceNodeId) selectNode(sourceNodeId);
    if (onTrackRoute) onTrackRoute();
  };

  const handleDispatch = (ticketId: string) => {
    const officer = authAuthority ? `${authAuthority.name} (${authAuthority.role})` : 'Capt. Elena Vance (CMD-4091)';
    dispatchRescueMission(ticketId, {
      unitName: selectedUnit,
      etaMinutes: etaVal,
      directive: directiveText,
      officerName: officer,
    });
  };

  const handleResolveAndPurge = (ticketId: string) => {
    resolveAndPurgeTicket(ticketId);
  };

  const handleSendChat = (ticketId: string) => {
    const text = chatInputs[ticketId]?.trim();
    if (!text) return;
    const officer = authAuthority ? authAuthority.name : 'Capt. Elena Vance';
    sendTwoWayAuthorityMessage(ticketId, text, officer);
    setChatInputs(prev => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div className="bg-[#0f131d] border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-2xl text-xs font-sans">
      {/* Header */}
      <div className="p-3.5 bg-[#171c25] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <div>
            <h2 className="font-bold text-rose-400 text-sm tracking-wide font-mono">ACTIVE SOS TRIAGE</h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase">SECTOR-01 • MESH ACTIVE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resolvedTicketsHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline"
            >
              {showHistory ? 'Hide History' : `History (${resolvedTicketsHistory.length})`}
            </button>
          )}

          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
            {citizenTickets.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="p-3.5 flex-1 overflow-y-auto space-y-4">
        {citizenTickets.map((ticket) => {
          const isDispatched = ticket.status === 'RESCUE_DISPATCHED';
          const associatedPacket = packets.find(p => p.messageId === ticket.packetId);

          return (
            <div
              key={ticket.ticketId}
              className={`p-3.5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                isDispatched
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#1b2029]/80 border-rose-400/80 pulse-border shadow-lg'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDispatched ? 'bg-emerald-400' : 'bg-rose-500'}`} />

              {/* Top Row */}
              <div className="pl-1.5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300 text-sm">#{ticket.ticketId}</span>
                    <span className="px-2 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50 text-[10px] font-bold uppercase font-mono">
                      {ticket.incidentType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-medium">
                    Trapped, {ticket.victimCount} People {ticket.hasInjuries ? '• ⚠️ Injured' : '• Uninjured'}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isDispatched ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isDispatched ? '✓ DISPATCHED' : `HOP #${ticket.hopProgress}`}
                </span>
              </div>

              {/* Location Clues */}
              <div className="pl-1.5 flex items-start gap-1.5 text-slate-300 text-[11px] bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>"{ticket.notes}"</span>
              </div>

              {/* Action Buttons */}
              <div className="pl-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTrack(ticket.packetId, associatedPacket?.sourceNodeId)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>TRACK ROUTE</span>
                </button>

                {isDispatched && (
                  <button
                    type="button"
                    onClick={() => handleResolveAndPurge(ticket.ticketId)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                    title="Evacuation Complete: Purge packet from all mesh relay buffers"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CONFIRM RESCUE & PURGE CACHE</span>
                  </button>
                )}
              </div>

              {/* Tactical Dispatch Panel (If not dispatched yet) */}
              {!isDispatched ? (
                <div className="pl-1.5 bg-[#121620] border border-slate-700/80 rounded-xl p-3 space-y-3">
                  <h3 className="text-[11px] font-bold text-cyan-300 uppercase font-mono tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    TACTICAL DISPATCH CONTROLS
                  </h3>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1 uppercase">
                      ASSIGN SQUADRON
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="NDRF Squad Alpha-4">NDRF Squad Alpha-4 (Ground Extraction)</option>
                      <option value="Air Ambulance S-1">Air Ambulance S-1 (Helicopter)</option>
                      <option value="Flood Boat Unit 7">Flood Boat Unit 7 (Inflatable)</option>
                      <option value="Drone Medical Payload Alpha">Drone Medical Payload Alpha</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                      <span>ETA OVERRIDE:</span>
                      <span className="text-cyan-300">{etaVal} MIN</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="45"
                      value={etaVal}
                      onChange={(e) => setEtaVal(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1 uppercase">
                      OFFICIAL DIRECTIVE TO VICTIM
                    </label>
                    <textarea
                      value={directiveText}
                      onChange={(e) => setDirectiveText(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2 text-xs font-mono text-cyan-200 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDispatch(ticket.ticketId)}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase font-mono"
                  >
                    <Radio className="w-4 h-4" />
                    <span>TRANSMIT DISPATCH ACROSS MESH</span>
                  </button>
                </div>
              ) : (
                <div className="pl-1.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 space-y-1 text-emerald-200 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Assigned: {ticket.assignedUnit}
                    </span>
                    <span className="font-mono text-emerald-300">ETA: ~{ticket.etaMinutes}m</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 italic">
                    "{ticket.officialDirective}"
                  </p>
                </div>
              )}

              {/* Two-Way Comms Feed */}
              <div className="pl-1.5 pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <MessageSquare className="w-3 h-3" />
                    TWO-WAY MESH CHAT
                  </span>
                  <span>{ticket.twoWayMessages?.length || 0} messages</span>
                </div>

                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {ticket.twoWayMessages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg text-[11px] ${
                        msg.sender === 'AUTHORITY'
                          ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 ml-2'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 mr-2'
                      }`}
                    >
                      <span className="font-bold text-[9px] block text-slate-400 mb-0.5">
                        {msg.authorName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={chatInputs[ticket.ticketId] || ''}
                    onChange={(e) => setChatInputs({ ...chatInputs, [ticket.ticketId]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat(ticket.ticketId)}
                    placeholder="Send directive across mesh..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendChat(ticket.ticketId)}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {/* Resolved History Tab */}
        {showHistory && resolvedTicketsHistory.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase font-mono flex items-center justify-between">
              <span>ARCHIVED RESOLVED MISSIONS</span>
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            </h4>
            {resolvedTicketsHistory.map((resTicket) => (
              <div
                key={resTicket.ticketId}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-emerald-400 font-mono">✓ {resTicket.ticketId}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(resTicket.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300">
                  {resTicket.victimCount} People ({resTicket.incidentType}) • {resTicket.assignedUnit}
                </p>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  Buffers & radio packets purged from all mesh nodes.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
