import { useState, useEffect } from 'react';
import { Building2, Train, Ticket, Trash2, Zap, Shield, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StaffHeader from '../../components/StaffHeader';

interface DashboardStats {
  cleaningPending: number;
  cleaningInProgress: number;
  complaintOpen: number;
  technicalPending: number;
  trainsToday: number;
}

interface RecentItem {
  id: string; type: 'cleaning' | 'complaint' | 'technical';
  label: string; coach: string; status: string; time: string;
}

export default function StaffStationMasterDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ cleaningPending: 0, cleaningInProgress: 0, complaintOpen: 0, technicalPending: 0, trainsToday: 0 });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [
      { count: cleaningPending },
      { count: cleaningInProgress },
      { count: complaintOpen },
      { count: technicalPending },
      { count: trainsToday },
      { data: cleaningRecent },
      { data: complaintRecent },
      { data: techRecent },
    ] = await Promise.all([
      supabase.from('cleaning_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('cleaning_requests').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('technical_issues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('trains').select('*', { count: 'exact', head: true }),
      supabase.from('cleaning_requests').select('id,issue_type,coach_number,status,created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('complaints').select('id,complaint_type,coach_number,status,created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('technical_issues').select('id,issue_type,coach_number,status,created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      cleaningPending: cleaningPending || 0,
      cleaningInProgress: cleaningInProgress || 0,
      complaintOpen: complaintOpen || 0,
      technicalPending: technicalPending || 0,
      trainsToday: trainsToday || 0,
    });

    const recentItems: RecentItem[] = [
      ...(cleaningRecent || []).map(r => ({ id: r.id, type: 'cleaning' as const, label: r.issue_type.replace('_', ' '), coach: r.coach_number, status: r.status, time: r.created_at })),
      ...(complaintRecent || []).map(r => ({ id: r.id, type: 'complaint' as const, label: r.complaint_type.replace('_', ' '), coach: r.coach_number || '-', status: r.status, time: r.created_at })),
      ...(techRecent || []).map(r => ({ id: r.id, type: 'technical' as const, label: r.issue_type.replace('_', ' '), coach: r.coach_number, status: r.status, time: r.created_at })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    setRecent(recentItems);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const TYPE_ICON: Record<string, { Icon: typeof Train; color: string }> = {
    cleaning: { Icon: Trash2, color: 'text-teal-400' },
    complaint: { Icon: Shield, color: 'text-red-400' },
    technical: { Icon: Zap, color: 'text-yellow-400' },
  };

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role="Station Master" color="orange" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Cleaning Pending', value: stats.cleaningPending, icon: Trash2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
            { label: 'Cleaning Active', value: stats.cleaningInProgress, icon: Trash2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Open Complaints', value: stats.complaintOpen, icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Tech Issues', value: stats.technicalPending, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Total Trains', value: stats.trainsToday, icon: Train, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} border border-white/10 rounded-xl p-3 text-center`}>
                <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Train status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TrainStatusCard />
        </div>

        {/* Recent activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#FF9933]" /> Recent Activity</h3>
            <button onClick={fetchData} className="flex items-center gap-1 text-white/40 text-xs hover:text-white/60 border border-white/10 rounded-lg px-2 py-1">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          {loading ? <p className="text-white/40 text-center py-6">Loading...</p> : recent.length === 0 ? (
            <p className="text-white/30 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recent.map(item => {
                const { Icon, color } = TYPE_ICON[item.type];
                return (
                  <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                    <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium capitalize">{item.label}</p>
                      <p className="text-white/40 text-xs">Coach {item.coach} • <span className="capitalize">{item.status.replace('_', ' ')}</span></p>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TrainStatusCard() {
  const [trains, setTrains] = useState<{ id: string; name: string; number: string; status: string; delay_minutes: number; current_speed: number }[]>([]);

  useEffect(() => {
    supabase.from('trains').select('id,name,number,status,delay_minutes,current_speed').then(({ data }) => setTrains(data || []));
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:col-span-2">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Train className="w-4 h-4 text-[#FF9933]" /> Train Status</h3>
      <div className="space-y-2">
        {trains.map(train => (
          <div key={train.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
            <div>
              <p className="text-white text-sm font-medium">{train.name}</p>
              <p className="text-white/40 text-xs">#{train.number} • {train.current_speed} km/h</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${train.status === 'on_time' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {train.status === 'on_time' ? 'On Time' : `+${train.delay_minutes}m`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
