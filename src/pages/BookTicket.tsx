import { useState, useEffect } from 'react';
import { Check, Ticket, Users, CreditCard, Train, ChevronRight, Plus, Minus } from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

interface Station { id: string; code: string; name: string; }
interface PassengerForm { name: string; age: string; gender: string; berth: string; }

const CLASSES = [
  { code: 'SL', label: 'Sleeper', desc: '72 berths • No AC', baseRate: 0.5 },
  { code: '3A', label: '3rd AC', desc: '64 berths • AC', baseRate: 1.2 },
  { code: '2A', label: '2nd AC', desc: '46 berths • AC', baseRate: 1.8 },
  { code: '1A', label: '1st AC', desc: '18 berths • Premium', baseRate: 3.0 },
];

const BERTHS = ['lower', 'middle', 'upper', 'side_lower', 'side_upper', 'no_preference'];
const STEPS = ['Journey', 'Class', 'Passengers', 'Payment'];

function generatePNR() {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export default function BookTicket() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [step, setStep] = useState(0);
  const [stations, setStations] = useState<Station[]>([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('SL');
  const [passengers, setPassengers] = useState<PassengerForm[]>([{ name: '', age: '', gender: 'M', berth: 'no_preference' }]);
  const [payMethod, setPayMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedPNR, setConfirmedPNR] = useState('');

  useEffect(() => {
    supabase.from('stations').select('id,code,name').order('name').then(({ data }) => { if (data) setStations(data); });
  }, []);

  const distance = 600;
  const classInfo = CLASSES.find(c => c.code === selectedClass)!;
  const farePerPax = Math.round(distance * classInfo.baseRate + 50);
  const totalFare = farePerPax * passengers.length;

  const addPassenger = () => setPassengers(p => [...p, { name: '', age: '', gender: 'M', berth: 'no_preference' }]);
  const removePassenger = (i: number) => setPassengers(p => p.filter((_, idx) => idx !== i));
  const updatePassenger = (i: number, field: keyof PassengerForm, val: string) =>
    setPassengers(p => p.map((px, idx) => idx === i ? { ...px, [field]: val } : px));

  const handleBooking = async () => {
    if (!user) return;
    setLoading(true);
    const pnr = generatePNR();
    const { data: trains } = await supabase.from('trains').select('id').limit(1).maybeSingle();
    const { data: booking, error } = await supabase.from('bookings').insert({
      pnr, user_id: user.id,
      train_id: trains?.id || null,
      from_station_id: fromId || null,
      to_station_id: toId || null,
      journey_date: date,
      travel_class: selectedClass,
      total_fare: totalFare,
      payment_method: payMethod,
      payment_status: 'paid',
    }).select().maybeSingle();

    if (booking) {
      await supabase.from('booking_passengers').insert(
        passengers.map(p => ({
          booking_id: booking.id,
          name: p.name,
          age: parseInt(p.age) || 25,
          gender: p.gender,
          berth_preference: p.berth,
          seat_number: `${Math.floor(Math.random() * 72) + 1}`,
          berth_assigned: p.berth === 'no_preference' ? 'lower' : p.berth,
          coach_number: `S${Math.floor(Math.random() * 12) + 1}`,
        }))
      );
      setConfirmedPNR(pnr);
    }
    setLoading(false);
  };

  if (confirmedPNR) {
    return (
      <div className="min-h-screen bg-[#060e1e]">
        <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
        <Header title="Booking Confirmed" showBack backTo="dashboard" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-white/50 mb-6">Your ticket has been booked successfully</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-white/40 text-sm mb-1">PNR Number</p>
            <p className="text-3xl font-mono font-bold text-[#FF9933] tracking-widest">{confirmedPNR}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-left">
              <div><p className="text-white/40 text-xs">Class</p><p className="text-white text-sm font-medium">{selectedClass}</p></div>
              <div><p className="text-white/40 text-xs">Passengers</p><p className="text-white text-sm font-medium">{passengers.length}</p></div>
              <div><p className="text-white/40 text-xs">Date</p><p className="text-white text-sm font-medium">{new Date(date).toLocaleDateString('en-IN')}</p></div>
              <div><p className="text-white/40 text-xs">Total Fare</p><p className="text-[#FF9933] text-sm font-bold">₹{totalFare}</p></div>
            </div>
          </div>
          <button onClick={() => navigate('dashboard')}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1e]">
      <div className="h-1 w-full flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>
      <Header title="Book Ticket" showBack backTo="dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Stepper */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-[#FF9933] text-white' : i === step ? 'bg-[#FF9933] text-white ring-2 ring-[#FF9933]/40' : 'bg-white/10 text-white/30'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i === step ? 'text-[#FF9933]' : 'text-white/30'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 mb-4 ${i < step ? 'bg-[#FF9933]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Journey Details */}
        {step === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Train className="w-5 h-5 text-[#FF9933]" /> Journey Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">From Station</label>
                <select value={fromId} onChange={e => setFromId(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]">
                  <option value="" className="bg-[#0f2347]">Select</option>
                  {stations.map(s => <option key={s.id} value={s.id} className="bg-[#0f2347]">{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">To Station</label>
                <select value={toId} onChange={e => setToId(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]">
                  <option value="" className="bg-[#0f2347]">Select</option>
                  {stations.map(s => <option key={s.id} value={s.id} className="bg-[#0f2347]">{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Journey Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
              </div>
            </div>
            <button onClick={() => setStep(1)} disabled={!fromId || !toId}
              className="w-full mt-4 bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: Class Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Ticket className="w-5 h-5 text-[#FF9933]" /> Select Travel Class</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {CLASSES.map(cls => (
                <button key={cls.code} onClick={() => setSelectedClass(cls.code)}
                  className={`p-4 rounded-xl border text-left transition-all ${selectedClass === cls.code ? 'border-[#FF9933] bg-[#FF9933]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <p className={`font-bold text-lg ${selectedClass === cls.code ? 'text-[#FF9933]' : 'text-white'}`}>{cls.code}</p>
                  <p className="text-white/70 text-sm">{cls.label}</p>
                  <p className="text-white/40 text-xs">{cls.desc}</p>
                  <p className={`font-bold text-sm mt-2 ${selectedClass === cls.code ? 'text-[#FF9933]' : 'text-white/60'}`}>₹{Math.round(distance * cls.baseRate + 50)}/pax</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-white/20 text-white py-3 rounded-xl hover:bg-white/5">Back</button>
              <button onClick={() => setStep(2)} className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-xl">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Passenger Details */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-[#FF9933]" /> Passengers</h3>
              <button onClick={addPassenger} disabled={passengers.length >= 6}
                className="flex items-center gap-1 bg-[#FF9933]/10 border border-[#FF9933]/30 text-[#FF9933] text-xs px-3 py-1.5 rounded-lg hover:bg-[#FF9933]/20 disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {passengers.map((px, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/60 text-sm">Passenger {i + 1}</span>
                    {passengers.length > 1 && (
                      <button onClick={() => removePassenger(i)} className="text-red-400/60 hover:text-red-400 text-xs">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input value={px.name} onChange={e => updatePassenger(i, 'name', e.target.value)} placeholder="Full Name"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9933]" />
                    </div>
                    <input value={px.age} onChange={e => updatePassenger(i, 'age', e.target.value)} placeholder="Age" type="number" min="1" max="120"
                      className="bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9933]" />
                    <select value={px.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9933]">
                      <option value="M" className="bg-[#0f2347]">Male</option>
                      <option value="F" className="bg-[#0f2347]">Female</option>
                      <option value="T" className="bg-[#0f2347]">Other</option>
                    </select>
                    <div className="col-span-2">
                      <select value={px.berth} onChange={e => updatePassenger(i, 'berth', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9933]">
                        {BERTHS.map(b => <option key={b} value={b} className="bg-[#0f2347]">{b.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-white/70 text-sm">Total Fare ({passengers.length} pax)</span>
              <span className="text-[#FF9933] font-bold text-lg">₹{totalFare}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/20 text-white py-3 rounded-xl hover:bg-white/5">Back</button>
              <button onClick={() => setStep(3)} disabled={passengers.some(p => !p.name || !p.age)} className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-semibold py-3 rounded-xl disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#FF9933]" /> Payment</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Base Fare ({passengers.length} pax)</span>
                <span className="text-white">₹{totalFare}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Convenience Fee</span>
                <span className="text-white">₹{Math.round(totalFare * 0.02)}</span>
              </div>
              <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
                <span className="text-white">Total Amount</span>
                <span className="text-[#FF9933] text-lg">₹{Math.round(totalFare * 1.02)}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {['UPI', 'Card', 'Net Banking'].map(method => (
                <button key={method} onClick={() => setPayMethod(method)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${payMethod === method ? 'border-[#FF9933] bg-[#FF9933]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === method ? 'border-[#FF9933]' : 'border-white/30'}`}>
                    {payMethod === method && <div className="w-2 h-2 bg-[#FF9933] rounded-full" />}
                  </div>
                  <span className={`font-medium text-sm ${payMethod === method ? 'text-white' : 'text-white/60'}`}>{method}</span>
                </button>
              ))}
              {payMethod === 'UPI' && (
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. name@upi)"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9933]" />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/20 text-white py-3 rounded-xl hover:bg-white/5">Back</button>
              <button onClick={handleBooking} disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#ff6b00] text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Processing...' : `Pay ₹${Math.round(totalFare * 1.02)}`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
