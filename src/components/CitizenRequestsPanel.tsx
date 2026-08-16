import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { webLlmService } from '../services/webLlmService';
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
  Bot,
  Sparkles,
  Zap,
  RefreshCw
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

  // Real LLM Tactical Triage State
  const [isGeneratingAiTriage, setIsGeneratingAiTriage] = useState<boolean>(false);
  const [aiTriageOutput, setAiTriageOutput] = useState<string>('');

  const handleGenerateRealTriage = async () => {
    if (citizenTickets.length === 0 || isGeneratingAiTriage) return;
    setIsGeneratingAiTriage(true);
    setAiTriageOutput('');
    try {
      const result = await webLlmService.generateRealCommandTriage(citizenTickets, (tokenChunk) => {
        setAiTriageOutput(tokenChunk);
      });
      setAiTriageOutput(result);
    } catch (err: any) {
      setAiTriageOutput(`⚠️ Error connecting to local Qwen: ${err.message}\n\nPlease run 'ollama run qwen2.5:0.5b' in PowerShell.`);
    } finally {
      setIsGeneratingAiTriage(false);
    }
  };

  if (citizenTickets.length === 0 && !showHistory) {
    return (
      <div className="bg-[#171A19] border border-[#333b37] rounded-xl p-6 flex flex-col items-center justify-center text-center h-full text-xs text-[#9CA6A0] space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#242927] border border-[#333b37] flex items-center justify-center text-[#3F8F78] shadow-lg shadow-[#3F8F78]/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-bold text-[#E8E6DE] text-sm font-mono">ALL SOS REQUESTS RESOLVED</h3>
          <p className="text-[#9CA6A0] text-[11px] mt-1 max-w-xs leading-relaxed font-mono">
            Sector-01 mesh is clear. All emergency packets and relay queues have been purged from cache.
          </p>
        </div>

        {resolvedTicketsHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(true)}
            className="mt-2 text-[#879B54] hover:text-[#9db364] text-[11px] underline font-mono font-semibold"
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
    <div className="bg-[#171A19] border border-[#333b37] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl text-xs font-sans">
      {/* Header */}
      <div className="p-3 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 text-[#B84A3A]" />
          <div>
            <h2 className="font-bold text-[#E8E6DE] text-sm tracking-wide font-mono">ACTIVE SOS TRIAGE</h2>
            <p className="text-[10px] text-[#9CA6A0] font-mono uppercase">SECTOR-01 • MESH ACTIVE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resolvedTicketsHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-[10px] font-mono text-[#9CA6A0] hover:text-[#E8E6DE] underline"
            >
              {showHistory ? 'Hide History' : `History (${resolvedTicketsHistory.length})`}
            </button>
          )}

          <span className="px-2 py-0.5 rounded bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40 text-[10px] font-mono font-bold animate-pulse">
            {citizenTickets.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
        
        {/* 🤖 Command AI Triage & Cluster Recommender */}
        {citizenTickets.length > 0 && (
          <div className="p-3 rounded-xl bg-[#1d2220] border border-[#879B54]/40 space-y-2 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#E8E6DE] flex items-center gap-1.5 font-mono text-[11px]">
                <Bot className="w-3.5 h-3.5 text-[#879B54]" />
                Command AI Triage & Cluster Allocator
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#879B54]/20 text-[#879B54]">
                NLP Triage Engine
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-[#171A19] border border-[#333b37]">
                <span className="text-[#B84A3A] block font-bold">CRITICAL MEDICAL</span>
                <span className="text-[#E8E6DE]">
                  {citizenTickets.filter(t => t.incidentType === 'MEDICAL' || t.incidentType === 'SOS').length} Tickets
                </span>
              </div>
              <div className="p-1.5 rounded bg-[#171A19] border border-[#333b37]">
                <span className="text-[#D49A3A] block font-bold">TRAPPED DEBRIS</span>
                <span className="text-[#E8E6DE]">
                  {citizenTickets.filter(t => t.incidentType === 'TRAPPED').length} Tickets
                </span>
              </div>
              <div className="p-1.5 rounded bg-[#171A19] border border-[#333b37]">
                <span className="text-[#3F8F78] block font-bold">EVACUATION</span>
                <span className="text-[#E8E6DE]">
                  {citizenTickets.filter(t => t.incidentType === 'EVACUATION').length} Tickets
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#9CA6A0] bg-[#171A19] p-2.5 rounded-lg border border-[#333b37] space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#879B54] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tactical AI Triage Analysis
                </span>
                <button
                  type="button"
                  disabled={isGeneratingAiTriage}
                  onClick={handleGenerateRealTriage}
                  className="px-2.5 py-1 rounded-md bg-[#879B54]/20 hover:bg-[#879B54]/30 text-[#879B54] border border-[#879B54]/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                >
                  {isGeneratingAiTriage ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Qwen Computing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" />
                      <span>Run Real Qwen 2.5 Triage</span>
                    </>
                  )}
                </button>
              </div>

              {aiTriageOutput ? (
                <div className="p-2 rounded bg-[#242927] border border-[#879B54]/30 text-[11px] text-[#E8E6DE] font-mono whitespace-pre-wrap leading-relaxed">
                  {aiTriageOutput}
                </div>
              ) : (
                <div className="text-[10px] text-[#9CA6A0] italic">
                  Click "Run Real Qwen 2.5 Triage" to stream on-device neural triage analysis of active mesh packets.
                </div>
              )}
            </div>
          </div>
        )}

        {citizenTickets.map((ticket) => {
          const isDispatched = ticket.status === 'RESCUE_DISPATCHED';
          const associatedPacket = packets.find(p => p.messageId === ticket.packetId);

          return (
            <div
              key={ticket.ticketId}
              className={`p-3.5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                isDispatched
                  ? 'bg-[#242927] border-[#3F8F78]/60 shadow-md shadow-[#3F8F78]/10'
                  : 'bg-[#242927] border-[#B84A3A]/70 pulse-border shadow-md'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDispatched ? 'bg-[#3F8F78]' : 'bg-[#B84A3A]'}`} />

              {/* Top Row */}
              <div className="pl-1.5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#E8E6DE] text-sm">#{ticket.ticketId}</span>
                    <span className="px-2 py-0.2 rounded bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40 text-[10px] font-bold uppercase font-mono">
                      {ticket.incidentType}
                    </span>
                  </div>
                  <p className="text-xs text-[#E8E6DE] mt-1 font-medium">
                    Trapped, {ticket.victimCount} People {ticket.hasInjuries ? '• ⚠️ Injured' : '• Uninjured'}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isDispatched 
                    ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40' 
                    : 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40'
                }`}>
                  {ticket.status}
                </span>
              </div>

              {/* Notes & Location */}
              <div className="pl-1.5 text-[11px] text-[#9CA6A0] bg-[#171A19] p-2 rounded-lg border border-[#333b37] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D49A3A] shrink-0 mt-0.5" />
                <span className="leading-tight text-[#E8E6DE]/90">{ticket.notes}</span>
              </div>

              {/* Action: Track on Map */}
              <div className="pl-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTrack(ticket.packetId, associatedPacket?.sourceNodeId)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#171A19] hover:bg-[#2f3533] text-[#879B54] hover:text-[#9db364] border border-[#333b37] hover:border-[#879B54]/40 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>TRACK MULTI-HOP ROUTE ON MAP</span>
                </button>
              </div>

              {/* Rescue Dispatch Controls */}
              {!isDispatched ? (
                <div className="pl-1.5 pt-2 border-t border-[#333b37] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#E8E6DE] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#879B54]" />
                      Dispatch Rescue Squadron:
                    </span>
                    <span className="text-[10px] font-mono text-[#D49A3A] font-bold">ETA: ~{etaVal}m</span>
                  </div>

                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-[#171A19] border border-[#333b37] rounded-lg p-2 text-xs text-[#E8E6DE] font-semibold focus:border-[#879B54] focus:outline-none"
                  >
                    <option value="NDRF Squad Alpha-4">🚒 NDRF Squad Alpha-4 (Urban SAR)</option>
                    <option value="Air Medical Copter 2">🚁 Air Medical Evac (Copter 2)</option>
                    <option value="Inflatable Flood Extraction Boat 7">🚤 Inflatable Flood Boat Unit 7</option>
                    <option value="Autonomous Drone Medical Drop">🤖 Autonomous Drone Medical Drop</option>
                  </select>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#9CA6A0] font-mono">
                      <span>Adjust Estimated Arrival:</span>
                      <span className="text-[#879B54] font-bold">{etaVal} mins</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="45"
                      step="1"
                      value={etaVal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setEtaVal(val);
                        setDirectiveText(`Rescue squadron en route with trauma kit. ETA ~${val}m. Keep flashlight visible.`);
                      }}
                      className="w-full h-1 bg-[#171A19] rounded appearance-none cursor-pointer accent-[#879B54]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#9CA6A0] uppercase font-mono">
                      Official Directive to Trapped Citizens:
                    </label>
                    <textarea
                      rows={2}
                      value={directiveText}
                      onChange={(e) => setDirectiveText(e.target.value)}
                      className="w-full bg-[#171A19] border border-[#333b37] rounded-lg p-2 text-xs text-[#E8E6DE] focus:border-[#879B54] focus:outline-none resize-none leading-tight"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDispatch(ticket.ticketId)}
                    className="w-full py-2.5 rounded-xl bg-[#879B54] hover:bg-[#748647] text-[#171A19] font-bold text-xs shadow-md shadow-[#879B54]/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <Radio className="w-4 h-4" />
                    <span>TRANSMIT DISPATCH ACROSS MESH</span>
                  </button>
                </div>
              ) : (
                /* Dispatched Active Status & Action to Resolve / Purge */
                <div className="pl-1.5 pt-2 border-t border-[#333b37] space-y-2.5">
                  <div className="bg-[#171A19] p-2.5 rounded-lg border border-[#3F8F78]/50 flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#3F8F78] font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Squadron En Route ({ticket.assignedUnit})</span>
                      </div>
                      <p className="text-[11px] text-[#9CA6A0] font-mono">
                        Commander: {ticket.dispatchedBy} • ETA: ~{ticket.etaMinutes}m
                      </p>
                      <p className="text-[11px] text-[#D49A3A] italic">
                        "{ticket.officialDirective}"
                      </p>
                    </div>
                  </div>

                  {/* Complete Evacuation & Purge Mesh Cache Button */}
                  <button
                    type="button"
                    onClick={() => handleResolveAndPurge(ticket.ticketId)}
                    className="w-full py-2 rounded-xl bg-[#3F8F78] hover:bg-[#357a66] text-[#171A19] font-bold text-xs shadow-md shadow-[#3F8F78]/20 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ CONFIRM RESCUE & PURGE CACHE</span>
                  </button>
                </div>
              )}

              {/* Two-Way Tactical Mesh Chat */}
              <div className="pl-1.5 pt-2 border-t border-[#333b37] space-y-2">
                <span className="text-[10px] font-bold text-[#9CA6A0] uppercase font-mono flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#879B54]" />
                  Direct Tactical Mesh Feed:
                </span>

                <div className="max-h-24 overflow-y-auto space-y-1.5 bg-[#171A19] p-2 rounded-lg border border-[#333b37]">
                  {ticket.twoWayMessages && ticket.twoWayMessages.length > 0 ? (
                    ticket.twoWayMessages.map(msg => (
                      <div key={msg.id} className="text-[10px] leading-tight">
                        <span className={`font-mono font-bold ${msg.sender === 'AUTHORITY' ? 'text-[#879B54]' : 'text-[#D49A3A]'}`}>
                          {msg.authorName}:{' '}
                        </span>
                        <span className="text-[#E8E6DE]">{msg.text}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#6b7771] italic font-mono">No radio messages yet.</span>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={chatInputs[ticket.ticketId] || ''}
                    onChange={(e) => setChatInputs({ ...chatInputs, [ticket.ticketId]: e.target.value })}
                    placeholder="Send order to victim..."
                    className="flex-1 bg-[#171A19] border border-[#333b37] rounded-lg px-2.5 py-1 text-xs text-[#E8E6DE] placeholder-[#6b7771] focus:border-[#879B54] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendChat(ticket.ticketId)}
                    className="px-3 py-1 rounded-lg bg-[#879B54] hover:bg-[#748647] text-[#171A19] font-bold text-xs flex items-center justify-center transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {/* Resolved History List */}
        {showHistory && resolvedTicketsHistory.length > 0 && (
          <div className="pt-2 border-t border-[#333b37] space-y-2">
            <h4 className="text-xs font-bold text-[#3F8F78] font-mono uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Archived Resolved Missions:
            </h4>
            {resolvedTicketsHistory.map((res) => (
              <div key={res.ticketId} className="p-2.5 rounded-lg bg-[#242927] border border-[#333b37] text-[11px] text-[#9CA6A0] space-y-1">
                <div className="flex justify-between font-mono font-bold text-[#E8E6DE]">
                  <span>#{res.ticketId} ({res.incidentType})</span>
                  <span className="text-[#3F8F78]">✓ EVACUATED</span>
                </div>
                <p className="text-[10px] text-[#6b7771]">{res.notes}</p>
                <p className="text-[10px] text-[#879B54]">Extracted by: {res.assignedUnit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
