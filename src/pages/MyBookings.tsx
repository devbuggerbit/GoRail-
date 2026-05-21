import { useState, useEffect } from 'react';
import { Ticket, Train, Calendar, ArrowRight, X } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string; pnr: string; status: string; journey_date: string; travel_class: string; total_fare: number;
  trains: { number: string; name: string } | null;
  from_station: { name: string; code: string } | null;
  to_station: { name: string; code: string } | null;
  booking_passengers: { name: string; age: number; coach_number: string | null; seat_number: string | null }[];
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400',
  waitlisted: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-white/10 text-white/40',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    supabase.from('bookings')
      .select('*,trains(number,name),from_station:stations!bookings_from_station_id_fkey(name,code),to_station:stations!bookings_to_station_id_fkey(name,code),booking_passengers(name,age,coach_number,seat_number)')
      .order('journey_date', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="My Bookings" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-white/40">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <button key={b.id} onClick={() => setSelected(b)} className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9933]/10 rounded-xl flex items-center justify-center">
                      <Train className="w-5 h-5 text-[#FF9933]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{b.trains?.name || 'Train'}</p>
                      <p className="text-white/40 text-xs font-mono">{b.pnr}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.completed}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-white text-sm font-semibold">{b.from_station?.code}</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                  <span className="text-white text-sm font-semibold">{b.to_station?.code}</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(b.journey_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/40 text-xs">{b.travel_class} • {b.booking_passengers.length} pax</span>
                  <span className="text-[#FF9933] font-bold text-sm">₹{b.total_fare}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Ticket Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f2347] border border-white/20 rounded-3xl overflow-hidden">
            {/* Ticket header */}
            <div className="bg-gradient-to-r from-[#FF9933] to-[#ff6b00] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs">PNR Number</p>
                  <p className="text-white text-2xl font-mono font-bold tracking-widest">{selected.pnr}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            {/* Ticket body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-white text-2xl font-bold">{selected.from_station?.code}</p>
                  <p className="text-white/50 text-xs">{selected.from_station?.name}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-px bg-white/20" />
                    <Train className="w-4 h-4 text-[#FF9933]" />
                    <div className="w-16 h-px bg-white/20" />
                  </div>
                  <span className="text-white/30 text-xs mt-1">{selected.travel_class}</span>
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl font-bold">{selected.to_station?.code}</p>
                  <p className="text-white/50 text-xs">{selected.to_station?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs">Train</p>
                  <p className="text-white text-sm font-medium">{selected.trains?.number}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs">Date</p>
                  <p className="text-white text-sm font-medium">{new Date(selected.journey_date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              {/* Passengers */}
              <div>
                <p className="text-white/50 text-xs mb-2 font-medium uppercase tracking-wide">Passengers</p>
                <div className="space-y-2">
                  {selected.booking_passengers.map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-white text-sm">{p.name}</span>
                        <span className="text-white/40 text-xs ml-2">{p.age}y</span>
                      </div>
                      {p.coach_number && p.seat_number && (
                        <span className="text-[#FF9933] text-xs font-mono">{p.coach_number}/{p.seat_number}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#FF9933]/10 rounded-xl px-4 py-3">
                <span className="text-white/60 text-sm">Total Paid</span>
                <span className="text-[#FF9933] font-bold text-lg">₹{selected.total_fare}</span>
              </div>
            </div>
            {/* Tear line */}
            <div className="relative">
              <div className="border-t border-dashed border-white/20 mx-5" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#060e1e] rounded-r-full -ml-0" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#060e1e] rounded-l-full -mr-0" />
            </div>
            <div className="p-5">
              <button onClick={() => setSelected(null)}
                className="w-full border border-white/20 text-white/60 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
