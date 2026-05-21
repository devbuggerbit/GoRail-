import { useEffect, useState } from 'react';
import {
  Search, Ticket, Map, UtensilsCrossed, Trash2, AlertTriangle,
  Zap, Radio, Train, Clock, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '../lib/supabase';
import { t } from '../lib/i18n';

interface ActiveBooking {
  pnr: string;
  status: string;
  journey_date: string;
  travel_class: string;
  trains: { number: string; name: string; delay_minutes: number; status: string } | null;
  from_station: { name: string; code: string } | null;
  to_station: { name: string; code: string } | null;
}

const FEATURE_CARDS = [
  {
    id: 'search-train' as const,
    title: 'searchTrain',
    icon: Search,
    bg: 'from-blue-600/20 to-blue-800/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    desc: 'Find trains, schedules & live status',
  },
  {
    id: 'book-ticket' as const,
    title: 'bookTicket',
    icon: Ticket,
    bg: 'from-[#FF9933]/20 to-orange-800/10',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-[#FF9933]',
    desc: 'Book SL, 3A, 2A, 1A tickets',
  },
  {
    id: 'station-map' as const,
    title: 'stationMap',
    icon: Map,
    bg: 'from-emerald-600/20 to-emerald-800/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    desc: 'Coach position & platform guide',
  },
  {
    id: 'order-food' as const,
    title: 'orderFood',
    icon: UtensilsCrossed,
    bg: 'from-rose-600/20 to-rose-800/10',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    desc: 'Hot meals delivered to your berth',
  },
  {
    id: 'cleaning-request' as const,
    title: 'cleaningStaff',
    icon: Trash2,
    bg: 'from-teal-600/20 to-teal-800/10',
    border: 'border-teal-500/20',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-400',
    desc: 'Report dirty toilets or washroom issues',
  },
  {
    id: 'file-complaint' as const,
    title: 'fileComplaint',
    icon: AlertTriangle,
    bg: 'from-yellow-600/20 to-yellow-800/10',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    desc: 'Seat occupied or security issue',
  },
  {
    id: 'technical-issue' as const,
    title: 'technicalIssue',
    icon: Zap,
    bg: 'from-purple-600/20 to-purple-800/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    desc: 'AC, fan, light or charging issues',
  },
  {
    id: 'train-updates' as const,
    title: 'trainUpdates',
    icon: Radio,
    bg: 'from-cyan-600/20 to-cyan-800/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    desc: 'Live delay reasons & updates',
  },
];

export default function Dashboard() {
  const { userProfile, language } = useAuth();
  const { navigate } = useNavigation();
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`*, trains(number,name,delay_minutes,status), from_station:stations!bookings_from_station_id_fkey(name,code), to_station:stations!bookings_to_station_id_fkey(name,code)`)
        .in('status', ['confirmed', 'waitlisted'])
        .gte('journey_date', new Date().toISOString().split('T')[0])
        .order('journey_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      setActiveBooking(data);
      setLoadingBooking(false);
    };
    fetchBooking();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{greeting}, {userProfile?.name?.split(' ')[0] || 'Traveler'}</h1>
          <p className="text-white/50 text-sm mt-0.5">Where are you traveling today?</p>
        </div>

        {/* Active Booking Card */}
        {!loadingBooking && (
          <div className="mb-6">
            {activeBooking ? (
              <div className="bg-gradient-to-r from-[#FF9933]/20 to-[#ff6b00]/10 border border-[#FF9933]/30 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9933]/20 rounded-xl flex items-center justify-center">
                      <Train className="w-5 h-5 text-[#FF9933]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">
                          {activeBooking.trains?.name || 'Train'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeBooking.trains?.status === 'on_time'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {activeBooking.trains?.status === 'on_time' ? 'On Time' : `+${activeBooking.trains?.delay_minutes}m`}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5">
                        PNR: <span className="text-white/70 font-mono">{activeBooking.pnr}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF9933] text-xs font-medium">{activeBooking.travel_class}</p>
                    <p className="text-white/50 text-xs">{new Date(activeBooking.journey_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{activeBooking.from_station?.code}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-white/20" />
                      <Train className="w-3 h-3 text-white/40" />
                      <div className="h-px flex-1 bg-white/20" />
                    </div>
                    <span className="text-white font-semibold text-sm">{activeBooking.to_station?.code}</span>
                  </div>
                  <button
                    onClick={() => navigate('pnr-status')}
                    className="text-[#FF9933] text-xs border border-[#FF9933]/40 rounded-lg px-3 py-1.5 hover:bg-[#FF9933]/10 transition-colors"
                  >
                    View Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">No upcoming journeys</p>
                    <p className="text-white/30 text-xs">Book a ticket to get started</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('book-ticket')}
                  className="bg-[#FF9933] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#ff8c1a] transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Trains Today', value: '12,000+', icon: Train, color: 'text-blue-400' },
            { label: 'Stations', value: '7,349', icon: Map, color: 'text-emerald-400' },
            { label: 'Live Updates', value: 'Active', icon: TrendingUp, color: 'text-[#FF9933]' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <p className={`text-sm font-bold ${color}`}>{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURE_CARDS.map(({ id, title, icon: Icon, bg, border, iconBg, iconColor, desc }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 text-left hover:scale-[1.03] hover:shadow-lg transition-all group`}
            >
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{t(title as Parameters<typeof t>[0], language)}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
