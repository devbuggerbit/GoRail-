import { useState } from 'react';
import { Train, Bell, User, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation, Page } from '../context/NavigationContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: Page;
}

export default function Header({ title, showBack, backTo }: HeaderProps) {
  const { userProfile, staffProfile, signOut, language } = useAuth();
  const { navigate, goBack } = useNavigation();
  const [showMenu, setShowMenu] = useState(false);

  const name = userProfile?.name || staffProfile?.name || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else goBack();
  };

  return (
    <header className="bg-[#0a1628] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={handleBack} className="text-white/60 hover:text-white mr-1 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <div className="w-7 h-7 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-lg flex items-center justify-center">
              <Train className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">{title || 'RailSaathi'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('my-bookings')}
            className="relative p-2 text-white/60 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF9933] rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <span className="text-white text-sm hidden sm:block max-w-[80px] truncate">{name}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0f2347] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white text-sm font-medium">{name}</p>
                  <p className="text-white/40 text-xs">{userProfile?.email || staffProfile?.role}</p>
                </div>
                <button
                  onClick={() => { setShowMenu(false); navigate('my-bookings'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Bookings
                </button>
                <button
                  onClick={() => { setShowMenu(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
