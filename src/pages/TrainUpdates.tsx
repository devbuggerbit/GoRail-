import { useState, useEffect } from 'react';
import { Radio, Clock, AlertCircle, Info, Train, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface TrainUpdate {
  id: string;
  update_type: string;
  message: string;
  delay_minutes: number;
  created_at: string;
  trains: { number: string; name: string } | null;
  staff: { name: string; role: string } | null;
}

const UPDATE_ICONS: Record<string, { icon: typeof Info; color: string }> = {
  delay: { icon: AlertCircle, color: 'text-red-400' },
  platform_change: { icon: Info, color: 'text-blue-400' },
  speed_update: { icon: TrendingUp, color: 'text-green-400' },
  arrival: { icon: Clock, color: 'text-teal-400' },
  departure: { icon: Train, color: 'text-[#FF9933]' },
  info: { icon: Info, color: 'text-white/60' },
};

const UPDATE_BG: Record<string, string> = {
  delay: 'border-red-500/20 bg-red-500/5',
  platform_change: 'border-blue-500/20 bg-blue-500/5',
  speed_update: 'border-green-500/20 bg-green-500/5',
  arrival: 'border-teal-500/20 bg-teal-500/5',
  departure: 'border-orange-500/20 bg-orange-500/5',
  info: 'border-white/10 bg-white/5',
};

export default function TrainUpdates() {
  const [updates, setUpdates] = useState<TrainUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUpdates();
    const channel = supabase
      .channel('train_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'train_updates' }, payload => {
        setUpdates(prev => [payload.new as TrainUpdate, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchUpdates = async () => {
    const { data } = await supabase
      .from('train_updates')
      .select('*, trains(number,name), staff:posted_by(name,role)')
      .order('created_at', { ascending: false })
      .limit(50);
    setUpdates(data || []);
    setLoading(false);
  };

  const filtered = filter === 'all' ? updates : updates.filter(u => u.update_type === filter);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Train Updates" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Live indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Live Updates</span>
          </div>
          <button onClick={fetchUpdates} className="text-white/40 text-xs hover:text-white/60 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {[
            { val: 'all', label: 'All' },
            { val: 'delay', label: 'Delays' },
            { val: 'platform_change', label: 'Platform' },
            { val: 'arrival', label: 'Arrivals' },
            { val: 'departure', label: 'Departures' },
          ].map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
                filter === f.val ? 'bg-[#FF9933] text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Radio className="w-8 h-8 text-white/20 mx-auto mb-3 animate-pulse" />
            <p className="text-white/40">Loading updates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Radio className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No updates available</p>
            <p className="text-white/25 text-sm mt-1">Updates from Loco Pilots and Station Masters appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(update => {
              const { icon: Icon, color } = UPDATE_ICONS[update.update_type] || UPDATE_ICONS.info;
              const bg = UPDATE_BG[update.update_type] || UPDATE_BG.info;
              return (
                <div key={update.id} className={`border ${bg} rounded-2xl p-4`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          {update.trains && (
                            <p className="text-white/50 text-xs mb-0.5">
                              {update.trains.name} <span className="font-mono">(#{update.trains.number})</span>
                            </p>
                          )}
                          <p className="text-white text-sm leading-relaxed">{update.message}</p>
                          {update.delay_minutes > 0 && (
                            <span className="inline-block mt-1 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                              +{update.delay_minutes} min delay
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white/30 text-xs">{formatTime(update.created_at)}</p>
                          <p className="text-white/20 text-xs">{formatDate(update.created_at)}</p>
                        </div>
                      </div>
                      {update.staff && (
                        <p className="text-white/30 text-xs mt-1.5">
                          — {update.staff.name} ({update.staff.role.replace('_', ' ')})
                        </p>
                      )}
                    </div>
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
