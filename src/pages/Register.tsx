import { useState } from 'react';
import { Eye, EyeOff, Train, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigation } from '../context/NavigationContext';

export default function Register() {
  const { navigate, goBack } = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
    if (data.user) {
      const { error: profileErr } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        mobile: mobile || null,
        preferred_language: 'en',
      });
      if (profileErr) { setError(profileErr.message); setLoading(false); return; }
    }
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2347] to-[#1a3a6e] flex flex-col">
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>
      <div className="flex items-center gap-3 px-6 pt-6">
        <button onClick={goBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">RailSaathi</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-white/50 text-sm mb-6">Join millions of Indian Railway travelers</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Kumar" required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Mobile Number</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98765 43210"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-[#FF9933]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-white/50 text-sm">Already have an account? </span>
            <button onClick={() => navigate('passenger-login')} className="text-[#FF9933] text-sm font-medium hover:underline">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
