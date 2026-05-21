import { useState } from 'react';
import { Trash2, Check, Camera } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ISSUE_TYPES = [
  { value: 'dirty_toilet', label: 'Dirty Toilet', icon: '🚽' },
  { value: 'dirty_basin', label: 'Dirty Wash Basin', icon: '🪥' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'missing_soap', label: 'Missing Soap/Mug', icon: '🧼' },
  { value: 'water_shortage', label: 'Water Shortage', icon: '🚰' },
  { value: 'general_cleanliness', label: 'General Cleanliness', icon: '🧹' },
  { value: 'other', label: 'Other Issue', icon: '⚠️' },
];

export default function CleaningRequest() {
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
    await supabase.from('cleaning_requests').insert({
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
        <Header title="Cleaning Request" showBack backTo="dashboard" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-teal-500/20 border-2 border-teal-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-white/50 mb-6">Cleaning staff has been notified and will attend to your request shortly.</p>
          <button onClick={() => { setSubmitted(false); setCoach(''); setIssueType(''); setDescription(''); }}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3 rounded-xl">
            Submit Another
          </button>
          <button onClick={() => {}} className="w-full mt-3 border border-white/20 text-white py-3 rounded-xl hover:bg-white/5">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Cleaning Request" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2"><Trash2 className="w-5 h-5 text-teal-400" /> Report Cleanliness Issue</h2>
          <p className="text-white/40 text-sm mb-5">Your request will be assigned to the on-train cleaning staff immediately.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2">Coach Number *</label>
              <input value={coach} onChange={e => setCoach(e.target.value.toUpperCase())} placeholder="e.g. S3, B1, A2"
                required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Issue Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map(issue => (
                  <button type="button" key={issue.value} onClick={() => setIssueType(issue.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      issueType === issue.value ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}>
                    <span className="text-lg">{issue.icon}</span>
                    <span className={`text-xs font-medium ${issueType === issue.value ? 'text-teal-300' : 'text-white/60'}`}>{issue.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Additional Details</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Describe the issue in detail..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none" />
            </div>

            <div className="border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-white/30 transition-colors">
              <Camera className="w-6 h-6 text-white/30" />
              <span className="text-white/40 text-sm">Attach Photo (optional)</span>
              <span className="text-white/25 text-xs">Tap to upload from gallery</span>
            </div>

            <button type="submit" disabled={loading || !coach || !issueType}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Cleaning Request'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
