import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import type { MessageType } from '../models/Packet';
import { 
  Signal, 
  BatteryCharging, 
  Lock, 
  Check, 
  Radio, 
  Truck, 
  Plus, 
  Minus, 
  Send, 
  ChevronDown, 
  ShieldCheck, 
  MessageSquare, 
  HeartPulse, 
  AlertOctagon, 
  Smartphone,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface CitizenPortalProps {
  onOpenAuthorityLogin: () => void;
  onOpenSmsModal: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ onOpenAuthorityLogin, onOpenSmsModal }) => {
  const submitCitizenSos = useMeshStore(state => state.submitCitizenSos);
  const citizenTickets = useMeshStore(state => state.citizenTickets);
  const resolvedTicketsHistory = useMeshStore(state => state.resolvedTicketsHistory);
  const clearCitizenTickets = useMeshStore(state => state.clearCitizenTickets);
  const sendTwoWayCitizenMessage = useMeshStore(state => state.sendTwoWayCitizenMessage);

  // Form State
  const [selectedType, setSelectedType] = useState<MessageType>('SOS');
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(0);
  const [elderlyCount, setElderlyCount] = useState<number>(1);
  const [includeInjuries, setIncludeInjuries] = useState<boolean>(true);
  const [injuryNotes, setInjuryNotes] = useState<string>('Heavy bleeding, broken limb');
  const [locationNote, setLocationNote] = useState<string>('2nd floor roof, yellow building');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const latestTicket = citizenTickets[0];
  const latestResolved = resolvedTicketsHistory[0];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const totalVictims = Math.max(1, adultCount + childCount + elderlyCount);
    const combinedNotes = `${locationNote}${includeInjuries ? ` [Injuries: ${injuryNotes}]` : ''} (Adults: ${adultCount}, Kids: ${childCount}, Elderly: ${elderlyCount})`;

    submitCitizenSos({
      incidentType: selectedType,
      victimCount: totalVictims,
      hasInjuries: includeInjuries,
      notes: combinedNotes,
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !latestTicket) return;
    sendTwoWayCitizenMessage(latestTicket.ticketId, chatMessage.trim());
    setChatMessage('');
  };

  const isDispatched = latestTicket?.status === 'RESCUE_DISPATCHED';
  const isGateway = latestTicket?.status === 'GATEWAY_DELIVERED' || isDispatched;
  const isRelaying = latestTicket?.status === 'ROUTING' || isGateway;
  const isSent = !!latestTicket;

  return (
    <div className="flex-1 overflow-y-auto bg-[#080d1a] text-slate-100 font-sans pb-24 md:pb-8 select-none">
      
      {/* Top App Bar / Offline Beacon Status */}
      <header className="sticky top-0 z-40 bg-[#161f30]/90 backdrop-blur-xl border-b border-slate-700/60 shadow-[0_0_15px_rgba(83,225,111,0.15)] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Signal className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 font-mono tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
            CONNECTED TO LOCAL MESH RELAY • 100% OFFLINE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>94%</span>
          </div>

          <button
            onClick={onOpenSmsModal}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SMS Bridge</span>
          </button>

          <button
            onClick={onOpenAuthorityLogin}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Authority Sign-In</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {showSuccessToast && (
        <div className="max-w-3xl mx-auto px-4 mt-3">
          <div className="bg-emerald-950/90 border border-emerald-500/70 rounded-xl p-3.5 flex items-center gap-3 text-emerald-200 shadow-xl animate-in fade-in">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Emergency Packet Broadcasted!</h4>
              <p className="text-xs text-emerald-300/90">
                Transmitted over offline Bluetooth & LoRa radio. Watch the status pipeline below as intermediate relays route it to the relief center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Evacuation Banner (When tickets are purged from cache) */}
      {!latestTicket && latestResolved && (
        <div className="max-w-3xl mx-auto px-4 mt-3 animate-in fade-in">
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">
                  RESCUE OPERATION COMPLETE • SAFELY EVACUATED
                </h4>
                <p className="text-xs text-slate-300">
                  {latestResolved.assignedUnit} completed extraction for ticket #{latestResolved.ticketId}. Radio packets purged from all mesh node caches.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearCitizenTickets}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standby</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-6">
        
        {/* 4-Stage Reassurance Tracker */}
        <section className="bg-[#161f30] border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest text-center uppercase font-mono mb-4">
            SOS BROADCAST STATUS {latestTicket ? `(#${latestTicket.ticketId})` : latestResolved ? `(#${latestResolved.ticketId} - RESOLVED)` : ''}
          </h3>

          <div className="relative flex justify-between items-center px-4">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-700/80 -z-0 transform -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-8 h-1 bg-emerald-400 -z-0 transform -translate-y-1/2 transition-all duration-700" 
              style={{
                width: isDispatched || (!latestTicket && latestResolved) ? 'calc(100% - 4rem)' : isGateway ? '66%' : isRelaying ? '33%' : isSent ? '10%' : '0%'
              }}
            />

            {/* Stage 1: SENT */}
            <div className="flex flex-col items-center gap-1.5 bg-[#161f30] px-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isSent || latestResolved ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isSent || latestResolved ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className={`text-[10px] font-mono font-bold ${isSent || latestResolved ? 'text-emerald-400' : 'text-slate-500'}`}>SENT</span>
            </div>

            {/* Stage 2: RELAYED */}
            <div className="flex flex-col items-center gap-1.5 bg-[#161f30] px-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isRelaying || latestResolved ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isRelaying || latestResolved ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className={`text-[10px] font-mono font-bold ${isRelaying || latestResolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                {latestTicket?.hopProgress ? `HOP #${latestTicket.hopProgress}` : 'RELAYED'}
              </span>
            </div>

            {/* Stage 3: HQ RECEIVED */}
            <div className="flex flex-col items-center gap-1.5 bg-[#161f30] px-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isGateway || latestResolved ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 pulse-green' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                <Radio className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-mono font-bold ${isGateway || latestResolved ? 'text-amber-300' : 'text-slate-500'}`}>HQ RECEIVED</span>
            </div>

            {/* Stage 4: DISPATCH */}
            <div className="flex flex-col items-center gap-1.5 bg-[#161f30] px-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDispatched || latestResolved ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/40 pulse-green' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-mono font-bold ${isDispatched || latestResolved ? 'text-emerald-300' : 'text-slate-500'}`}>
                {latestResolved && !latestTicket ? 'RESOLVED' : 'DISPATCH'}
              </span>
            </div>
          </div>
        </section>

        {/* Reassurance Callout Card */}
        {latestTicket && (
          <section className={`border-l-4 rounded-r-2xl p-4 transition-all ${
            isDispatched 
              ? 'bg-[#162725] border-emerald-400 shadow-[0_4px_20px_rgba(52,199,89,0.15)]' 
              : 'bg-[#161f30] border-amber-400/80 shadow-md'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{isDispatched ? '🛡️' : '📡'}</span>
              <div className="space-y-1">
                <h4 className={`text-sm font-bold uppercase tracking-wide ${
                  isDispatched ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {isDispatched ? 'RESCUE SQUADRON DISPATCHED' : 'SIGNAL ROUTING IN PROGRESS'}
                </h4>
                <p className="text-xs text-slate-300">
                  {latestTicket.assignedUnit 
                    ? `Assigned: ${latestTicket.assignedUnit}`
                    : 'Your emergency frame is currently hopping across peer mesh beacons toward Relief HQ.'}
                </p>
                {latestTicket.etaMinutes && (
                  <p className="text-xs font-bold text-emerald-400 font-mono">
                    ETA: ~{latestTicket.etaMinutes} Minutes.
                  </p>
                )}
                <div className="mt-2 bg-[#0c121e] p-2.5 rounded-lg border border-slate-700/80 text-xs text-amber-200 leading-relaxed font-sans">
                  <span className="font-bold text-amber-300">Directive: </span>
                  {latestTicket.officialDirective || 'Stay sheltered, keep phone in battery saver mode, listen for rescue sirens.'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Emergency Category Grid */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            Select Incident Type
          </h2>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setSelectedType('SOS')}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all h-32 active:scale-95 ${
                selectedType === 'SOS'
                  ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-[#161f30] border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🚨</span>
              <span className="font-bold text-xs text-center leading-tight">Life Threatening Collapse</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('MEDICAL')}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all h-32 active:scale-95 ${
                selectedType === 'MEDICAL'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-[#161f30] border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🩺</span>
              <span className="font-bold text-xs text-center leading-tight">Medical / Heavy Bleeding</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('TRAPPED')}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all h-32 active:scale-95 ${
                selectedType === 'TRAPPED'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#161f30] border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🏚️</span>
              <span className="font-bold text-xs text-center leading-tight">Trapped in Rubble</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('WATER')}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all h-32 active:scale-95 ${
                selectedType === 'WATER'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#161f30] border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🌊</span>
              <span className="font-bold text-xs text-center leading-tight">Flood / Rising Water</span>
            </button>
          </div>
        </section>

        {/* Incident Details Section */}
        <form onSubmit={handleBroadcast} className="space-y-4">
          <section className="bg-[#161f30] border border-slate-700/80 rounded-2xl p-5 space-y-5 shadow-xl">
            <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase font-mono border-b border-slate-700/80 pb-2">
              INCIDENT DETAILS
            </h3>

            {/* Steppers */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0c121e] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">Adults</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm w-5 text-center">{adultCount}</span>
                  <button
                    type="button"
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#0c121e] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">Children</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm w-5 text-center">{childCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#0c121e] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-200">Elderly</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setElderlyCount(Math.max(0, elderlyCount - 1))}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm w-5 text-center">{elderlyCount}</span>
                  <button
                    type="button"
                    onClick={() => setElderlyCount(elderlyCount + 1)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Injury Toggle */}
            <div className="bg-[#0c121e] p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between cursor-pointer">
                <label htmlFor="injuries" className="text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  Include Injury Details
                </label>
                <input
                  id="injuries"
                  type="checkbox"
                  checked={includeInjuries}
                  onChange={(e) => setIncludeInjuries(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
              </div>

              {includeInjuries && (
                <input
                  type="text"
                  value={injuryNotes}
                  onChange={(e) => setInjuryNotes(e.target.value)}
                  placeholder="Describe injuries (e.g. Heavy bleeding, broken limb...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-red-400 focus:outline-none"
                />
              )}
            </div>

            {/* Landmark / Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                LANDMARK / EXACT LOCATION
              </label>
              <input
                type="text"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g. 2nd floor roof, yellow building"
                className="w-full bg-[#0c121e] border-2 border-slate-700 focus:border-amber-400 text-slate-100 rounded-xl p-3 text-xs focus:outline-none transition-colors"
              />
            </div>
          </section>

          {/* Primary SOS Action Button */}
          <div className="flex justify-center py-3">
            <button
              type="submit"
              className="w-full max-w-md bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base tracking-wide uppercase rounded-full h-20 shadow-[0_0_25px_rgba(255,85,69,0.45)] pulse-red flex flex-col items-center justify-center active:scale-95 transition-transform"
            >
              <span className="flex items-center gap-2">
                <Radio className="w-5 h-5 animate-pulse" />
                BROADCAST SOS
              </span>
              <span className="text-[10px] text-red-200 font-mono normal-case">
                Transmits into 5.0km LoRa & BLE Mesh
              </span>
            </button>
          </div>
        </form>

        {/* Two-way Mesh Chat */}
        {latestTicket && (
          <section className="bg-[#161f30] border border-slate-700/80 rounded-2xl p-4 flex flex-col shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase font-mono border-b border-slate-700/80 pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              TWO-WAY MESH CHAT
            </h3>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {latestTicket.twoWayMessages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                    msg.sender === 'AUTHORITY'
                      ? 'self-start bg-[#0d221e] border border-emerald-500/50 text-emerald-200'
                      : 'self-end ml-auto bg-slate-900 border border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="text-[9px] font-mono font-bold text-slate-400 mb-0.5 flex justify-between gap-4">
                    <span className={msg.sender === 'AUTHORITY' ? 'text-emerald-400' : 'text-cyan-400'}>
                      {msg.authorName}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type message to Command HQ..."
                className="flex-1 bg-[#0c121e] border border-slate-700 focus:border-amber-400 text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        )}

        {/* Survival Directives */}
        <section className="space-y-3 pb-8">
          <h3 className="text-xs font-bold text-amber-300 tracking-widest uppercase font-mono ml-1">
            SURVIVAL DIRECTIVES
          </h3>

          <details className="bg-[#161f30] border border-slate-700/80 rounded-xl group p-4">
            <summary className="font-bold text-xs cursor-pointer flex justify-between items-center list-none text-slate-200">
              <span className="flex items-center gap-2">
                <span className="text-base">🪨</span> Pipe Tapping (3 Beats Pattern)
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pt-3 border-t border-slate-800 mt-2 text-slate-400 text-xs leading-relaxed">
              Tap on metal pipes or solid concrete 3 times loudly, then pause for 10 seconds. Listen for a response. Rescuers are trained to listen for sets of 3.
            </div>
          </details>

          <details className="bg-[#161f30] border border-slate-700/80 rounded-xl group p-4">
            <summary className="font-bold text-xs cursor-pointer flex justify-between items-center list-none text-slate-200">
              <span className="flex items-center gap-2">
                <span className="text-base">🔋</span> Battery Saving Protocol
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pt-3 border-t border-slate-800 mt-2 text-slate-400 text-xs leading-relaxed">
              Dim screen brightness to minimum. The peer mesh beacon will continue transmitting in ultra-low-power background mode. Keep phone warm against your body.
            </div>
          </details>
        </section>

      </main>
    </div>
  );
};
