import { useEffect, useState } from 'react';
import { useMeshStore } from './store/useMeshStore';
import { useSimulationClock } from './simulation/useSimulationClock';
import { Header } from './components/Header';
import { CitizenPortal } from './components/CitizenPortal';
import { AuthorityLogin } from './components/AuthorityLogin';
import { CitizenRequestsPanel } from './components/CitizenRequestsPanel';
import { NetworkMap } from './components/NetworkMap';
import { CommandDashboard } from './components/CommandDashboard';
import { NodeInspector } from './components/NodeInspector';
import { PacketInspector } from './components/PacketInspector';
import { EventLog } from './components/EventLog';
import { NonSmartphoneModal } from './components/NonSmartphoneModal';
import { ScenarioModal } from './components/ScenarioModal';
import { 
  Sliders, 
  Server, 
  Package, 
  AlertOctagon,
  ArrowRight,
  X
} from 'lucide-react';

export function App() {
  useSimulationClock();

  const init = useMeshStore(state => state.init);
  const activeRole = useMeshStore(state => state.activeRole);
  const authAuthority = useMeshStore(state => state.authAuthority);
  const setActiveRole = useMeshStore(state => state.setActiveRole);
  const citizenTickets = useMeshStore(state => state.citizenTickets);
  const selectPacket = useMeshStore(state => state.selectPacket);
  const selectNode = useMeshStore(state => state.selectNode);
  const packets = useMeshStore(state => state.packets);
  const activeScenarioId = useMeshStore(state => state.activeScenarioId);
  const scenarioDescription = useMeshStore(state => state.scenarioDescription);

  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isAuthLoginOpen, setIsAuthLoginOpen] = useState<boolean>(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'CITIZEN_SOS' | 'COMMAND' | 'NODE' | 'PACKET'>('CITIZEN_SOS');

  useEffect(() => {
    init();
  }, [init]);

  const handleOpenTriageFeed = () => {
    selectPacket(null);
    setSidebarTab('CITIZEN_SOS');
    setIsTriageModalOpen(true);

    if (citizenTickets.length > 0) {
      const latest = citizenTickets[0];
      const pkt = packets.find(p => p.messageId === latest.packetId);
      if (pkt) {
        selectNode(pkt.sourceNodeId);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <Header
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
        onOpenScenarios={() => setIsScenarioModalOpen(true)}
        onSwitchToCitizen={() => {
          setIsAuthLoginOpen(false);
          setActiveRole('CITIZEN');
        }}
        onOpenAuthorityLogin={() => {
          setIsAuthLoginOpen(true);
        }}
      />

      {/* Scenario Active Banner */}
      {activeScenarioId && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/40 px-4 py-1.5 flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-bold text-indigo-300 uppercase tracking-wide">
              Active Scenario: {activeScenarioId.toUpperCase()}
            </span>
            <span className="text-slate-400 font-medium">| {scenarioDescription}</span>
          </div>
          <button
            onClick={() => useMeshStore.setState({ activeScenarioId: null, scenarioDescription: '' })}
            className="text-slate-400 hover:text-slate-200 text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Authority Active Citizen SOS Alert Banner */}
      {activeRole === 'AUTHORITY' && citizenTickets.length > 0 && (
        <div className="bg-red-950/95 border-b border-red-500/60 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            <span className="font-bold text-red-300 uppercase tracking-wide flex items-center gap-1.5 text-xs">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              Incoming Emergency Alert: {citizenTickets.length} Citizen SOS Ticket(s) in Mesh Queue
            </span>
            <span className="text-slate-300 hidden sm:inline">
              | Latest: <strong className="text-cyan-300 font-mono">{citizenTickets[0].ticketId}</strong> ({citizenTickets[0].incidentType} - {citizenTickets[0].victimCount} people)
            </span>
          </div>
          <button
            onClick={handleOpenTriageFeed}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <span>View Triage Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN VIEW SWITCHER */}
      {isAuthLoginOpen && !authAuthority ? (
        <AuthorityLogin onBackToCitizen={() => setIsAuthLoginOpen(false)} />
      ) : activeRole === 'CITIZEN' ? (
        <CitizenPortal
          onOpenAuthorityLogin={() => setIsAuthLoginOpen(true)}
          onOpenSmsModal={() => setIsSmsModalOpen(true)}
        />
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
          {/* Left / Center: Interactive Map & Live Event Terminal */}
          <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
            <div className="flex-1 min-h-[380px] h-[62%] relative">
              <NetworkMap />
            </div>

            <div className="h-[38%] min-h-[190px]">
              <EventLog />
            </div>
          </div>

          {/* Right: Command & Telemetry Panels */}
          <div className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-[#0b1120] border border-slate-800 rounded-xl shadow-xl">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-900/80 p-1 gap-1 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => {
                  selectPacket(null);
                  setSidebarTab('CITIZEN_SOS');
                }}
                className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                  sidebarTab === 'CITIZEN_SOS'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Citizen SOS</span>
                {citizenTickets.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold">
                    {citizenTickets.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('COMMAND')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'COMMAND'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Commands & Chaos</span>
              </button>

              <button
                onClick={() => setSidebarTab('NODE')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'NODE'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Node Telemetry</span>
              </button>

              <button
                onClick={() => setSidebarTab('PACKET')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'PACKET'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Packet Trail</span>
              </button>
            </div>

            {/* Tab Viewport */}
            <div className="flex-1 overflow-hidden p-2">
              {sidebarTab === 'CITIZEN_SOS' && <CitizenRequestsPanel />}
              {sidebarTab === 'COMMAND' && <CommandDashboard />}
              {sidebarTab === 'NODE' && <NodeInspector />}
              {sidebarTab === 'PACKET' && <PacketInspector />}
            </div>
          </div>
        </div>
      )}

      {/* Citizen SOS Triage Modal / Modal Popup */}
      {isTriageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-red-500/50 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-white text-base">Incoming Citizen Emergency Feed</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {citizenTickets.length} active emergency ticket(s) registered
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTriageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <CitizenRequestsPanel onTrackRoute={() => setIsTriageModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Non-Smartphone Feature Phone SMS Gateway Modal */}
      <NonSmartphoneModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />

      {/* Guided Test Scenarios Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />
    </div>
  );
}

export default App;
