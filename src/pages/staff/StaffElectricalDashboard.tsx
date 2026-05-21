import { useState, useEffect } from 'react';
import { Zap, CheckCircle, Clock, User, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StaffHeader from '../../components/StaffHeader';
import { useAuth } from '../../context/AuthContext';

interface TechIssue {
  id: string; issue_type: string; description: string; status: string;
  coach_number: string; created_at: string;
  users: { name: string } | null;
  assigned_staff: { name: string } | null;
}

const ISSUE_LABELS: Record<string, string> = {
  ac_not_working: 'AC Not Working', fan_broken: 'Fan Broken', light_issue: 'Light Issue',
  charging_point_dead: 'Charging Point Dead', water_pump: 'Water Pump', door_issue: 'Door Issue',
  window_issue: 'Window Issue', other: 'Other',
};

export default function StaffElectricalDashboard() {
  const { staffProfile } = useAuth();
  const [issues, setIssues] = useState<TechIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchData = async () => {
    const { data } = await supabase
      .from('technical_issues')
      .select('*, users(name), assigned_staff:staff!technical_issues_assigned_to_fkey(name)')
      .order('created_at', { ascending: false });
    setIssues(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const update: Record<string, string | null> = { status };
    if (status === 'resolved') update.resolved_at = new Date().toISOString();
    if (status === 'in_progress') update.assigned_to = staffProfile?.id || null;
    await supabase.from('technical_issues').update(update).eq('id', id);
    fetchData();
  };

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    assigned: { label: 'Assigned', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    in_progress: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20' },
  };

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role="Electrical Department" color="yellow" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(STATUS_STYLE).map(([key, s]) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{issues.filter(i => i.status === key).length}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {['pending', 'in_progress', 'resolved', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize transition-all ${filter === f ? 'bg-yellow-600 text-white' : 'bg-white/5 border border-white/10 text-white/50'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
          <button onClick={fetchData} className="ml-auto flex items-center gap-1 text-white/40 text-xs border border-white/10 rounded-lg px-3 py-1.5">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {loading ? <p className="text-white/40 text-center py-8">Loading...</p> : (
          <div className="space-y-3">
            {filtered.length === 0 && <div className="text-center py-12"><Zap className="w-10 h-10 text-white/20 mx-auto mb-3" /><p className="text-white/40">No issues</p></div>}
            {filtered.map(issue => {
              const style = STATUS_STYLE[issue.status] || STATUS_STYLE.pending;
              return (
                <div key={issue.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{ISSUE_LABELS[issue.issue_type] || issue.issue_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>{style.label}</span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5">Coach: <span className="font-mono text-white/70">{issue.coach_number}</span></p>
                      {issue.description && <p className="text-white/40 text-xs mt-1 italic">"{issue.description}"</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-white/30 text-xs">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{issue.users?.name || 'Passenger'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(issue.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                    {issue.status === 'pending' && (
                      <button onClick={() => updateStatus(issue.id, 'in_progress')} className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg hover:bg-orange-500/30">
                        Start Repair
                      </button>
                    )}
                    {issue.status === 'in_progress' && (
                      <button onClick={() => updateStatus(issue.id, 'resolved')} className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Mark Resolved
                      </button>
                    )}
                    {issue.assigned_staff && <span className="text-yellow-400/60 text-xs ml-auto">Assigned: {issue.assigned_staff.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
