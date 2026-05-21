import { useState, useEffect } from 'react';
import { Ticket, CheckCircle, Clock, User, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StaffHeader from '../../components/StaffHeader';
import { useAuth } from '../../context/AuthContext';

interface Complaint {
  id: string; complaint_type: string; description: string; status: string;
  coach_number: string | null; seat_number: string | null; created_at: string;
  users: { name: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  seat_occupied: 'Seat Occupied', harassment: 'Harassment', theft: 'Theft', other: 'Other',
};

const STATUS_STYLE: Record<string, string> = {
  open: 'text-yellow-400 bg-yellow-500/20',
  assigned: 'text-blue-400 bg-blue-500/20',
  in_progress: 'text-orange-400 bg-orange-500/20',
  resolved: 'text-green-400 bg-green-500/20',
  closed: 'text-white/30 bg-white/10',
};

export default function StaffTCDashboard() {
  const { staffProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  const fetchData = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*, users(name)')
      .eq('routed_to', 'TC')
      .order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resolve = async (id: string) => {
    await supabase.from('complaints').update({ status: 'resolved', resolved_by: staffProfile?.id }).eq('id', id);
    fetchData();
  };

  const accept = async (id: string) => {
    await supabase.from('complaints').update({ status: 'in_progress' }).eq('id', id);
    fetchData();
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role="Ticket Checker (TC)" color="blue" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Open', count: complaints.filter(c => c.status === 'open').length, color: 'text-yellow-400' },
            { label: 'In Progress', count: complaints.filter(c => c.status === 'in_progress').length, color: 'text-orange-400' },
            { label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {['open', 'in_progress', 'resolved', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-white/50'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
          <button onClick={fetchData} className="ml-auto flex items-center gap-1 text-white/40 text-xs border border-white/10 rounded-lg px-3 py-1.5">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {loading ? <p className="text-white/40 text-center py-8">Loading...</p> : (
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-white/40 text-center py-8">No complaints</p>}
            {filtered.map(c => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{TYPE_LABELS[c.complaint_type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>{c.status.replace('_', ' ')}</span>
                    </div>
                    {(c.coach_number || c.seat_number) && (
                      <p className="text-white/50 text-xs mt-0.5">
                        {c.coach_number && <>Coach: <span className="font-mono text-white/70">{c.coach_number}</span></>}
                        {c.seat_number && <> • Seat: <span className="font-mono text-white/70">{c.seat_number}</span></>}
                      </p>
                    )}
                    <p className="text-white/40 text-xs mt-1 italic">"{c.description.slice(0, 100)}{c.description.length > 100 ? '...' : ''}"</p>
                    <div className="flex items-center gap-3 mt-1.5 text-white/30 text-xs">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.users?.name || 'Passenger'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                  {c.status === 'open' && (
                    <button onClick={() => accept(c.id)} className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-500/30">
                      Accept
                    </button>
                  )}
                  {(c.status === 'open' || c.status === 'in_progress') && (
                    <button onClick={() => resolve(c.id)} className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg hover:bg-green-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resolve
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
