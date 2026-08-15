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
  UserCheck,
  Shield,
  LifeBuoy
} from 'lucide-react';

interface HeaderProps {
  onOpenSmsModal: () => void;
  onOpenScenarios: () => void;
  onSwitchToCitizen: () => void;
  onOpenAuthorityLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
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

  const healthyNodesCount = nodes.filter(n => n.status === 'HEALTHY' || n.status === 'LOW_BATTERY').length;

  return (
    <header className="w-full bg-[#0b1120] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none z-30 shadow-md">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
          <Radio className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b1120] animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              RESQ-MESH
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeRole === 'AUTHORITY' ? 'AUTHORITY OPS' : 'PUBLIC SOS'}
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {activeRole === 'AUTHORITY' 
              ? 'Authorized Tactical Mesh Routing & Chaos Command' 
              : 'Decentralized Self-Healing Disaster Mesh Network'}
          </p>
        </div>
      </div>

      {/* Role Navigation Toggle (Citizen vs Authority) */}
      <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={onSwitchToCitizen}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeRole === 'CITIZEN'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Citizen SOS Portal</span>
        </button>

        <button
          onClick={() => {
            if (authAuthority) {
              useMeshStore.setState({ activeRole: 'AUTHORITY' });
            } else {
              onOpenAuthorityLogin();
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeRole === 'AUTHORITY'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Command Center {authAuthority ? '✓' : '(Login)'}</span>
        </button>
      </div>

      {/* Primary Hardware Constraints & Range Controller */}
      <div className="hidden md:flex items-center gap-4 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Simulated communication range:</span>
              <span className="font-mono text-cyan-300 font-bold ml-1.5">{simulatedRangeKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="9.0"
              step="0.5"
              value={simulatedRangeKm}
              onChange={(e) => setRangeKm(parseFloat(e.target.value))}
              className="w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col text-[11px]">
            <span className="text-slate-400 font-medium">Simulated Battery</span>
            <span className="font-mono text-emerald-300 font-bold">
              {healthyNodesCount}/{nodes.length} Nodes Active
            </span>
          </div>
        </div>
      </div>

      {/* Authority Operator Profile / Simulation Clock Actions */}
      <div className="flex items-center gap-2">
        {activeRole === 'AUTHORITY' && authAuthority && (
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200">{authAuthority.name}</span>
            <span className="text-[10px] font-mono text-cyan-400">({authAuthority.badgeId})</span>
          </div>
        )}

        {/* Demo Scenarios Button */}
        <button
          onClick={onOpenScenarios}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Demo Scenarios</span>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleSimulation}
          className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isRunning 
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40' 
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
          }`}
          title={isRunning ? 'Pause Clock' : 'Resume Clock'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Speed Selector */}
        <select
          value={tickSpeed}
          onChange={(e) => setTickSpeed(parseInt(e.target.value, 10))}
          className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="600">0.5x</option>
          <option value="300">1.0x</option>
          <option value="150">2.0x</option>
          <option value="80">4.0x</option>
        </select>

        {/* Reset Button */}
        <button
          onClick={resetSimulation}
          className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/30 text-xs transition-all"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
