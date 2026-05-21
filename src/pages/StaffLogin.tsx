import { useState } from 'react';
import { Eye, EyeOff, Train, ArrowLeft, Shield, Ticket, Sparkles, Zap, Navigation, Building2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigation } from '../context/NavigationContext';

const STAFF_ROLES = [
  { role: 'TC', label: 'Ticket Checker', icon: Ticket, color: 'from-blue-600 to-blue-800' },
  { role: 'CLEANER_MANAGER', label: 'Cleaning Manager', icon: Trash2, color: 'from-teal-600 to-teal-800' },
  { role: 'POLICE', label: 'Railway Police (RPF)', icon: Shield, color: 'from-red-600 to-red-800' },
  { role: 'ELECTRICAL', label: 'Electrical Dept.', icon: Zap, color: 'from-yellow-600 to-yellow-800' },
  { role: 'PILOT', label: 'Loco Pilot', icon: Navigation, color: 'from-green-600 to-green-800' },
  { role: 'STATION_MASTER', label: 'Station Master', icon: Building2, color: 'from-orange-600 to-orange-800' },
];

const ROLE_PAGES: Record<string, string> = {
  TC: 'staff-tc',
  CLEANER_MANAGER: 'staff-cleaning',
  CLEANER_WORKER: 'staff-cleaning',
  POLICE: 'staff-police',
  ELECTRICAL: 'staff-electrical',
  PILOT: 'staff-pilot',
  STATION_MASTER: 'staff-station-master',
};

export default function StaffLogin() {
  const { navigate, goBack } = useNavigation();
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError(authErr.message); setLoading(false); return; }
    if (data.user) {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff').select('role').eq('id', data.user.id).maybeSingle();
      if (staffErr || !staffData) {
        // Create staff profile for demo
        await supabase.from('staff').insert({
          id: data.user.id,
          name: email.split('@')[0],
          employee_id: employeeId || `EMP${Date.now()}`,
          role: selectedRole,
        });
        const page = ROLE_PAGES[selectedRole] || 'staff-cleaning';
        navigate(page as Parameters<typeof navigate>[0]);
      } else {
        const page = ROLE_PAGES[staffData.role] || 'staff-cleaning';
        navigate(page as Parameters<typeof navigate>[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2347] to-[#1a3a6e] flex flex-col">
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>
      <div className="flex items-center gap-3 px-6 pt-6">
        <button onClick={goBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold">RailSaathi</span>
            <span className="text-white/50 text-xs ml-2">Staff Portal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          {step === 1 ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 text-center">Staff Login</h2>
              <p className="text-white/50 text-sm mb-6 text-center">Select your department to continue</p>
              <div className="grid grid-cols-2 gap-3">
                {STAFF_ROLES.map(({ role, label, icon: Icon, color }) => (
                  <button
                    key={role}
                    onClick={() => { setSelectedRole(role); setStep(2); }}
                    className={`bg-gradient-to-br ${color} border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                    <span className="text-white text-sm font-medium text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to departments
              </button>
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const role = STAFF_ROLES.find(r => r.role === selectedRole);
                  if (!role) return null;
                  const Icon = role.icon;
                  return (
                    <>
                      <div className={`w-10 h-10 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{role.label}</h2>
                        <p className="text-white/50 text-xs">Staff Login Portal</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Employee ID</label>
                  <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                    placeholder="EMP12345" required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@indianrailways.gov.in" required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-white/40 hover:text-white/70">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-[#FF9933]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60">
                  {loading ? 'Logging in...' : 'Login to Staff Portal'}
                </button>
              </form>
              <p className="text-white/30 text-xs text-center mt-4">New staff? Contact your Railway Division IT helpdesk.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
