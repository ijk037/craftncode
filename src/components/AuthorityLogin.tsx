import React, { useState } from 'react';
import { useMeshStore, type AuthorityUser } from '../store/useMeshStore';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';

interface AuthorityLoginProps {
  onBackToCitizen: () => void;
}

export const AuthorityLogin: React.FC<AuthorityLoginProps> = ({ onBackToCitizen }) => {
  const loginAuthority = useMeshStore(state => state.loginAuthority);

  const [badgeId, setBadgeId] = useState<string>('CMD-4091');
  const [operatorName, setOperatorName] = useState<string>('Capt. Elena Vance');
  const [role, setRole] = useState<AuthorityUser['role']>('INCIDENT_COMMANDER');
  const [sector, setSector] = useState<string>('Sector 4 - Urban Epicenter');
  const [accessPin, setAccessPin] = useState<string>('••••••••');

  const demoAccounts: AuthorityUser[] = [
    {
      name: 'Capt. Elena Vance',
      role: 'INCIDENT_COMMANDER',
      badgeId: 'CMD-4091',
      sector: 'Sector 4 - Urban Epicenter',
    },
    {
      name: 'Dr. Marcus Holloway',
      role: 'MESH_FIELD_ENGINEER',
      badgeId: 'ENG-8820',
      sector: 'Sector 6 - SatCom Backhaul',
    },
    {
      name: 'Officer Sarah Chen',
      role: 'DISPATCH_OPERATOR',
      badgeId: 'DSP-1104',
      sector: 'Disaster Relief Central Ops',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAuthority({
      name: operatorName,
      role,
      badgeId,
      sector,
    });
  };

  const handleSelectDemo = (acc: AuthorityUser) => {
    setBadgeId(acc.badgeId);
    setOperatorName(acc.name);
    setRole(acc.role);
    setSector(acc.sector);
    loginAuthority(acc);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070b14] flex items-center justify-center p-4 select-none font-sans">
      <div className="max-w-md w-full bg-[#0d1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-[#0d1322] border-b border-slate-800 text-center relative">
          <button
            onClick={onBackToCitizen}
            className="absolute left-4 top-4 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Portal</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">Authorized Authority Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access to physical mesh telemetry, routing engine, and chaos testbench.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* One-Click Demo Profiles */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wide">
              Quick One-Click Demo Profiles:
            </span>
            <div className="space-y-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-850 hover:border-cyan-500/40 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors font-bold font-mono text-xs">
                      {acc.badgeId.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{acc.name}</div>
                      <div className="text-[10px] text-slate-400">{acc.role} • {acc.badgeId}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] font-mono uppercase text-slate-500">Or Manual Credentials</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Operator Name</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Badge ID</label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Clearance Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
                >
                  <option value="INCIDENT_COMMANDER">Incident Commander</option>
                  <option value="MESH_FIELD_ENGINEER">Mesh Field Engineer</option>
                  <option value="DISPATCH_OPERATOR">Dispatch Operator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Security Access PIN</label>
              <input
                type="password"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Access Mesh Telemetry</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
