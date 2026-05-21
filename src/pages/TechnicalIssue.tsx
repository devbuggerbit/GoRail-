import { useState } from 'react';
import { Zap, Check } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ISSUE_TYPES = [
  { value: 'ac_not_working', label: 'AC Not Working', icon: '❄️' },
  { value: 'fan_broken', label: 'Fan Broken/Noisy', icon: '🌀' },
  { value: 'light_issue', label: 'Light Issue', icon: '💡' },
  { value: 'charging_point_dead', label: 'Charging Point Dead', icon: '🔌' },
  { value: 'water_pump', label: 'Water Pump Issue', icon: '🚰' },
  { value: 'door_issue', label: 'Door Issue', icon: '🚪' },
  { value: 'window_issue', label: 'Window Issue', icon: '🪟' },
  { value: 'other', label: 'Other Electrical', icon: '⚡' },
];

export default function TechnicalIssue() {
  const { user } = useAuth();
  const [coach, setCoach] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await supabase.from('technical_issues').insert({
      user_id: user.id,
      coach_number: coach,
      issue_type: issueType,
      description,
      status: 'pending',
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060e1e]">
        <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
        <Header title="Technical Issue" showBack backTo="dashboard" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Issue Reported!</h2>
          <p className="text-white/50 mb-2">The Electrical Department has been notified.</p>
          <p className="text-white/40 text-sm mt-4">A technician will be assigned and you'll be updated on the status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Technical Issue" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Report Technical Issue</h2>
          <p className="text-white/40 text-sm mb-5">Issues are forwarded to the on-board Electrical Department immediately.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2">Coach Number *</label>
              <input value={coach} onChange={e => setCoach(e.target.value.toUpperCase())} placeholder="e.g. A1, B2, S5"
                required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-500" />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Issue Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map(issue => (
                  <button type="button" key={issue.value} onClick={() => setIssueType(issue.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      issueType === issue.value ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}>
                    <span className="text-lg">{issue.icon}</span>
                    <span className={`text-xs font-medium ${issueType === issue.value ? 'text-yellow-300' : 'text-white/60'}`}>{issue.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">Additional Details</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Describe the issue..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 resize-none" />
            </div>

            <button type="submit" disabled={loading || !coach || !issueType}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'Report Issue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
