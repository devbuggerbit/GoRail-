import { Train, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffHeaderProps {
  role: string;
  color?: string;
}

const COLOR_MAP: Record<string, string> = {
  teal: 'from-teal-600 to-teal-800',
  blue: 'from-blue-600 to-blue-800',
  red: 'from-red-600 to-red-800',
  yellow: 'from-yellow-600 to-yellow-800',
  green: 'from-green-600 to-green-800',
  orange: 'from-orange-600 to-orange-800',
};

export default function StaffHeader({ role, color = 'blue' }: StaffHeaderProps) {
  const { staffProfile, signOut } = useAuth();
  const gradient = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <header className={`bg-gradient-to-r ${gradient} border-b border-white/10 sticky top-0 z-50`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">RailSaathi Staff</p>
            <p className="text-white/60 text-xs">{role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-white/70 text-sm hidden sm:block">{staffProfile?.name || 'Staff'}</p>
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button onClick={signOut} className="p-2 text-white/60 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
