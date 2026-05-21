import { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StaffHeader from '../../components/StaffHeader';
import { useAuth } from '../../context/AuthContext';

interface Complaint {
  id: string; complaint_type: string; description: string; status: string;
  coach_number: string | null; seat_number: string | null; created_at: string;
  users: { name: string } | null;
}

export default function StaffPoliceDashboard() {
  const { staffProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*, users(name)')
      .eq('routed_to', 'POLICE')
      .order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('complaints').update({ status, resolved_by: status === 'resolved' ? staffProfile?.id : null }).eq('id', id);
    fetchData();
  };

  const STATUS_STYLE: Record<string, string> = {
    open: 'text-red-400 bg-red-500/20',
    assigned: 'text-orange-400 bg-orange-500/20',
    in_progress: 'text-yellow-400 bg-yellow-500/20',
    resolved: 'text-green-400 bg-green-500/20',
    closed: 'text-white/30 bg-white/10',
  };

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role="Railway Police Force (RPF)" color="red" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Alert banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">Emergency: Call 182 or use the Emergency chain immediately for critical incidents.</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Open Cases', count: complaints.filter(c => c.status === 'open').length, color: 'text-red-400' },
            { label: 'Active', count: complaints.filter(c => c.status === 'in_progress').length, color: 'text-yellow-400' },
            { label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={fetchData} className="flex items-center gap-1 text-white/40 text-xs border border-white/10 rounded-lg px-3 py-1.5">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading ? <p className="text-white/40 text-center py-8">Loading...</p> : (
          <div className="space-y-3">
            {complaints.length === 0 && <div className="text-center py-12"><Shield className="w-10 h-10 text-white/20 mx-auto mb-3" /><p className="text-white/40">No cases assigned</p></div>}
            {complaints.map(c => (
              <div key={c.id} className={`bg-white/5 border rounded-2xl p-4 ${c.status === 'open' ? 'border-red-500/30' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium capitalize">{c.complaint_type.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status] || STATUS_STYLE.open}`}>{c.status.replace('_', ' ')}</span>
                      </div>
                      {c.coach_number && <p className="text-white/50 text-xs mt-0.5">Coach <span className="font-mono text-white/70">{c.coach_number}</span>{c.seat_number ? ` / Seat ${c.seat_number}` : ''}</p>}
                      <p className="text-white/50 text-xs mt-1.5 leading-relaxed">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-white/30 text-xs">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.users?.name || 'Passenger'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                  {c.status === 'open' && (
                    <button onClick={() => updateStatus(c.id, 'in_progress')} className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-lg hover:bg-yellow-500/30">
                      Investigate
                    </button>
                  )}
                  {(c.status === 'open' || c.status === 'in_progress') && (
                    <button onClick={() => updateStatus(c.id, 'resolved')} className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Close Case
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
