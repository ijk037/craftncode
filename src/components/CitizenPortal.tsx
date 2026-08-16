import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import type { MessageType } from '../models/Packet';
import { OfflineLLMModal } from './OfflineLLMModal';
import { OfflineMapModal } from './OfflineMapModal';
import { SurvivalGuideModal } from './SurvivalGuideModal';
import { EdgeNLPEngine, type StructuredSosMicroFrame } from '../ai/EdgeNLPEngine';
import { 
  Check, 
  Radio, 
  Truck, 
  Plus, 
  Minus, 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  HeartPulse, 
  AlertOctagon, 
  CheckCircle2, 
  Bot, 
  BookOpen, 
  PackageCheck, 
  LifeBuoy, 
  Flame, 
  Activity, 
  Compass, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface CitizenPortalProps {
  onOpenAuthorityLogin?: () => void;
  onOpenSmsModal?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = () => {
  const submitCitizenSos = useMeshStore(state => state.submitCitizenSos);
  const citizenTickets = useMeshStore(state => state.citizenTickets);
  const resolvedTicketsHistory = useMeshStore(state => state.resolvedTicketsHistory);
  const clearCitizenTickets = useMeshStore(state => state.clearCitizenTickets);
  const sendTwoWayCitizenMessage = useMeshStore(state => state.sendTwoWayCitizenMessage);

  // Modals
  const [isLlmModalOpen, setIsLlmModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [guideCategory, setGuideCategory] = useState<string>('bleeding');

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

  // Natural Language Edge SLM State
  const [nlEmergencyInput, setNlEmergencyInput] = useState<string>('I am trapped on the roof with 3 kids and water is rising fast, my arm is broken');
  const [parsedMicroFrame, setParsedMicroFrame] = useState<StructuredSosMicroFrame | null>(null);

  const handleAutoParseNl = () => {
    if (!nlEmergencyInput.trim()) return;
    const parsed = EdgeNLPEngine.parseEmergencyText(nlEmergencyInput);
    setParsedMicroFrame(parsed);
    setSelectedType(parsed.incidentType);
    setAdultCount(parsed.victimCount.adults);
    setChildCount(parsed.victimCount.children);
    setElderlyCount(parsed.victimCount.elderly);
    setIncludeInjuries(parsed.hasInjuries);
    if (parsed.injuryDescription) {
      setInjuryNotes(parsed.injuryDescription);
    }
    if (parsed.locationDetails) {
      setLocationNote(parsed.locationDetails);
    }
  };

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

  const openGuide = (cat: string) => {
    setGuideCategory(cat);
    setIsGuideModalOpen(true);
  };

  const isDispatched = latestTicket?.status === 'RESCUE_DISPATCHED';
  const isGateway = latestTicket?.status === 'GATEWAY_DELIVERED' || isDispatched;
  const isRelaying = latestTicket?.status === 'ROUTING' || isGateway;
  const isSent = !!latestTicket;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F3EE] text-[#252826] font-sans pb-20 select-none user-scrollbar">
      
      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="max-w-6xl mx-auto px-4 mt-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-[#173F35] border border-[#225548] rounded-2xl p-3.5 flex items-center gap-3 text-[#F5F3EE] shadow-lg">
            <ShieldCheck className="w-6 h-6 text-[#8da999] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-[#F5F3EE]">Emergency Packet Broadcasted!</h4>
              <p className="text-xs text-[#9ab5a6]">
                Transmitted into device-to-device BLE & LoRa radio mesh. Watch the status pipeline below as relays carry it to the relief center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Evacuation Banner */}
      {!latestTicket && latestResolved && (
        <div className="max-w-6xl mx-auto px-4 mt-3 animate-in fade-in">
          <div className="bg-[#E9E5DC] border-2 border-[#173F35] rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-[#173F35] shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-[#173F35]">
                  RESCUE OPERATION COMPLETE • SAFELY EVACUATED
                </h4>
                <p className="text-xs text-[#5c635f]">
                  {latestResolved.assignedUnit} completed extraction for ticket #{latestResolved.ticketId}. Radio packets purged from active mesh buffers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearCitizenTickets}
              className="px-3 py-1.5 rounded-xl bg-[#173F35] hover:bg-[#102d26] text-[#F5F3EE] text-xs font-bold shrink-0 transition-colors"
            >
              Reset to Standby
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout: Left Tool Dock + Right Content Area */}
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 flex flex-col lg:flex-row gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT TOOL DOCK (Offline LLM, Map, Survival Guides, Toolkit) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 shrink-0 space-y-3">
          
          <div className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#d8d1c3] pb-2">
              <span className="text-xs font-bold text-[#173F35] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-[#C65D32]" />
                Offline Tool Dock
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#173F35]/10 text-[#173F35]">
                100% Offline
              </span>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="space-y-2">
              {/* Button 1: Offline LLM (Qwen 2.5) */}
              <button
                type="button"
                onClick={() => setIsLlmModalOpen(true)}
                className="w-full p-3 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] hover:border-[#173F35]/40 text-left flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Bot className="w-5 h-5 text-[#8da999]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#173F35] flex items-center gap-1.5">
                      Offline AI Triage
                      <span className="w-2 h-2 rounded-full bg-[#3F8F78] animate-pulse" />
                    </h4>
                    <p className="text-[10px] text-[#6F8F7D] font-mono">Qwen 2.5-0.5B Local LLM</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#C65D32] bg-[#C65D32]/10 px-2 py-0.5 rounded-full">
                  Ask AI
                </span>
              </button>

              {/* Button 2: Offline Map & Shelters */}
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="w-full p-3 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] hover:border-[#173F35]/40 text-left flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Compass className="w-5 h-5 text-[#8da999]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#173F35]">Offline Map & Shelters</h4>
                    <p className="text-[10px] text-[#6F8F7D] font-mono">Vector GPS & Safe Camps</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#173F35] bg-[#173F35]/10 px-2 py-0.5 rounded-full">
                  Locate
                </span>
              </button>

              {/* Button 3: Emergency Survival & First-Aid Guides */}
              <button
                type="button"
                onClick={() => openGuide('bleeding')}
                className="w-full p-3 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] hover:border-[#173F35]/40 text-left flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <BookOpen className="w-5 h-5 text-[#8da999]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#173F35]">Survival & First-Aid</h4>
                    <p className="text-[10px] text-[#6F8F7D] font-mono">16 Medical Emergency Guides</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#173F35] bg-[#173F35]/10 px-2 py-0.5 rounded-full">
                  Read
                </span>
              </button>

              {/* Button 4: Improvised First-Aid Kit (British Red Cross) */}
              <button
                type="button"
                onClick={() => openGuide('improvised')}
                className="w-full p-3 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] hover:border-[#C65D32]/50 text-left flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C65D32] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#173F35]">No First-Aid Kit?</h4>
                    <p className="text-[10px] text-[#6F8F7D] font-mono">Everyday Items as Supplies</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#C65D32] bg-[#C65D32]/10 px-2 py-0.5 rounded-full">
                  Tips
                </span>
              </button>
            </div>
          </div>

          {/* Quick First-Aid Fast Jump Pills */}
          <div className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <span className="text-[11px] font-bold text-[#173F35] font-mono uppercase tracking-wide block">
              ⚡ Quick Emergency First-Aid:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => openGuide('bleeding')}
                className="p-2 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] text-left font-bold text-[#252826] flex items-center gap-1.5 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-[#A83F35]" />
                <span>Bleeding</span>
              </button>
              <button
                onClick={() => openGuide('burns')}
                className="p-2 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] text-left font-bold text-[#252826] flex items-center gap-1.5 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-[#C65D32]" />
                <span>Burns</span>
              </button>
              <button
                onClick={() => openGuide('cardiac')}
                className="p-2 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] text-left font-bold text-[#252826] flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#A83F35]" />
                <span>CPR / Heart</span>
              </button>
              <button
                onClick={() => openGuide('choking')}
                className="p-2 rounded-xl bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] text-left font-bold text-[#252826] flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#C65D32]" />
                <span>Choking</span>
              </button>
            </div>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* RIGHT MAIN AREA (Pipeline Reassurance & Emergency SOS Form) */}
        {/* ========================================================= */}
        <main className="flex-1 w-full space-y-6">

          {/* 1. Status Pipeline Card: Soft Sand (#E9E5DC) */}
          <section className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-xs font-bold text-[#173F35] tracking-widest uppercase mb-4 font-mono">
              OFFLINE SOS STATUS PIPELINE
            </h2>

            {/* Stepper Grid (4 Steps) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
              
              {/* Step 1: Sent */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                isSent
                  ? 'bg-[#173F35] text-[#F5F3EE] border-[#173F35] shadow-sm'
                  : 'bg-[#F5F3EE] text-[#6F8F7D] border-[#d8d1c3]'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 font-mono font-bold text-xs ${
                  isSent ? 'bg-[#F5F3EE] text-[#173F35]' : 'bg-[#E9E5DC] text-[#6F8F7D]'
                }`}>
                  {isSent ? <Check className="w-4 h-4 text-[#173F35] stroke-[3]" /> : '1'}
                </div>
                <span className="font-bold text-xs">1. SOS Sent</span>
                <span className="text-[10px] mt-0.5 opacity-85 font-mono">BLE & LoRa Broadcast</span>
              </div>

              {/* Step 2: Relaying */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                isRelaying
                  ? 'bg-[#173F35] text-[#F5F3EE] border-[#173F35] shadow-sm'
                  : isSent
                    ? 'bg-[#E9E5DC] text-[#173F35] border-[#173F35]/50 animate-pulse'
                    : 'bg-[#F5F3EE] text-[#6F8F7D] border-[#d8d1c3]'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 font-mono font-bold text-xs ${
                  isRelaying ? 'bg-[#F5F3EE] text-[#173F35]' : 'bg-[#E9E5DC] text-[#6F8F7D]'
                }`}>
                  {isRelaying ? <Check className="w-4 h-4 text-[#173F35] stroke-[3]" /> : <Radio className="w-4 h-4" />}
                </div>
                <span className="font-bold text-xs">2. Relaying</span>
                <span className="text-[10px] mt-0.5 opacity-85 font-mono">Hopping Relay Beacons</span>
              </div>

              {/* Step 3: HQ Received (Burnt Orange #C65D32) */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                isGateway
                  ? 'bg-[#C65D32] text-[#F5F3EE] border-[#C65D32] shadow-sm'
                  : 'bg-[#F5F3EE] text-[#6F8F7D] border-[#d8d1c3]'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 font-mono font-bold text-xs ${
                  isGateway ? 'bg-[#F5F3EE] text-[#C65D32]' : 'bg-[#E9E5DC] text-[#6F8F7D]'
                }`}>
                  {isGateway ? <Check className="w-4 h-4 text-[#C65D32] stroke-[3]" /> : '3'}
                </div>
                <span className="font-bold text-xs">3. HQ Received</span>
                <span className="text-[10px] mt-0.5 opacity-85 font-mono">Reverse ACK Verified</span>
              </div>

              {/* Step 4: Dispatched (Deep Forest #173F35) */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                isDispatched
                  ? 'bg-[#173F35] text-[#F5F3EE] border-[#173F35] shadow-sm'
                  : 'bg-[#F5F3EE] text-[#6F8F7D] border-[#d8d1c3]'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 font-mono font-bold text-xs ${
                  isDispatched ? 'bg-[#F5F3EE] text-[#173F35]' : 'bg-[#E9E5DC] text-[#6F8F7D]'
                }`}>
                  {isDispatched ? <Check className="w-4 h-4 text-[#173F35] stroke-[3]" /> : <Truck className="w-4 h-4" />}
                </div>
                <span className="font-bold text-xs">4. Help Dispatched</span>
                <span className="text-[10px] mt-0.5 opacity-85 font-mono">Rescue En Route</span>
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="mt-4 p-4 rounded-xl bg-[#F5F3EE] border border-[#d8d1c3] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${
                  isDispatched ? 'bg-[#173F35] animate-ping' : isGateway ? 'bg-[#C65D32] animate-pulse' : isSent ? 'bg-[#6F8F7D] animate-pulse' : 'bg-[#6F8F7D]'
                }`} />
                <p className="text-xs text-[#252826] font-medium leading-relaxed">
                  {isDispatched
                    ? `Help is on the way! ${latestTicket.assignedUnit || 'Rescue Unit'} dispatched with ETA ~${latestTicket.etaMinutes || 12} mins.`
                    : isGateway
                      ? `Relief Command received your emergency signal and verified receipt via reverse mesh ACK.`
                      : isSent
                        ? `Emergency packet is hopping through nearby LoRa relay beacons. Keep your phone on.`
                        : `No active emergency packet broadcasted. Use the form below if in danger.`}
                </p>
              </div>

              {latestTicket && (
                <button
                  onClick={clearCitizenTickets}
                  className="text-xs text-[#C65D32] hover:underline font-semibold font-mono shrink-0 ml-2"
                >
                  Clear SOS
                </button>
              )}
            </div>

            {/* Tactical Rescue Directive Callout */}
            {isDispatched && latestTicket?.officialDirective && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#173F35] text-[#F5F3EE] border border-[#225548] text-xs">
                <div className="flex items-center gap-2 font-bold mb-1 text-[#F5F3EE]">
                  <ShieldCheck className="w-4 h-4 text-[#8da999]" />
                  <span>COMMAND DIRECTIVE FROM {latestTicket.dispatchedBy || 'INCIDENT COMMANDER'}:</span>
                </div>
                <p className="text-xs text-[#dbe5e0] italic">
                  "{latestTicket.officialDirective}"
                </p>
              </div>
            )}
          </section>

          {/* 2. Emergency Incident Details Form */}
          <form onSubmit={handleBroadcast} className="space-y-5">
            
            {/* 🤖 Edge SLM Natural Language Interpreter (Qwen 2.5 on-device prompt -> 48-Byte Micro-Frame) */}
            <section className="bg-[#E9E5DC] border border-[#173F35]/40 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#173F35] text-[#F5F3EE] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#8da999]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#173F35] font-mono flex items-center gap-1.5">
                      Edge SLM Natural Language Interpreter
                      <span className="w-2 h-2 rounded-full bg-[#3F8F78] animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-[#6F8F7D]">Speaks or types naturally → translates into 48-byte LoRa micro-frame</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20">
                  On-Device Qwen 2.5
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={nlEmergencyInput}
                  onChange={(e) => setNlEmergencyInput(e.target.value)}
                  placeholder="e.g. 'I am trapped on the roof with 3 kids and water is rising fast, my arm is broken'..."
                  className="flex-1 bg-[#F5F3EE] border border-[#d8d1c3] focus:border-[#173F35] rounded-xl px-3.5 py-2.5 text-xs text-[#252826] placeholder-[#878e8a] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAutoParseNl}
                  className="px-4 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#102d26] text-[#F5F3EE] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8da999]" />
                  <span>Auto-Parse SOS</span>
                </button>
              </div>

              {parsedMicroFrame && (
                <div className="p-3 bg-[#F5F3EE] border border-[#d8d1c3] rounded-xl text-[11px] font-mono space-y-1 text-[#173F35]">
                  <div className="flex items-center justify-between font-bold">
                    <span>✓ SLM Parsed (Confidence: {(parsedMicroFrame.confidenceScore * 100).toFixed(0)}%)</span>
                    <span className="text-[10px] text-[#C65D32]">Priority Tier {parsedMicroFrame.priority}</span>
                  </div>
                  <div className="text-[10px] text-[#6F8F7D] truncate">
                    Binary 48B Frame: <span className="text-[#173F35] font-bold">{parsedMicroFrame.hexMicroFrame}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Category Grid */}
            <section className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[#173F35] tracking-widest uppercase font-mono">
                EMERGENCY INCIDENT CATEGORY
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'SOS', label: 'Life Threatening', icon: AlertOctagon, color: 'text-[#A83F35]' },
                  { id: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: 'text-[#A83F35]' },
                  { id: 'TRAPPED', label: 'Trapped in Rubble', icon: Radio, color: 'text-[#C65D32]' },
                  { id: 'EVACUATION', label: 'Evacuation Needed', icon: Truck, color: 'text-[#173F35]' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedType(item.id as MessageType)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#F5F3EE] border-2 border-[#173F35] shadow-md font-bold'
                          : 'bg-[#F5F3EE]/60 hover:bg-[#F5F3EE] border-[#d8d1c3] text-[#5c635f]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-xs text-[#252826] font-medium leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Victim Headcount Increments */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-[#5c635f] uppercase font-mono">
                  VICTIMS REQUIRING RESCUE ({adultCount + childCount + elderlyCount} TOTAL)
                </label>
                
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#F5F3EE] p-2.5 rounded-xl border border-[#d8d1c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#252826] block">Adults</span>
                      <span className="text-[10px] text-[#6F8F7D]">Age 18–64</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                        className="w-7 h-7 rounded-full bg-[#d8d1c3] hover:bg-[#c9c2b4] text-[#252826] flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-sm w-5 text-center text-[#252826]">{adultCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultCount(adultCount + 1)}
                        className="w-7 h-7 rounded-full bg-[#173F35] hover:bg-[#102d26] text-white flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F5F3EE] p-2.5 rounded-xl border border-[#d8d1c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#252826] block">Children</span>
                      <span className="text-[10px] text-[#6F8F7D]">Under 18</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setChildCount(Math.max(0, childCount - 1))}
                        className="w-7 h-7 rounded-full bg-[#d8d1c3] hover:bg-[#c9c2b4] text-[#252826] flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-sm w-5 text-center text-[#252826]">{childCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildCount(childCount + 1)}
                        className="w-7 h-7 rounded-full bg-[#173F35] hover:bg-[#102d26] text-white flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F5F3EE] p-2.5 rounded-xl border border-[#d8d1c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#252826] block">Elderly</span>
                      <span className="text-[10px] text-[#6F8F7D]">Age 65+</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setElderlyCount(Math.max(0, elderlyCount - 1))}
                        className="w-7 h-7 rounded-full bg-[#d8d1c3] hover:bg-[#c9c2b4] text-[#252826] flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-sm w-5 text-center text-[#252826]">{elderlyCount}</span>
                      <button
                        type="button"
                        onClick={() => setElderlyCount(elderlyCount + 1)}
                        className="w-7 h-7 rounded-full bg-[#173F35] hover:bg-[#102d26] text-white flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Injury Details Toggle */}
              <div className="bg-[#F5F3EE] p-3.5 rounded-xl border border-[#d8d1c3] space-y-2">
                <div className="flex items-center justify-between cursor-pointer">
                  <label htmlFor="injuries" className="text-xs font-bold text-[#252826] flex items-center gap-2 cursor-pointer">
                    <HeartPulse className="w-4 h-4 text-[#A83F35]" />
                    Include Injury / Medical Severity Details
                  </label>
                  <input
                    id="injuries"
                    type="checkbox"
                    checked={includeInjuries}
                    onChange={(e) => setIncludeInjuries(e.target.checked)}
                    className="w-4 h-4 accent-[#A83F35] rounded cursor-pointer"
                  />
                </div>

                {includeInjuries && (
                  <input
                    type="text"
                    value={injuryNotes}
                    onChange={(e) => setInjuryNotes(e.target.value)}
                    placeholder="Describe injuries (e.g. Heavy bleeding, broken limb, breathing difficulty...)"
                    className="w-full bg-[#E9E5DC] border border-[#d8d1c3] rounded-lg p-2.5 text-xs text-[#252826] placeholder-[#878e8a] focus:border-[#173F35] focus:outline-none"
                  />
                )}
              </div>

              {/* Landmark / Location Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5c635f] uppercase font-mono">
                  LANDMARK / EXACT LOCAL LOCATION
                </label>
                <input
                  type="text"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="e.g. 2nd floor roof, yellow building next to water tank"
                  className="w-full bg-[#F5F3EE] border-2 border-[#d8d1c3] focus:border-[#173F35] text-[#252826] placeholder-[#878e8a] rounded-xl p-3 text-xs focus:outline-none transition-colors"
                />
              </div>
            </section>

            {/* Primary SOS Action Button: Brick Red */}
            <div className="flex justify-center py-2">
              <button
                type="submit"
                className="w-full bg-[#A83F35] hover:bg-[#8e332a] text-white font-bold text-base tracking-wide uppercase rounded-2xl h-20 shadow-lg shadow-[#A83F35]/30 pulse-red flex flex-col items-center justify-center active:scale-98 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Radio className="w-5 h-5 animate-pulse" />
                  BROADCAST EMERGENCY SOS
                </span>
                <span className="text-[11px] text-[#F5F3EE]/90 font-mono normal-case">
                  Transmits into 5.0km LoRa & BLE Mesh (No Internet Needed)
                </span>
              </button>
            </div>
          </form>

          {/* Two-way Mesh Chat */}
          {latestTicket && (
            <section className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-5 flex flex-col shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#173F35] tracking-widest uppercase font-mono border-b border-[#d8d1c3] pb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C65D32]" />
                DIRECT TWO-WAY MESH EMERGENCY CHAT
              </h3>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 user-scrollbar">
                {latestTicket.twoWayMessages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs max-w-[85%] ${
                      msg.sender === 'AUTHORITY'
                        ? 'self-start bg-[#173F35] text-[#F5F3EE] shadow-sm'
                        : 'self-end ml-auto bg-[#F5F3EE] border border-[#d8d1c3] text-[#252826]'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold mb-1 flex justify-between gap-4">
                      <span className={msg.sender === 'AUTHORITY' ? 'text-[#8da999]' : 'text-[#C65D32]'}>
                        {msg.authorName}
                      </span>
                      <span className={msg.sender === 'AUTHORITY' ? 'text-[#9ab5a6]' : 'text-[#878e8a]'}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[#d8d1c3]">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type offline message to Incident Commander..."
                  className="flex-1 bg-[#F5F3EE] border border-[#d8d1c3] rounded-xl px-3.5 py-2.5 text-xs text-[#252826] placeholder-[#878e8a] focus:border-[#173F35] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#102d26] text-[#F5F3EE] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </section>
          )}

        </main>
      </div>

      {/* MODAL 1: Offline LLM Assistant (Qwen 2.5) */}
      <OfflineLLMModal
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
      />

      {/* MODAL 2: Offline Disaster Map & Relief Shelters */}
      <OfflineMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      {/* MODAL 3: Emergency Survival & First-Aid Manual */}
      <SurvivalGuideModal
        isOpen={isGuideModalOpen}
        initialCategory={guideCategory}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
};
