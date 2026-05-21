import { useState } from 'react';
import { Map, Train, ArrowRight, Navigation, Info } from 'lucide-react';
import Header from '../components/Header';

const COACH_LAYOUT = [
  { id: 'EOG1', type: 'EOG', label: 'EOG', color: 'bg-gray-600' },
  { id: 'A1', type: '1A', label: '1A', color: 'bg-yellow-600' },
  { id: 'A2', type: '1A', label: '1A', color: 'bg-yellow-600' },
  { id: 'B1', type: '2A', label: '2A', color: 'bg-blue-600' },
  { id: 'B2', type: '2A', label: '2A', color: 'bg-blue-600' },
  { id: 'PC', type: 'Pantry', label: 'PC', color: 'bg-red-600' },
  { id: '3A-1', type: '3A', label: '3A', color: 'bg-teal-600' },
  { id: '3A-2', type: '3A', label: '3A', color: 'bg-teal-600' },
  { id: 'S1', type: 'SL', label: 'S1', color: 'bg-emerald-600' },
  { id: 'S2', type: 'SL', label: 'S2', color: 'bg-emerald-600' },
  { id: 'S3', type: 'SL', label: 'S3', color: 'bg-emerald-600' },
  { id: 'S4', type: 'SL', label: 'S4', color: 'bg-emerald-600' },
  { id: 'S5', type: 'SL', label: 'S5', color: 'bg-emerald-600' },
  { id: 'S6', type: 'SL', label: 'S6', color: 'bg-emerald-600' },
  { id: 'GEN1', type: 'GEN', label: 'GEN', color: 'bg-gray-500' },
  { id: 'GEN2', type: 'GEN', label: 'GEN', color: 'bg-gray-500' },
  { id: 'EOG2', type: 'EOG', label: 'EOG', color: 'bg-gray-600' },
];

const COACH_LEGEND = [
  { type: '1A', label: '1st AC', color: 'bg-yellow-600' },
  { type: '2A', label: '2nd AC', color: 'bg-blue-600' },
  { type: '3A', label: '3rd AC', color: 'bg-teal-600' },
  { type: 'SL', label: 'Sleeper', color: 'bg-emerald-600' },
  { type: 'GEN', label: 'General', color: 'bg-gray-500' },
  { type: 'Pantry', label: 'Pantry', color: 'bg-red-600' },
  { type: 'EOG', label: 'Engine/Guard', color: 'bg-gray-600' },
];

const PLATFORM_EXITS = [
  { name: 'Main Exit', direction: 'North', distance: '200m', accessible: true },
  { name: 'Exit Gate 2', direction: 'South', distance: '450m', accessible: true },
  { name: 'Footover Bridge', direction: 'Platform 2-4', distance: '50m', accessible: false },
  { name: 'Subway', direction: 'All Platforms', distance: '120m', accessible: true },
];

export default function StationMap() {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [myCoach, setMyCoach] = useState('S3');
  const myCoachIndex = COACH_LAYOUT.findIndex(c => c.id === myCoach);

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Station Map" showBack backTo="dashboard" />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Coach Number Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-[#FF9933]" /> Find Your Coach</h3>
          <div className="flex gap-3">
            <input value={myCoach} onChange={e => setMyCoach(e.target.value.toUpperCase())} placeholder="Enter coach (e.g. S3, B1)"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
            <div className="flex items-center gap-1 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg px-3 py-2.5">
              <Train className="w-4 h-4 text-[#FF9933]" />
              <span className="text-[#FF9933] text-sm">
                {myCoachIndex >= 0 ? `Position ${myCoachIndex + 1} from engine` : 'Not found'}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Visual */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center gap-2"><Train className="w-4 h-4 text-[#FF9933]" /> Platform Coach Position</h3>
            <span className="text-white/40 text-xs">Platform 3 — New Delhi</span>
          </div>

          {/* Direction arrows */}
          <div className="flex items-center justify-between text-white/40 text-xs mb-2">
            <div className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Engine end</div>
            <div className="flex items-center gap-1">Guard end <ArrowRight className="w-3 h-3 rotate-180" /></div>
          </div>

          {/* Platform track */}
          <div className="relative bg-white/5 border border-white/10 rounded-xl p-3 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {COACH_LAYOUT.map((coach, idx) => (
                <button key={coach.id} onClick={() => setSelectedCoach(selectedCoach === coach.id ? null : coach.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    coach.id === myCoach ? 'scale-110' : ''
                  } ${selectedCoach === coach.id ? 'scale-110' : ''}`}>
                  <div className={`w-10 h-12 ${coach.color} rounded-md flex items-center justify-center text-white text-xs font-bold relative border-2 ${
                    coach.id === myCoach ? 'border-[#FF9933]' : 'border-transparent'
                  } ${selectedCoach === coach.id ? 'ring-2 ring-white/40' : ''}`}>
                    {coach.label}
                    {coach.id === myCoach && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#FF9933]" />
                    )}
                  </div>
                  <span className="text-white/30 text-[9px]">{idx + 1}</span>
                </button>
              ))}
            </div>
            {/* Platform edge */}
            <div className="mt-3 h-2 bg-white/10 rounded-full w-full" />
            <p className="text-white/30 text-xs text-center mt-1">← Platform Edge →</p>
          </div>

          {/* Selected coach info */}
          {selectedCoach && (() => {
            const coach = COACH_LAYOUT.find(c => c.id === selectedCoach);
            return coach ? (
              <div className="mt-3 bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-8 h-8 ${coach.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>{coach.label}</div>
                <div>
                  <p className="text-white text-sm font-medium">{COACH_LEGEND.find(l => l.type === coach.type)?.label}</p>
                  <p className="text-white/40 text-xs">Coach ID: {coach.id} • Position {COACH_LAYOUT.findIndex(c => c.id === selectedCoach) + 1}</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Legend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <h3 className="text-white font-bold mb-3 text-sm">Coach Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COACH_LEGEND.map(({ type, label, color }) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 ${color} rounded flex-shrink-0`} />
                <span className="text-white/60 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform exits */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Map className="w-4 h-4 text-[#FF9933]" /> Station Exits & Routes</h3>
          <div className="space-y-2">
            {PLATFORM_EXITS.map(exit => (
              <div key={exit.name} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${exit.accessible ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    <Navigation className={`w-4 h-4 ${exit.accessible ? 'text-green-400' : 'text-yellow-400'}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{exit.name}</p>
                    <p className="text-white/40 text-xs">{exit.direction} • {exit.distance}</p>
                  </div>
                </div>
                {exit.accessible && <span className="text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">Accessible</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-300/80 text-xs">Your coach {myCoach} is near the {myCoachIndex < COACH_LAYOUT.length / 2 ? 'engine end — use Exit Gate 2' : 'guard end — use Main Exit'}.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
