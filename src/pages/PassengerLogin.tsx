import { useState } from 'react';
import { Eye, EyeOff, ChevronDown, Train, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { languages, t } from '../lib/i18n';

export default function PassengerLogin() {
  const { navigate } = useNavigation();
  const { language, setLanguage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLang, setShowLang] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate('dashboard');
    }
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Vande Bharat Wallpaper Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/37414660/pexels-photo-37414660.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Vande Bharat Express"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 via-[#0a1628]/60 to-[#0a1628]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/70 via-transparent to-[#0a1628]/70" />
      </div>

      {/* Indian flag stripe */}
      <div className="relative z-10 h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setShowLang(!showLang)}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
        >
          <span>{currentLang.native}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showLang ? 'rotate-180' : ''}`} />
        </button>
        {showLang && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0f2347]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-30">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setShowLang(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${language === lang.code ? 'text-[#FF9933]' : 'text-white'}`}
              >
                <span className="block font-medium">{lang.native}</span>
                <span className="block text-xs text-white/50">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-xl flex items-center justify-center shadow-lg">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide">RailSaathi</h1>
            <p className="text-white/50 text-xs">Indian Railways Companion</p>
          </div>
        </div>
        <button
          onClick={() => navigate('staff-login')}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs border border-white/20 rounded-lg px-3 py-1.5 transition-all hover:border-white/40 backdrop-blur-sm"
        >
          <Shield className="w-3.5 h-3.5" />
          Staff Login
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">{t('passengerLogin', language)}</h2>
            <p className="text-white/50 text-sm mb-6">{t('welcome', language)}</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1.5">{t('username', language)}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-all"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1.5">{t('password', language)}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-white/40 hover:text-white/70">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button type="button" className="text-[#FF9933] text-sm hover:underline">{t('forgotPassword', language)}</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-[#FF9933]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Logging in...' : t('login', language)}
              </button>
            </form>

            <div className="mt-5 text-center">
              <span className="text-white/50 text-sm">{t('newUser', language)} </span>
              <button onClick={() => navigate('register')} className="text-[#FF9933] text-sm font-medium hover:underline">
                {t('register', language)}
              </button>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/40 text-xs text-center mb-1">Demo — use any valid email/password</p>
              <p className="text-white/30 text-xs text-center">Sign up first with the Register button</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
