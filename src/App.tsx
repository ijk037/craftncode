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
  X,
  Map as MapIcon,
  Terminal
} from 'lucide-react';

export function App() {
  useSimulationClock();

  const init = useMeshStore(state => state.init);
  const activeRole = useMeshStore(state => state.activeRole);
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
  
  // Mobile Command Center View Toggle (Map vs Panels)
  const [mobileCommandView, setMobileCommandView] = useState<'MAP' | 'PANEL' | 'LOGS'>('MAP');

  useEffect(() => {
    init();
  }, [init]);

  const handleOpenTriageFeed = () => {
    selectPacket(null);
    setSidebarTab('CITIZEN_SOS');
    setMobileCommandView('PANEL');
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
    <div className={`flex flex-col h-[100dvh] w-screen overflow-hidden font-sans select-none ${
      activeRole === 'CITIZEN' ? 'bg-[#F5F3EE] text-[#252826]' : 'bg-[#171A19] text-[#E8E6DE]'
    }`}>
      {/* Top Header Bar (Single unified, non-distorting master bar) */}
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
        <div className="bg-[#242927] border-b border-[#879B54]/40 px-3 md:px-5 py-1.5 flex items-center justify-between text-xs backdrop-blur-md shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#879B54] animate-ping shrink-0" />
            <span className="font-bold text-[#879B54] uppercase tracking-wide font-mono text-[11px] shrink-0">
              Scenario: {activeScenarioId.toUpperCase()}
            </span>
            <span className="text-[#9CA6A0] font-medium truncate text-[11px]">| {scenarioDescription}</span>
          </div>
          <button
            onClick={() => useMeshStore.setState({ activeScenarioId: null, scenarioDescription: '' })}
            className="text-[#9CA6A0] hover:text-[#E8E6DE] text-[11px] underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Authority Active Citizen SOS Alert Banner */}
      {activeRole === 'AUTHORITY' && citizenTickets.length > 0 && (
        <div className="bg-[#B84A3A] border-b border-[#9c3d2f] px-3 md:px-5 py-2 flex items-center justify-between text-xs shadow-md text-[#E8E6DE] shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-xs text-white font-mono shrink-0">
              <AlertOctagon className="w-4 h-4 text-white" />
              Emergency SOS: {citizenTickets.length} Ticket(s) in Queue
            </span>
            <span className="text-[#E8E6DE]/90 hidden md:inline truncate">
              | Latest: <strong className="text-white font-mono">#{citizenTickets[0].ticketId}</strong> ({citizenTickets[0].incidentType} - {citizenTickets[0].victimCount} victims)
            </span>
          </div>
          <button
            onClick={handleOpenTriageFeed}
            className="px-2.5 py-1 rounded-lg bg-[#171A19] hover:bg-[#242927] text-[#E8E6DE] font-bold text-xs shadow-md border border-[#333b37] flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
          >
            <span>View Triage Feed</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#879B54]" />
          </button>
        </div>
      )}

      {/* MAIN VIEW SWITCHER */}
      {isAuthLoginOpen ? (
        <AuthorityLogin 
          onBackToCitizen={() => {
            setIsAuthLoginOpen(false);
            setActiveRole('CITIZEN');
          }}
          onLoginSuccess={() => {
            setIsAuthLoginOpen(false);
            setActiveRole('AUTHORITY');
          }}
        />
      ) : activeRole === 'CITIZEN' ? (
        <CitizenPortal
          onOpenAuthorityLogin={() => setIsAuthLoginOpen(true)}
          onOpenSmsModal={() => setIsSmsModalOpen(true)}
        />
      ) : (
        /* COMMAND CENTER INTERFACE */
        <div className="flex-1 flex flex-col overflow-hidden bg-[#171A19]">
          
          {/* Mobile View Switcher Tabs (Only visible on screens < lg) */}
          <div className="flex lg:hidden bg-[#242927] border-b border-[#333b37] p-1 gap-1 text-xs font-semibold shrink-0">
            <button
              onClick={() => setMobileCommandView('MAP')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileCommandView === 'MAP'
                  ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 font-bold'
                  : 'text-[#9CA6A0]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Mesh Map</span>
            </button>
            <button
              onClick={() => setMobileCommandView('PANEL')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                mobileCommandView === 'PANEL'
                  ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 font-bold'
                  : 'text-[#9CA6A0]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Command Panels</span>
              {citizenTickets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#B84A3A] text-white font-mono text-[9px] font-bold">
                  {citizenTickets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileCommandView('LOGS')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileCommandView === 'LOGS'
                  ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 font-bold'
                  : 'text-[#9CA6A0]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Event Logs</span>
            </button>
          </div>

          {/* Desktop & Mobile Responsive Viewports */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-2 md:p-3 overflow-hidden bg-[#171A19]">
            
            {/* Left / Center: Interactive Map & Live Event Terminal */}
            <div className={`lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden ${
              mobileCommandView === 'MAP' ? 'flex' : mobileCommandView === 'LOGS' ? 'flex' : 'hidden lg:flex'
            }`}>
              {/* Map View */}
              <div className={`flex-1 relative min-h-[300px] ${
                mobileCommandView === 'LOGS' ? 'hidden lg:block lg:h-[60%]' : 'h-full lg:h-[62%]'
              }`}>
                <NetworkMap />
              </div>

              {/* Event Log Terminal */}
              <div className={`min-h-[180px] ${
                mobileCommandView === 'MAP' ? 'hidden lg:block lg:h-[38%]' : 'h-full lg:h-[38%]'
              }`}>
                <EventLog />
              </div>
            </div>

            {/* Right: Command & Telemetry Panels */}
            <div className={`lg:col-span-4 flex flex-col h-full overflow-hidden bg-[#242927] border border-[#333b37] rounded-xl shadow-xl ${
              mobileCommandView === 'PANEL' ? 'flex' : 'hidden lg:flex'
            }`}>
              {/* Tab Navigation */}
              <div className="flex border-b border-[#333b37] bg-[#1d2220] p-1 gap-1 text-xs font-semibold overflow-x-auto shrink-0">
                <button
                  onClick={() => {
                    selectPacket(null);
                    setSidebarTab('CITIZEN_SOS');
                  }}
                  className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all relative shrink-0 ${
                    sidebarTab === 'CITIZEN_SOS'
                      ? 'bg-[#B84A3A]/20 text-[#B84A3A] border border-[#B84A3A]/40 shadow-sm font-bold'
                      : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-[#B84A3A]" />
                  <span>Citizen SOS</span>
                  {citizenTickets.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#B84A3A] text-white font-mono text-[9px] font-bold">
                      {citizenTickets.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSidebarTab('COMMAND')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    sidebarTab === 'COMMAND'
                      ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 shadow-sm font-bold'
                      : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Commands & Chaos</span>
                </button>

                <button
                  onClick={() => setSidebarTab('NODE')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    sidebarTab === 'NODE'
                      ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40 shadow-sm font-bold'
                      : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Node</span>
                </button>

                <button
                  onClick={() => setSidebarTab('PACKET')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    sidebarTab === 'PACKET'
                      ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40 shadow-sm font-bold'
                      : 'text-[#9CA6A0] hover:text-[#E8E6DE]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Packet</span>
                </button>
              </div>

              {/* Tab Viewport */}
              <div className="flex-1 overflow-hidden p-2 bg-[#242927]">
                {sidebarTab === 'CITIZEN_SOS' && <CitizenRequestsPanel />}
                {sidebarTab === 'COMMAND' && <CommandDashboard />}
                {sidebarTab === 'NODE' && <NodeInspector />}
                {sidebarTab === 'PACKET' && <PacketInspector />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen SOS Triage Modal / Modal Popup */}
      {isTriageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#171A19] border border-[#B84A3A]/60 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
            <div className="p-3.5 md:p-4 bg-[#242927] border-b border-[#333b37] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-[#B84A3A] animate-pulse" />
                <div>
                  <h3 className="font-bold text-[#E8E6DE] text-sm md:text-base font-mono">Incoming Citizen Emergency Feed</h3>
                  <span className="text-xs text-[#9CA6A0] font-mono">
                    {citizenTickets.length} active emergency ticket(s) registered
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTriageModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9CA6A0] hover:text-[#E8E6DE] hover:bg-[#171A19] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 md:p-4 flex-1 overflow-hidden bg-[#171A19]">
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
