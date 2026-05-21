import { useState, useEffect } from 'react';
import { Trash2, Clock, CheckCircle, AlertCircle, User, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import StaffHeader from '../../components/StaffHeader';

interface CleaningRequest {
  id: string; coach_number: string; issue_type: string; description: string;
  status: string; created_at: string; photo_url: string | null;
  users: { name: string } | null;
  assigned_staff: { name: string } | null;
}

interface CleaningWorker {
  id: string; name: string; is_available: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  assigned: { label: 'Assigned', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' },
};

const ISSUE_LABELS: Record<string, string> = {
  dirty_toilet: 'Dirty Toilet', dirty_basin: 'Dirty Basin', water_leakage: 'Water Leakage',
  missing_soap: 'Missing Soap/Mug', water_shortage: 'Water Shortage',
  general_cleanliness: 'General Cleanliness', other: 'Other',
};

export default function StaffCleaningDashboard() {
  const { staffProfile } = useAuth();
  const isManager = staffProfile?.role === 'CLEANER_MANAGER';
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [workers, setWorkers] = useState<CleaningWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: reqs }, { data: wkrs }] = await Promise.all([
      supabase.from('cleaning_requests')
        .select('*, users(name), assigned_staff:staff!cleaning_requests_assigned_to_fkey(name)')
        .order('created_at', { ascending: false }),
      isManager ? supabase.from('staff').select('id,name,is_available').eq('role', 'CLEANER_WORKER') : { data: [] },
    ]);
    setRequests(reqs || []);
    setWorkers(wkrs || []);
    setLoading(false);
  };

  const assignWorker = async (reqId: string, workerId: string) => {
    await supabase.from('cleaning_requests').update({ assigned_to: workerId, status: 'assigned' }).eq('id', reqId);
    fetchData();
  };

  const updateStatus = async (reqId: string, status: string) => {
    const update: Record<string, string | Date> = { status };
    if (status === 'completed') update.completed_at = new Date().toISOString();
    await supabase.from('cleaning_requests').update(update).eq('id', reqId);
    fetchData();
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = { pending: 0, assigned: 0, in_progress: 0, completed: 0 };
  requests.forEach(r => { if (r.status in counts) counts[r.status as keyof typeof counts]++; });

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role={isManager ? 'Cleaning Manager' : 'Cleaning Worker'} color="teal" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => {
            const style = STATUS_LABELS[key];
            return (
              <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${style.color}`}>{count}</p>
                <p className="text-white/40 text-xs capitalize">{style.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {['all', 'pending', 'assigned', 'in_progress', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-white/5 border border-white/10 text-white/50'
              }`}>
              {f.replace('_', ' ')}
            </button>
          ))}
          <button onClick={fetchData} className="ml-auto flex items-center gap-1 text-white/40 text-xs border border-white/10 rounded-lg px-3 py-1.5 hover:text-white/60">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading ? <p className="text-white/40 text-center py-8">Loading...</p> : (
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-white/40 text-center py-8">No requests</p>}
            {filtered.map(req => {
              const style = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
              return (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{ISSUE_LABELS[req.issue_type] || req.issue_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>{style.label}</span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5">Coach: <span className="text-white/70 font-mono">{req.coach_number}</span></p>
                      {req.description && <p className="text-white/40 text-xs mt-1 italic">"{req.description}"</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-white/30 text-xs">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.users?.name || 'Passenger'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/30">
                      {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                    {isManager && req.status === 'pending' && workers.length > 0 && (
                      <select onChange={e => e.target.value && assignWorker(req.id, e.target.value)}
                        className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none">
                        <option value="">Assign worker...</option>
                        {workers.filter(w => w.is_available).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    )}
                    {req.assigned_staff && <span className="text-teal-400 text-xs">Assigned to: {req.assigned_staff.name}</span>}
                    {(req.status === 'assigned' || req.status === 'pending') && (
                      <button onClick={() => updateStatus(req.id, 'in_progress')}
                        className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-colors">
                        Start Work
                      </button>
                    )}
                    {req.status === 'in_progress' && (
                      <button onClick={() => updateStatus(req.id, 'completed')}
                        className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Mark Complete
                      </button>
                    )}
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
