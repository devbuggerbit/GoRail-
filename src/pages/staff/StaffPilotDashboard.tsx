import { useState, useEffect } from 'react';
import { Navigation, Send, Train, Clock, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StaffHeader from '../../components/StaffHeader';
import { useAuth } from '../../context/AuthContext';

interface TrainUpdate {
  id: string; update_type: string; message: string; delay_minutes: number; created_at: string;
}

interface TrainInfo {
  id: string; number: string; name: string; current_speed: number; delay_minutes: number; status: string;
}

const UPDATE_TYPES = [
  { value: 'delay', label: 'Delay Update' },
  { value: 'speed_update', label: 'Speed Update' },
  { value: 'arrival', label: 'Arrival Update' },
  { value: 'departure', label: 'Departure Update' },
  { value: 'info', label: 'General Info' },
];

export default function StaffPilotDashboard() {
  const { staffProfile } = useAuth();
  const [trains, setTrains] = useState<TrainInfo[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [updates, setUpdates] = useState<TrainUpdate[]>([]);
  const [message, setMessage] = useState('');
  const [updateType, setUpdateType] = useState('info');
  const [delay, setDelay] = useState(0);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.from('trains').select('id,number,name,current_speed,delay_minutes,status').then(({ data }) => {
      if (data) { setTrains(data); if (data.length) setSelectedTrain(data[0].id); }
    });
  }, []);

  useEffect(() => {
    if (!selectedTrain) return;
    supabase.from('train_updates').select('*').eq('train_id', selectedTrain).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setUpdates(data || []));
  }, [selectedTrain]);

  const postUpdate = async () => {
    if (!message.trim() || !selectedTrain) return;
    setPosting(true);
    await supabase.from('train_updates').insert({
      train_id: selectedTrain,
      posted_by: staffProfile?.id,
      update_type: updateType,
      message: message.trim(),
      delay_minutes: delay,
    });
    if (delay > 0) {
      await supabase.from('trains').update({ delay_minutes: delay, status: 'delayed' }).eq('id', selectedTrain);
    }
    setMessage('');
    setDelay(0);
    const { data } = await supabase.from('train_updates').select('*').eq('train_id', selectedTrain).order('created_at', { ascending: false }).limit(20);
    setUpdates(data || []);
    setPosting(false);
  };

  const train = trains.find(t => t.id === selectedTrain);

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <StaffHeader role="Loco Pilot" color="green" />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Train selector */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <label className="block text-white/60 text-xs mb-2">Select Your Train</label>
          <select value={selectedTrain} onChange={e => setSelectedTrain(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
            {trains.map(t => <option key={t.id} value={t.id} className="bg-[#0f2347]">{t.name} (#{t.number})</option>)}
          </select>
        </div>

        {/* Train status card */}
        {train && (
          <div className="bg-gradient-to-r from-green-600/20 to-green-800/10 border border-green-500/20 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center"><Train className="w-5 h-5 text-green-400" /></div>
              <div>
                <p className="text-white font-bold">{train.name}</p>
                <p className="text-white/50 text-xs">#{train.number}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${train.status === 'on_time' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {train.status === 'on_time' ? 'On Time' : `+${train.delay_minutes}m Delayed`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                <Zap className="w-4 h-4 text-[#FF9933]" />
                <div>
                  <p className="text-[#FF9933] font-bold">{train.current_speed} km/h</p>
                  <p className="text-white/40 text-xs">Current Speed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-bold">{train.delay_minutes} min</p>
                  <p className="text-white/40 text-xs">Delay</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Update */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Navigation className="w-4 h-4 text-green-400" /> Post Live Update</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Update Type</label>
                <select value={updateType} onChange={e => setUpdateType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
                  {UPDATE_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#0f2347]">{t.label}</option>)}
                </select>
              </div>
              {updateType === 'delay' && (
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">Delay (minutes)</label>
                  <input type="number" value={delay} onChange={e => setDelay(parseInt(e.target.value) || 0)} min="0"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Message *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="e.g. Signal block at Kanpur, expecting 15 min delay..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
            </div>
            <button onClick={postUpdate} disabled={posting || !message.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              <Send className="w-4 h-4" />{posting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </div>

        {/* Recent updates */}
        <div>
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wide mb-3">Recent Updates</h3>
          {updates.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No updates posted yet</p>
          ) : (
            <div className="space-y-2">
              {updates.map(u => (
                <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm">{u.message}</p>
                    <span className="text-white/30 text-xs flex-shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(u.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/30 text-xs capitalize">{u.update_type.replace('_', ' ')}</span>
                    {u.delay_minutes > 0 && <span className="text-red-400 text-xs">+{u.delay_minutes}m</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
