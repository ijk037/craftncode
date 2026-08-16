import React from 'react';
import { useMeshStore } from '../store/useMeshStore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Layers, 
  Wifi, 
  BatteryMedium, 
  BatteryCharging,
  UserCheck, 
  LifeBuoy,
  Smartphone,
  Lock,
  Signal
} from 'lucide-react';

interface HeaderProps {
  onOpenSmsModal: () => void;
  onOpenScenarios: () => void;
  onSwitchToCitizen: () => void;
  onOpenAuthorityLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSmsModal,
  onOpenScenarios, 
  onSwitchToCitizen, 
  onOpenAuthorityLogin 
}) => {
  const activeRole = useMeshStore(state => state.activeRole);
  const authAuthority = useMeshStore(state => state.authAuthority);
  const isRunning = useMeshStore(state => state.isRunning);
  const tickSpeed = useMeshStore(state => state.tickSpeed);
  const simulatedRangeKm = useMeshStore(state => state.simulatedRangeKm);
  const nodes = useMeshStore(state => state.nodes);

  const toggleSimulation = useMeshStore(state => state.toggleSimulation);
  const resetSimulation = useMeshStore(state => state.resetSimulation);
  const setRangeKm = useMeshStore(state => state.setRangeKm);
  const setTickSpeed = useMeshStore(state => state.setTickSpeed);
  const setActiveRole = useMeshStore(state => state.setActiveRole);

  const healthyNodesCount = nodes.filter(n => n.status === 'HEALTHY' || n.status === 'LOW_BATTERY').length;

  // ==========================================
  // 1. CITIZEN MODE HEADER (Calm + Trustworthy)
  // ==========================================
  if (activeRole === 'CITIZEN') {
    return (
      <header className="w-full h-14 md:h-16 bg-[#E9E5DC] border-b border-[#d8d1c3] px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 select-none z-40 shadow-sm shrink-0">
        {/* Brand & Offline Beacon Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shadow-sm shrink-0">
            <Radio className="w-5 h-5 text-[#F5F3EE]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-[#173F35] font-mono leading-none">
                RESQ-MESH
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20 uppercase">
                BLE & LoRa Mesh Radio
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6F8F7D] font-medium truncate mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#3F8F78] animate-pulse shrink-0" />
              <span className="truncate">Device-to-Device BLE & Wi-Fi Direct • Zero Internet Required</span>
            </div>
          </div>
        </div>

        {/* Center: Range Badge (Visible on Tablet & Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F5F3EE] px-3 py-1 rounded-xl border border-[#d8d1c3] text-xs text-[#252826]">
          <Signal className="w-3.5 h-3.5 text-[#173F35]" />
          <span className="font-mono text-[11px]">
            LoRa Range: <strong className="text-[#173F35]">{simulatedRangeKm.toFixed(1)} km</strong>
          </span>
        </div>

        {/* Right Actions: Battery, SMS Bridge, Authority Sign-In / Command Center */}
        <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
          {/* Simulated Phone Battery */}
          <div className="flex items-center gap-1 text-xs text-[#252826] font-mono bg-[#F5F3EE] px-2 md:px-2.5 py-1 rounded-lg border border-[#d8d1c3]">
            <BatteryCharging className="w-3.5 h-3.5 text-[#173F35]" />
            <span className="font-bold">94%</span>
          </div>

          {/* SMS Bridge Button */}
          <button
            onClick={onOpenSmsModal}
            className="px-2 md:px-2.5 py-1 rounded-lg bg-[#F5F3EE] hover:bg-[#ded8cd] text-[#252826] text-xs font-semibold border border-[#d8d1c3] flex items-center gap-1 transition-all"
            title="Non-Smartphone SMS Gateway"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#6F8F7D]" />
            <span className="hidden sm:inline">SMS Bridge</span>
          </button>

          {/* Authority Sign-In / Command Center Access Button */}
          <button
            onClick={() => {
              if (authAuthority) {
                setActiveRole('AUTHORITY');
              } else {
                onOpenAuthorityLogin();
              }
            }}
            className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-[#173F35] hover:bg-[#102d26] text-[#F5F3EE] border border-[#173F35] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-[#C65D32]" />
            {authAuthority ? (
              <>
                <span className="hidden xs:inline">Command</span>
                <span>Center</span>
              </>
            ) : (
              <>
                <span className="hidden xs:inline">Authority</span>
                <span>Sign-In</span>
              </>
            )}
          </button>
        </div>
      </header>
    );
  }

  // ===============================================
  // 2. COMMAND CENTER HEADER (Operational + High Contrast)
  // ===============================================
  return (
    <header className="w-full h-14 md:h-16 bg-[#171A19] border-b border-[#333b37] px-3 md:px-5 flex items-center justify-between gap-2 md:gap-4 select-none z-40 shadow-md shrink-0">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#879B54] to-[#3F8F78] text-[#171A19] flex items-center justify-center shadow-md shrink-0">
          <Radio className="w-5 h-5 text-[#171A19]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            <h1 className="text-sm md:text-base font-bold tracking-tight text-[#E8E6DE] font-mono leading-none">
              RESQ-MESH
            </h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40 font-bold">
              OPS
            </span>
          </div>
          <p className="text-[11px] text-[#9CA6A0] font-medium truncate hidden sm:block mt-0.5">
            Tactical Mesh Routing & Telemetry Command
          </p>
        </div>

        {/* Quick Switch to Public Portal */}
        <button
          onClick={onSwitchToCitizen}
          className="ml-1 md:ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#242927] hover:bg-[#2f3533] text-[#9CA6A0] hover:text-[#E8E6DE] border border-[#333b37] flex items-center gap-1.5 transition-all shrink-0"
          title="Switch to Citizen Public Portal"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-[#D49A3A]" />
          <span className="hidden md:inline">Citizen Portal</span>
        </button>
      </div>

      {/* Center: Range & Battery Hardware Constraints (Tablet & Desktop) */}
      <div className="hidden lg:flex items-center gap-3 bg-[#242927] px-3.5 py-1.5 rounded-xl border border-[#333b37] shrink-0">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-[#879B54]" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] leading-tight">
              <span className="text-[#9CA6A0]">Range:</span>
              <span className="font-mono text-[#E8E6DE] font-bold ml-1">{simulatedRangeKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="9.0"
              step="0.5"
              value={simulatedRangeKm}
              onChange={(e) => setRangeKm(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#171A19] rounded appearance-none cursor-pointer accent-[#879B54]"
            />
          </div>
        </div>

        <div className="h-5 w-px bg-[#333b37]" />

        <div className="flex items-center gap-1.5 text-[11px]">
          <BatteryMedium className="w-3.5 h-3.5 text-[#3F8F78]" />
          <span className="font-mono text-[#3F8F78] font-bold">
            {healthyNodesCount}/{nodes.length} Nodes
          </span>
        </div>
      </div>

      {/* Right: Clearance Profile, Demo Scenarios, Simulation Clock */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Authority Operator Badge / Switch Operator */}
        {authAuthority && (
          <button
            onClick={onOpenAuthorityLogin}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#242927] hover:bg-[#2f3533] border border-[#879B54]/40 text-xs transition-colors"
            title="Click to Switch Authority Operator"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#879B54]" />
            <span className="font-bold text-[#E8E6DE]">{authAuthority.name}</span>
            <span className="text-[10px] font-mono text-[#879B54]">({authAuthority.badgeId})</span>
          </button>
        )}

        {/* Demo Scenarios Button */}
        <button
          onClick={onOpenScenarios}
          className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-[#242927] hover:bg-[#2f3533] text-[#E8E6DE] border border-[#333b37] hover:border-[#879B54]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          title="Open Pre-Configured Test Scenarios"
        >
          <Layers className="w-3.5 h-3.5 text-[#879B54]" />
          <span className="hidden sm:inline">Scenarios</span>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleSimulation}
          className={`p-1.5 md:p-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-all shadow-sm ${
            isRunning 
              ? 'bg-[#D49A3A]/20 hover:bg-[#D49A3A]/30 text-[#D49A3A] border border-[#D49A3A]/40' 
              : 'bg-[#3F8F78]/20 hover:bg-[#3F8F78]/30 text-[#3F8F78] border border-[#3F8F78]/40'
          }`}
          title={isRunning ? 'Pause Clock' : 'Resume Clock'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </button>

        {/* Speed Selector */}
        <select
          value={tickSpeed}
          onChange={(e) => setTickSpeed(parseInt(e.target.value, 10))}
          className="bg-[#242927] hover:bg-[#2f3533] text-[#E8E6DE] border border-[#333b37] rounded-lg px-1.5 md:px-2 py-1 md:py-1.5 text-xs font-mono focus:outline-none focus:border-[#879B54] cursor-pointer"
        >
          <option value="600">0.5x</option>
          <option value="300">1.0x</option>
          <option value="150">2.0x</option>
          <option value="80">4.0x</option>
        </select>

        {/* Reset Button */}
        <button
          onClick={resetSimulation}
          className="p-1.5 md:p-2 rounded-lg bg-[#242927] hover:bg-[#B84A3A]/20 text-[#9CA6A0] hover:text-[#B84A3A] border border-[#333b37] hover:border-[#B84A3A]/40 text-xs transition-all"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </header>
  );
};
