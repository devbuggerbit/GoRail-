import { useState } from 'react';
import { AlertTriangle, Check, Shield, Ticket } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const COMPLAINT_TYPES = [
  { value: 'seat_occupied', label: 'Seat Occupied by Someone Else', icon: Ticket, routed: 'TC', color: 'border-blue-500 bg-blue-500/10', textColor: 'text-blue-300' },
  { value: 'harassment', label: 'Harassment / Misbehavior', icon: AlertTriangle, routed: 'POLICE', color: 'border-red-500 bg-red-500/10', textColor: 'text-red-300' },
  { value: 'theft', label: 'Theft / Robbery', icon: Shield, routed: 'POLICE', color: 'border-red-500 bg-red-500/10', textColor: 'text-red-300' },
  { value: 'other', label: 'Other Security Issue', icon: Shield, routed: 'TC', color: 'border-yellow-500 bg-yellow-500/10', textColor: 'text-yellow-300' },
];

export default function FileComplaint() {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [coach, setCoach] = useState('');
  const [seat, setSeat] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selected = COMPLAINT_TYPES.find(c => c.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await supabase.from('complaints').insert({
      user_id: user.id,
      complaint_type: type,
      coach_number: coach,
      seat_number: seat,
      description,
      routed_to: selected?.routed || 'TC',
      status: 'open',
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060e1e]">
        <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
        <Header title="File Complaint" showBack backTo="dashboard" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complaint Filed!</h2>
          <p className="text-white/50 mb-2">Your complaint has been forwarded to</p>
          <p className="text-[#FF9933] font-bold text-lg">{selected?.routed === 'POLICE' ? 'Railway Police (RPF)' : 'Ticket Checker (TC)'}</p>
          <p className="text-white/40 text-sm mt-4">You will be notified when the complaint is resolved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="File Complaint" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" /> File a Complaint</h2>
          <p className="text-white/40 text-sm mb-5">Complaints are routed to the relevant department automatically.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2">Complaint Type *</label>
              <div className="space-y-2">
                {COMPLAINT_TYPES.map(ct => {
                  const Icon = ct.icon;
                  return (
                    <button type="button" key={ct.value} onClick={() => setType(ct.value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${type === ct.value ? ct.color : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <Icon className={`w-5 h-5 ${type === ct.value ? ct.textColor : 'text-white/40'}`} />
                      <div className="flex-1">
                        <span className={`font-medium text-sm ${type === ct.value ? ct.textColor : 'text-white/60'}`}>{ct.label}</span>
                        <p className="text-white/30 text-xs mt-0.5">Routes to: {ct.routed === 'POLICE' ? 'Railway Police (RPF)' : 'Ticket Checker (TC)'}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === ct.value ? 'border-current' : 'border-white/20'}`}>
                        {type === ct.value && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Coach Number</label>
                <input value={coach} onChange={e => setCoach(e.target.value.toUpperCase())} placeholder="e.g. S3"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Seat Number</label>
                <input value={seat} onChange={e => setSeat(e.target.value)} placeholder="e.g. 42"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500" />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">Describe the Incident *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                placeholder="Please provide details of what happened..."
                required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 resize-none" />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300/80 text-xs">
              For emergency situations, please also contact RPF at <strong>182</strong> or use the emergency chain.
            </div>

            <button type="submit" disabled={loading || !type || !description}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'File Complaint'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
