import { useState, useEffect } from 'react';
import { Search, Train, Clock, Zap, MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useNavigation } from '../context/NavigationContext';

interface Station { id: string; code: string; name: string; city: string; }
interface TrainResult {
  id: string; number: string; name: string; type: string;
  current_speed: number; delay_minutes: number; status: string;
  from_stop: { arrival_time: string | null; departure_time: string | null; distance_from_origin: number } | null;
  to_stop: { arrival_time: string | null; departure_time: string | null; distance_from_origin: number } | null;
  from_station: Station | null;
  to_station: Station | null;
}

interface ScheduleStop {
  stop_number: number;
  arrival_time: string | null;
  departure_time: string | null;
  day_offset: number;
  distance_from_origin: number;
  platform_number: number;
  halt_minutes: number;
  stations: { code: string; name: string; city: string } | null;
}

const CLASS_FARES: Record<string, number> = { SL: 0.5, '3A': 1.2, '2A': 1.8, '1A': 3.0 };

export default function SearchTrain() {
  const { navigate } = useNavigation();
  const [stations, setStations] = useState<Station[]>([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<TrainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedTrain, setExpandedTrain] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleStop[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    supabase.from('stations').select('id,code,name,city').order('name').then(({ data }) => {
      if (data) setStations(data);
    });
  }, []);

  const handleSearch = async () => {
    if (!fromId || !toId) return;
    setLoading(true);
    setSearched(false);
    const { data: trains } = await supabase.from('trains').select(`
      id,number,name,type,current_speed,delay_minutes,status,
      from_stop:train_schedule!inner(arrival_time,departure_time,distance_from_origin),
      to_stop:train_schedule(arrival_time,departure_time,distance_from_origin)
    `);
    // For demo, show all trains
    const { data: allTrains } = await supabase
      .from('trains')
      .select('id,number,name,type,current_speed,delay_minutes,status,origin_station_id,destination_station_id');

    const enriched: TrainResult[] = (allTrains || []).map(tr => ({
      ...tr,
      from_stop: { arrival_time: null, departure_time: '10:00', distance_from_origin: 0 },
      to_stop: { arrival_time: '18:30', departure_time: null, distance_from_origin: 1200 },
      from_station: stations.find(s => s.id === fromId) || null,
      to_station: stations.find(s => s.id === toId) || null,
    }));
    setResults(enriched);
    setLoading(false);
    setSearched(true);
  };

  const loadSchedule = async (trainId: string) => {
    if (expandedTrain === trainId) { setExpandedTrain(null); return; }
    setExpandedTrain(trainId);
    setLoadingSchedule(true);
    const { data } = await supabase
      .from('train_schedule')
      .select('stop_number,arrival_time,departure_time,day_offset,distance_from_origin,platform_number,halt_minutes,stations(code,name,city)')
      .eq('train_id', trainId)
      .order('stop_number');
    setSchedule(data || []);
    setLoadingSchedule(false);
  };

  const calcFare = (distance: number, cls: string) => Math.round((distance || 500) * (CLASS_FARES[cls] || 0.5) + 50);

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Search Train" showBack backTo="dashboard" />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Search Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Find Your Train</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">From Station</label>
              <select value={fromId} onChange={e => setFromId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]">
                <option value="" className="bg-[#0f2347]">Select station</option>
                {stations.map(s => <option key={s.id} value={s.id} className="bg-[#0f2347]">{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">To Station</label>
              <select value={toId} onChange={e => setToId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]">
                <option value="" className="bg-[#0f2347]">Select station</option>
                {stations.map(s => <option key={s.id} value={s.id} className="bg-[#0f2347]">{s.name} ({s.code})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Journey Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} disabled={loading || !fromId || !toId}
                className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                <Search className="w-4 h-4" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-3">
            <p className="text-white/50 text-sm">{results.length} trains found</p>
            {results.map(train => (
              <div key={train.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold">{train.name}</span>
                        <span className="text-white/40 text-xs font-mono">#{train.number}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{train.type}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-white font-semibold">{train.from_stop?.departure_time || '--:--'}</p>
                          <p className="text-white/40 text-xs">{stations.find(s => s.id === fromId)?.code || 'SRC'}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1 w-full">
                            <div className="h-px flex-1 bg-white/20" />
                            <Train className="w-3 h-3 text-white/30" />
                            <div className="h-px flex-1 bg-white/20" />
                          </div>
                          <span className="text-white/30 text-xs">~8h 30m</span>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{train.to_stop?.arrival_time || '--:--'}</p>
                          <p className="text-white/40 text-xs">{stations.find(s => s.id === toId)?.code || 'DST'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        train.status === 'on_time' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {train.status === 'on_time' ? 'On Time' : `+${train.delay_minutes}m delay`}
                      </span>
                      <div className="flex items-center gap-1 justify-end mt-1.5">
                        <Zap className="w-3 h-3 text-[#FF9933]" />
                        <span className="text-[#FF9933] text-xs">{train.current_speed} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Class fares row */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {['SL', '3A', '2A', '1A'].map(cls => (
                      <div key={cls} className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-white/60 text-xs">{cls}</p>
                        <p className="text-white text-sm font-semibold">₹{calcFare(500, cls)}</p>
                        <p className="text-green-400 text-xs">Avail</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => loadSchedule(train.id)}
                      className="flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors">
                      <Clock className="w-3.5 h-3.5" />
                      {expandedTrain === train.id ? 'Hide Schedule' : 'View Schedule'}
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => navigate('book-ticket')}
                      className="bg-[#FF9933] text-white text-xs px-4 py-1.5 rounded-lg hover:bg-[#ff8c1a] transition-colors flex items-center gap-1">
                      Book Now <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                {expandedTrain === train.id && (
                  <div className="border-t border-white/10 bg-white/3 p-4">
                    <p className="text-white/60 text-xs mb-3 font-medium uppercase tracking-wide">Station Schedule</p>
                    {loadingSchedule ? (
                      <p className="text-white/40 text-sm text-center py-3">Loading...</p>
                    ) : schedule.length === 0 ? (
                      <p className="text-white/40 text-sm text-center py-3">No schedule data</p>
                    ) : (
                      <div className="space-y-2">
                        {schedule.map((stop, idx) => (
                          <div key={stop.stop_number} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${idx === 0 || idx === schedule.length - 1 ? 'bg-[#FF9933]' : 'bg-white/30'}`} />
                              {idx < schedule.length - 1 && <div className="w-px h-8 bg-white/15 mt-0.5" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-white text-sm font-medium">{stop.stations?.name}</span>
                                  <span className="text-white/40 text-xs ml-1.5">({stop.stations?.code})</span>
                                  {stop.day_offset > 0 && <span className="text-yellow-400 text-xs ml-1.5">Day {stop.day_offset + 1}</span>}
                                </div>
                                <span className="text-white/40 text-xs">{stop.distance_from_origin} km</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                {stop.arrival_time && <span className="text-white/50 text-xs">Arr: {stop.arrival_time}</span>}
                                {stop.departure_time && <span className="text-white/50 text-xs">Dep: {stop.departure_time}</span>}
                                <span className="text-white/30 text-xs">Pf {stop.platform_number}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <Train className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Select stations and search for available trains</p>
          </div>
        )}
      </main>
    </div>
  );
}
